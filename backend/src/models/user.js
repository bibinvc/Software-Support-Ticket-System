const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  User.prototype.verifyPassword = function(password){
    return bcrypt.compare(password, this.password_hash);
  };

  // Hash password before creating user (if plain password provided)
  User.beforeCreate(async (user) => {
    if (user.password_hash && !user.password_hash.startsWith('$2b$')) {
      // Only hash if it's not already a bcrypt hash (starts with $2b$)
      user.password_hash = await bcrypt.hash(user.password_hash, 10);
    }
  });

  // Ensure password_hash is never returned in JSON
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };

  return User;
};
