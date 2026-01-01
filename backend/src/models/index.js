const { Sequelize } = require('sequelize');
const url = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ssts_db';

const sequelize = new Sequelize(url, {
  dialect: 'postgres',
  logging: false
});

const User = require('./user')(sequelize);
const Ticket = require('./ticket')(sequelize);
const TicketComment = require('./comment')(sequelize);
const Attachment = require('./attachment')(sequelize);
const TicketAssignment = require('./assignment')(sequelize);

// Associations
User.hasMany(Ticket, { foreignKey: 'created_by' });
Ticket.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Ticket.hasMany(TicketComment, { foreignKey: 'ticket_id' });
TicketComment.belongsTo(Ticket, { foreignKey: 'ticket_id' });
TicketComment.belongsTo(User, { foreignKey: 'user_id' });

Ticket.hasMany(Attachment, { foreignKey: 'ticket_id' });
Attachment.belongsTo(Ticket, { foreignKey: 'ticket_id' });
Attachment.belongsTo(User, { foreignKey: 'uploaded_by' });

Ticket.hasMany(TicketAssignment, { foreignKey: 'ticket_id' });
TicketAssignment.belongsTo(Ticket, { foreignKey: 'ticket_id' });
TicketAssignment.belongsTo(User, { foreignKey: 'agent_id', as: 'agent' });

module.exports = { sequelize, User, Ticket, TicketComment, Attachment, TicketAssignment };
