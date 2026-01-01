const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SLAPolicy = sequelize.define('SLAPolicy', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(128), allowNull: false, unique: true },
    time_to_first_response: { type: DataTypes.STRING },
    time_to_resolution: { type: DataTypes.STRING }
  }, {
    tableName: 'sla_policies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return SLAPolicy;
};

