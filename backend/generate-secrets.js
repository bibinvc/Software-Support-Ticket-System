#!/usr/bin/env node

/**
 * Helper script to generate secure secrets for environment variables
 * Usage: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Secrets for Sharing Economy Platform\n');
console.log('=' .repeat(60));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📝 JWT_SECRET (for JWT token signing):');
console.log(jwtSecret);

// Generate Encryption Key (32 bytes = 64 hex characters for AES-256)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('\n🔒 ENCRYPTION_KEY (for MFA secret encryption):');
console.log(encryptionKey);

console.log('\n' + '='.repeat(60));
console.log('\n✅ Copy these values to your backend/.env file');
console.log('⚠️  Keep these secrets secure and never commit them to version control!\n');

