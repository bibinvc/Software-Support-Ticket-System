const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: { type: DataTypes.SMALLINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(128), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT }
  }, {
    tableName: 'categories',
    timestamps: false
  });

  return Category;
};

