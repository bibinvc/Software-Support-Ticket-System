const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    entity_type: { type: DataTypes.STRING(64), allowNull: false },
    entity_id: { type: DataTypes.BIGINT },
    action: { type: DataTypes.STRING(64), allowNull: false },
    performed_by: { type: DataTypes.BIGINT },
    payload: { type: DataTypes.JSONB }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return AuditLog;
};

