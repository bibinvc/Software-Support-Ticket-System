const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Priority = sequelize.define('Priority', {
    id: { type: DataTypes.SMALLINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    rank: { type: DataTypes.SMALLINT, allowNull: false }
  }, {
    tableName: 'priorities',
    timestamps: false
  });

  return Priority;
};

