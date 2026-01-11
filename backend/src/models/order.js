const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    service_id: { type: DataTypes.BIGINT, allowNull: false },
    customer_id: { type: DataTypes.BIGINT, allowNull: false },
    provider_id: { type: DataTypes.BIGINT, allowNull: false },
    // Order details
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    total_price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    currency: { type: DataTypes.STRING(3), defaultValue: 'USD' },
    // Order status workflow
    status: { 
      type: DataTypes.STRING(32), 
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']]
      }
    },
    // Order metadata
    special_instructions: { type: DataTypes.TEXT },
    scheduled_date: { type: DataTypes.DATE },
    completed_at: { type: DataTypes.DATE },
    cancelled_at: { type: DataTypes.DATE },
    cancellation_reason: { type: DataTypes.TEXT },
    // Rating and review
    customer_rating: { 
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      }
    },
    customer_review: { type: DataTypes.TEXT },
    provider_rating: { 
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      }
    },
    provider_review: { type: DataTypes.TEXT }
  }, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Order;
};

