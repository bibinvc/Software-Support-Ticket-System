const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TicketAssignment = sequelize.define('TicketAssignment', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    ticket_id: { type: DataTypes.BIGINT, allowNull: false },
    agent_id: { type: DataTypes.BIGINT },
    assigned_by: { type: DataTypes.BIGINT },
    note: { type: DataTypes.TEXT }
  }, {
    tableName: 'ticket_assignments',
    timestamps: true,
    createdAt: 'assigned_at',
    updatedAt: false
  });

  return TicketAssignment;
};
