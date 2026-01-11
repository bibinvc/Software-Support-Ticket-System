// MFA (Multi-Factor Authentication) utilities using TOTP
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate a secret for TOTP
const generateSecret = () => {
  return authenticator.generateSecret();
};

// Generate QR code for MFA setup
const generateQRCode = async (email, secret, serviceName = 'Sharing Economy Platform') => {
  const otpauth = authenticator.keyuri(email, serviceName, secret);
  try {
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    return qrCodeUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
};

// Verify TOTP token
const verifyToken = (token, secret) => {
  try {
    return authenticator.verify({ token, secret });
  } catch (err) {
    console.error('Error verifying token:', err);
    return false;
  }
};

// Generate backup codes (for account recovery)
const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-digit backup codes
    const code = crypto.randomInt(10000000, 99999999).toString();
    codes.push(code);
  }
  return codes;
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateBackupCodes
};

