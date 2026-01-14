const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, UserSession } = require('../models');
const { authenticate, hashToken } = require('../middleware/auth');
const { validate, registerRules, loginRules } = require('../middleware/validation');
const { generateSecret, generateQRCode, verifyToken } = require('../middleware/mfa');
const { authLimiter } = require('../middleware/security');
const { createAuditLog } = require('../middleware/audit');

const router = express.Router();

// Register new user
router.post('/register', authLimiter, validate(registerRules), async (req, res) => {
  try {
    const { name, email, password, role = 'client' } = req.body;
    
    // Validate role (public registration is client only)
    if (role !== 'client') {
      return res.status(400).json({ error: 'Invalid role. Must be client' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const user = await User.create({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      password_hash: password,
      role: role
    });
    
    // Log registration
    await createAuditLog('user', user.id, 'registered', user.id, {
      email: user.email,
      role: user.role
    });
    
    return res.status(201).json({ 
      id: user.id, 
      name: user.name,
      email: user.email,
      role: user.role,
      message: 'Account created successfully' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(400).json({ 
      error: err.message || 'Registration failed. Please try again.' 
    });
  }
});

// Login user
router.post('/login', authLimiter, validate(loginRules), async (req, res) => {
  try {
    const { email, password, mfaToken } = req.body;
    
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact administrator.' });
    }
    
    const ok = await user.verifyPassword(password);
    
    if (!ok) {
      // Log failed login attempt
      await createAuditLog('user', user.id, 'login_failed', null, {
        email: user.email,
        reason: 'invalid_password'
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check MFA if enabled
    if (user.mfa_enabled) {
      if (!mfaToken) {
        return res.status(403).json({ 
          error: 'MFA token required', 
          mfaRequired: true 
        });
      }
      
      const secret = user.getMfaSecret();
      if (!secret || !verifyToken(mfaToken, secret)) {
        await createAuditLog('user', user.id, 'login_failed', null, {
          email: user.email,
          reason: 'invalid_mfa_token'
        });
        return res.status(401).json({ error: 'Invalid MFA token' });
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, role: user.role, mfa: user.mfa_enabled }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );
    
    // Create session record
    const tokenHash = hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    await UserSession.create({
      user_id: user.id,
      token_hash: tokenHash,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent'),
      expires_at: expiresAt
    });
    
    // Log successful login
    await createAuditLog('user', user.id, 'login_success', user.id, {
      email: user.email,
      ip_address: req.ip
    });
    
    return res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        mfa_enabled: user.mfa_enabled
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Setup MFA
router.post('/mfa/setup', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA is already enabled' });
    }
    
    const secret = generateSecret();
    user.mfa_secret = secret; // Will be encrypted by model hook
    await user.save();
    
    const qrCode = await generateQRCode(user.email, secret);
    
    return res.json({
      secret, // Return plain secret for QR code generation (one-time)
      qrCode,
      message: 'Scan QR code with authenticator app'
    });
  } catch (err) {
    console.error('MFA setup error:', err);
    return res.status(500).json({ error: 'Failed to setup MFA' });
  }
});

// Enable MFA (after verifying token)
router.post('/mfa/enable', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;
    
    if (!token) {
      return res.status(400).json({ error: 'MFA token is required' });
    }
    
    if (user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA is already enabled' });
    }
    
    const secret = user.getMfaSecret();
    if (!secret || !verifyToken(token, secret)) {
      return res.status(401).json({ error: 'Invalid MFA token' });
    }
    
    user.mfa_enabled = true;
    await user.save();
    
    await createAuditLog('user', user.id, 'mfa_enabled', user.id, {
      email: user.email
    });
    
    return res.json({ message: 'MFA enabled successfully' });
  } catch (err) {
    console.error('MFA enable error:', err);
    return res.status(500).json({ error: 'Failed to enable MFA' });
  }
});

// Disable MFA
router.post('/mfa/disable', authenticate, async (req, res) => {
  try {
    const { password, mfaToken } = req.body;
    const user = req.user;
    
    if (!user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA is not enabled' });
    }
    
    // Verify password
    const ok = await user.verifyPassword(password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Verify MFA token
    const secret = user.getMfaSecret();
    if (!secret || !verifyToken(mfaToken, secret)) {
      return res.status(401).json({ error: 'Invalid MFA token' });
    }
    
    user.mfa_enabled = false;
    user.mfa_secret = null;
    await user.save();
    
    await createAuditLog('user', user.id, 'mfa_disabled', user.id, {
      email: user.email
    });
    
    return res.json({ message: 'MFA disabled successfully' });
  } catch (err) {
    console.error('MFA disable error:', err);
    return res.status(500).json({ error: 'Failed to disable MFA' });
  }
});

// Logout (revoke session)
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { revokeSession } = require('../middleware/auth');
    await revokeSession(req.tokenHash);
    
    await createAuditLog('user', req.user.id, 'logout', req.user.id, {
      email: req.user.email
    });
    
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
