const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserSession = sequelize.define('UserSession', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    token_hash: { type: DataTypes.STRING, unique: true, allowNull: false },
    ip_address: { type: DataTypes.STRING(45) },
    user_agent: { type: DataTypes.TEXT },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'user_sessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return UserSession;
};

