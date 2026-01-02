const { AuditLog } = require('../models');

/**
 * Helper function to create audit log entries
 */
async function createAuditLog(entityType, entityId, action, performedBy, changes = {}) {
  try {
    await AuditLog.create({
      entity_type: entityType,
      entity_id: entityId,
      action: action,
      performed_by: performedBy,
      payload: changes
    });
  } catch (err) {
    // Don't fail the request if audit logging fails
    console.error('Audit log error:', err);
  }
}

/**
 * Middleware to log ticket changes
 */
async function logTicketChange(ticketId, userId, action, oldValues = {}, newValues = {}) {
  const changes = {};
  
  // Track what changed
  Object.keys(newValues).forEach(key => {
    if (oldValues[key] !== undefined && oldValues[key] !== newValues[key]) {
      changes[key] = {
        from: oldValues[key],
        to: newValues[key]
      };
    } else if (oldValues[key] === undefined && newValues[key] !== undefined) {
      changes[key] = {
        from: null,
        to: newValues[key]
      };
    }
  });
  
  if (Object.keys(changes).length > 0) {
    await createAuditLog('ticket', ticketId, action, userId, {
      changes,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  createAuditLog,
  logTicketChange
};

