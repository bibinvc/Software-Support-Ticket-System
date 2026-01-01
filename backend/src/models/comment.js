const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TicketComment = sequelize.define('TicketComment', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    ticket_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT },
    message: { type: DataTypes.TEXT, allowNull: false },
    is_internal: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'ticket_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return TicketComment;
};
