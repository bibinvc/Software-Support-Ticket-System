const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attachment = sequelize.define('Attachment', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    service_id: { type: DataTypes.BIGINT },
    order_id: { type: DataTypes.BIGINT },
    file_key: { type: DataTypes.STRING, allowNull: false },
    filename: { type: DataTypes.STRING },
    content_type: { type: DataTypes.STRING },
    size_bytes: { type: DataTypes.BIGINT }
  }, {
    tableName: 'attachments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Attachment;
};
