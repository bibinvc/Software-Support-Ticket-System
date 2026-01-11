const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderMessage = sequelize.define('OrderMessage', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT },
    message: { type: DataTypes.TEXT, allowNull: false },
    is_system: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'order_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return OrderMessage;
};

