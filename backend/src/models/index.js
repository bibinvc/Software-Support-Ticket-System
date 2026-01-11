const { Sequelize } = require('sequelize');
const url = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ssts_db';

const sequelize = new Sequelize(url, {
  dialect: 'postgres',
  logging: false
});

const User = require('./user')(sequelize);
const Service = require('./service')(sequelize);
const Order = require('./order')(sequelize);
const OrderMessage = require('./orderMessage')(sequelize);
const Attachment = require('./attachment')(sequelize);
const Category = require('./category')(sequelize);
const AuditLog = require('./auditLog')(sequelize);
const UserSession = require('./userSession')(sequelize);

// User associations
User.hasMany(Service, { foreignKey: 'provider_id', as: 'services' });
User.hasMany(Order, { foreignKey: 'customer_id', as: 'customer_orders' });
User.hasMany(Order, { foreignKey: 'provider_id', as: 'provider_orders' });
User.hasMany(OrderMessage, { foreignKey: 'user_id', as: 'order_messages' });
User.hasMany(Attachment, { foreignKey: 'uploaded_by', as: 'attachments' });
User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
User.hasMany(AuditLog, { foreignKey: 'performed_by', as: 'audit_logs' });

// Service associations
Service.belongsTo(User, { foreignKey: 'provider_id', as: 'provider' });
Service.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Service.hasMany(Order, { foreignKey: 'service_id', as: 'orders' });
Service.hasMany(Attachment, { foreignKey: 'service_id', as: 'attachments' });

// Order associations
Order.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
Order.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Order.belongsTo(User, { foreignKey: 'provider_id', as: 'provider' });
Order.hasMany(OrderMessage, { foreignKey: 'order_id', as: 'messages' });
Order.hasMany(Attachment, { foreignKey: 'order_id', as: 'attachments' });

// OrderMessage associations
OrderMessage.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderMessage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Attachment associations
Attachment.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
Attachment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Attachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: 'performed_by', as: 'performer' });

// UserSession associations
UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { 
  sequelize, 
  User, 
  Service,
  Order,
  OrderMessage,
  Attachment, 
  Category,
  AuditLog,
  UserSession
};
