// Input validation and sanitization middleware
const validator = require('validator');
const { body, validationResult } = require('express-validator');

// Sanitize string input to prevent XSS
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  // Remove potentially dangerous characters and encode HTML entities
  return validator.escape(validator.stripLow(str.trim()));
};

// Validate email
const validateEmail = (email) => {
  return validator.isEmail(email) ? validator.normalizeEmail(email) : null;
};

// Validate and sanitize input object
const sanitizeInput = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Express validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      // Sanitize all string inputs
      if (req.body) {
        req.body = sanitizeInput(req.body);
      }
      if (req.query) {
        req.query = sanitizeInput(req.query);
      }
      return next();
    }
    
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  };
};

// Common validation rules
const registerRules = [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = {
  sanitizeString,
  validateEmail,
  sanitizeInput,
  validate,
  registerRules,
  loginRules
};

