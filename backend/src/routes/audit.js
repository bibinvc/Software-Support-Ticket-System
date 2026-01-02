const express = require('express');
const { AuditLog, User, Ticket } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get audit logs (admin/agent only)
router.get('/', authenticate, requireRole(['admin', 'agent']), async (req, res) => {
  try {
    const { entity_type, entity_id, action, user_id, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (entity_type) where.entity_type = entity_type;
    if (entity_id) where.entity_id = parseInt(entity_id);
    if (action) where.action = action;
    if (user_id) where.performed_by = parseInt(user_id);
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'performer', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });
    
    res.json({ logs, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get audit logs for a specific ticket
router.get('/ticket/:id', authenticate, async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Check if user has access to this ticket
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    // Users can only see logs for their own tickets
    if (req.user.role === 'user' && ticket.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const logs = await AuditLog.findAll({
      where: {
        entity_type: 'ticket',
        entity_id: ticketId
      },
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'performer', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });
    
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

