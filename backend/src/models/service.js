const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Service = sequelize.define('Service', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category_id: { type: DataTypes.SMALLINT },
    provider_id: { type: DataTypes.BIGINT, allowNull: false },
    // Pricing
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    currency: { type: DataTypes.STRING(3), defaultValue: 'USD' },
    // Service details
    duration_hours: { type: DataTypes.INTEGER },
    location: { type: DataTypes.STRING(255) },
    is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
    // Status
    status: { 
      type: DataTypes.STRING(32), 
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive', 'suspended']]
      }
    }
  }, {
    tableName: 'services',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Service;
};

