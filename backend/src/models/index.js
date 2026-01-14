const { Sequelize } = require('sequelize');
const url = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ssts_db';

const sequelize = new Sequelize(url, {
  dialect: 'postgres',
  logging: false
});

const User = require('./user')(sequelize);
const Attachment = require('./attachment')(sequelize);
const Category = require('./category')(sequelize);
const Priority = require('./priority')(sequelize);
const Ticket = require('./ticket')(sequelize);
const TicketComment = require('./comment')(sequelize);
const TicketAssignment = require('./assignment')(sequelize);
const AuditLog = require('./auditLog')(sequelize);
const UserSession = require('./userSession')(sequelize);

// User associations
User.hasMany(Attachment, { foreignKey: 'uploaded_by', as: 'attachments' });
User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
User.hasMany(AuditLog, { foreignKey: 'performed_by', as: 'audit_logs' });
User.hasMany(Ticket, { foreignKey: 'created_by', as: 'tickets_created' });
User.hasMany(TicketComment, { foreignKey: 'user_id', as: 'ticket_comments' });
User.hasMany(TicketAssignment, { foreignKey: 'agent_id', as: 'ticket_assignments' });

// Attachment associations
Attachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: 'performed_by', as: 'performer' });

// UserSession associations
UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Ticket associations
Ticket.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Ticket.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Ticket.belongsTo(Priority, { foreignKey: 'priority_id', as: 'priority' });
Ticket.hasMany(TicketComment, { foreignKey: 'ticket_id', as: 'ticket_comments' });
Ticket.hasMany(TicketAssignment, { foreignKey: 'ticket_id', as: 'ticket_assignments' });
Ticket.hasMany(Attachment, { foreignKey: 'ticket_id', as: 'attachments' });

TicketComment.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
TicketComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

TicketAssignment.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
TicketAssignment.belongsTo(User, { foreignKey: 'agent_id', as: 'agent' });
TicketAssignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assigner' });

Attachment.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

module.exports = { 
  sequelize, 
  User, 
  Attachment, 
  Category,
  Priority,
  Ticket,
  TicketComment,
  TicketAssignment,
  AuditLog,
  UserSession
};
