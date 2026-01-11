const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, UserSession } = require('../models');

// Hash token for storage
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Authenticate user via JWT token
const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing authorization header' });
  
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Check if session is revoked
    const tokenHash = hashToken(token);
    const session = await UserSession.findOne({
      where: { token_hash: tokenHash, revoked: false }
    });
    
    if (!session || new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Token expired or revoked' });
    }
    
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    req.user = user;
    req.tokenHash = tokenHash;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Require specific role(s)
const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Require MFA if enabled
const requireMFA = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  
  if (req.user.mfa_enabled) {
    const { mfaToken } = req.body;
    if (!mfaToken) {
      return res.status(403).json({ 
        error: 'MFA required', 
        mfaRequired: true 
      });
    }
    
    // MFA verification would be done here
    // For now, we'll handle it in the login route
  }
  
  next();
};

// Revoke session (logout)
const revokeSession = async (tokenHash) => {
  try {
    await UserSession.update(
      { revoked: true },
      { where: { token_hash: tokenHash } }
    );
  } catch (err) {
    console.error('Error revoking session:', err);
  }
};

module.exports = { 
  authenticate, 
  requireRole, 
  requireMFA,
  revokeSession,
  hashToken
};
