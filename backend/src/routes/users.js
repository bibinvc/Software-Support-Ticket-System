const express = require('express');
const { User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, requireRole(['admin']), apiLimiter, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash', 'mfa_secret'] },
      order: [['created_at', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get agents list (admin assignments)
router.get('/agents/list', authenticate, requireRole(['admin']), apiLimiter, async (req, res) => {
  try {
    const agents = await User.findAll({
      where: { role: { [Op.in]: ['admin', 'agent'] }, is_active: true },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']]
    });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID (admin or self)
router.get('/:id', authenticate, apiLimiter, async (req, res) => {
  try {
    // Users can view their own profile, admins can view anyone
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash', 'mfa_secret'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user (admin only)
router.post('/', authenticate, requireRole(['admin']), apiLimiter, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!['client', 'agent', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    // Pass plain password - the model's beforeCreate hook will hash it automatically
    const user = await User.create({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      password_hash: password,  // Plain password - beforeCreate hook will hash it
      role: role || 'client' 
    });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user
router.patch('/:id', authenticate, apiLimiter, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Users can only update themselves, unless admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // NEVER update password through this route - use /:id/password endpoint instead
    const { name, email, role, is_active, password } = req.body;
    
    // Security: Ignore password if sent here (must use password endpoint)
    if (password) {
      console.warn(`Security: Password update attempted via PATCH /:id for user ${req.params.id}. Use /:id/password endpoint instead.`);
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && req.user.role === 'admin' && ['client', 'agent', 'admin'].includes(role)) {
      user.role = role;
    }
    if (is_active !== undefined && req.user.role === 'admin') user.is_active = is_active;

    await user.save();
    // NEVER return password_hash or mfa_secret in response
    const userJson = user.toJSON();
    res.json(userJson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update password
router.patch('/:id/password', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Users can only update their own password, unless admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { password, old_password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    // Verify old password for non-admin users
    if (req.user.role !== 'admin') {
      const valid = await user.verifyPassword(old_password);
      if (!valid) return res.status(401).json({ error: 'Invalid current password' });
    }

    user.password_hash = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

