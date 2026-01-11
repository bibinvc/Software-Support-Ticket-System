const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'customer' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    // MFA fields
    mfa_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    mfa_secret: { type: DataTypes.STRING }, // Encrypted TOTP secret
    // Additional fields for sharing economy
    phone: { type: DataTypes.STRING(50) },
    address: { type: DataTypes.TEXT },
    bio: { type: DataTypes.TEXT },
    rating: { type: DataTypes.DECIMAL(3,2), defaultValue: 0.00 },
    total_orders: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  User.prototype.verifyPassword = function(password){
    return bcrypt.compare(password, this.password_hash);
  };

  // Encrypt MFA secret before storing
  User.beforeSave(async (user) => {
    if (user.changed('mfa_secret') && user.mfa_secret && !user.mfa_secret.startsWith('$encrypted$')) {
      const algorithm = 'aes-256-gcm';
      const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex');
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      
      let encrypted = cipher.update(user.mfa_secret, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      
      user.mfa_secret = `$encrypted$${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }
  });

  // Decrypt MFA secret
  User.prototype.getMfaSecret = function() {
    if (!this.mfa_secret || !this.mfa_secret.startsWith('$encrypted$')) {
      return this.mfa_secret;
    }
    
    try {
      const parts = this.mfa_secret.substring(11).split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      const algorithm = 'aes-256-gcm';
      const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error('Error decrypting MFA secret:', err);
      return null;
    }
  };

  // Hash password before creating user (if plain password provided)
  User.beforeCreate(async (user) => {
    if (user.password_hash && !user.password_hash.startsWith('$2b$')) {
      // Only hash if it's not already a bcrypt hash (starts with $2b$)
      user.password_hash = await bcrypt.hash(user.password_hash, 12); // Increased rounds for better security
    }
  });

  // Ensure sensitive fields are never returned in JSON
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password_hash;
    delete values.mfa_secret; // Never expose encrypted secret
    return values;
  };

  return User;
};
