const express = require('express');
const { Ticket, TicketComment, TicketAssignment, Attachment } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { logTicketChange, createAuditLog } = require('../middleware/audit');

const router = express.Router();

router.get('/', authenticate, async (req,res)=>{
  try {
    const { status, assigned_to, priority_id, category_id, page = 1, limit = 50, q } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    
    if(status) where.status = status;
    if(priority_id) where.priority_id = priority_id;
    if(category_id) where.category_id = category_id;
    if(q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }
    
    if(req.user.role === 'user') {
      where.created_by = req.user.id;
    } else if(assigned_to) {
      // For agents/admins, filter by assigned agent
      const assignments = await TicketAssignment.findAll({
        where: { agent_id: assigned_to },
        attributes: ['ticket_id']
      });
      where.id = { [Op.in]: assignments.map(a => a.ticket_id) };
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at','DESC']],
      include: [
        { model: require('../models').User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: require('../models').Priority, as: 'priority', attributes: ['id', 'name', 'rank'] },
        { model: require('../models').Category, as: 'category', attributes: ['id', 'name'] },
        { 
          model: TicketAssignment,
          as: 'ticket_assignments',
          include: [{ model: require('../models').User, as: 'agent', attributes: ['id', 'name', 'email'] }],
          limit: 1,
          order: [['assigned_at', 'DESC']],
          separate: true
        }
      ]
    });
    
    res.json({ tickets, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch(err) {
    console.error('Tickets list error:', err);
    res.status(500).json({ error: err.message, details: process.env.NODE_ENV === 'development' ? err.stack : undefined });
  }
});

router.post('/', authenticate, async (req,res)=>{
  try {
    const { title, description, priority_id, category_id } = req.body;
    if(!title || !description) {
      return res.status(400).json({ error: 'Title and description required' });
    }
    const ticket = await Ticket.create({ 
      title, 
      description, 
      priority_id: priority_id || null, 
      category_id: category_id || null, 
      created_by: req.user.id,
      status: 'Open'
    });
    
    // Log ticket creation
    await createAuditLog('ticket', ticket.id, 'created', req.user.id, {
      title: ticket.title,
      status: ticket.status,
      priority_id: ticket.priority_id,
      category_id: ticket.category_id
    });
    
    const fullTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: require('../models').User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: require('../models').Priority, as: 'priority', attributes: ['id', 'name', 'rank'] },
        { model: require('../models').Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });
    
    res.status(201).json(fullTicket);
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req,res)=>{
  try {
    const id = req.params.id;
    const ticket = await Ticket.findByPk(id, { 
      include: [
        { model: require('../models').User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: require('../models').Priority, as: 'priority', attributes: ['id', 'name', 'rank'] },
        { model: require('../models').Category, as: 'category', attributes: ['id', 'name', 'description'] },
        { 
          model: TicketComment,
          as: 'ticket_comments',
          include: [{ model: require('../models').User, as: 'user', attributes: ['id', 'name', 'email'] }],
          order: [['created_at', 'ASC']],
          separate: true
        },
        { 
          model: Attachment,
          as: 'attachments',
          include: [{ model: require('../models').User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
          separate: true
        },
        { 
          model: TicketAssignment,
          as: 'ticket_assignments',
          include: [
            { model: require('../models').User, as: 'agent', attributes: ['id', 'name', 'email'] },
            { model: require('../models').User, as: 'assigner', attributes: ['id', 'name', 'email'] }
          ],
          order: [['assigned_at', 'DESC']],
          separate: true
        }
      ]
    });
    
    if(!ticket) return res.status(404).json({ error: 'Not Found' });
    
    // Check access - users can only see their own tickets
    if(req.user.role === 'user' && ticket.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Hide internal comments for regular users
    if(req.user.role === 'user'){
      ticket.ticket_comments = ticket.ticket_comments?.filter(c=>!c.is_internal) ?? [];
    }
    
    res.json(ticket);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authenticate, async (req,res)=>{
  try {
    const id = req.params.id;
    const ticket = await Ticket.findByPk(id);
    if(!ticket) return res.status(404).json({ error: 'Not Found' });
    
    // Check access - users can only update their own tickets (limited fields)
    if(req.user.role === 'user' && ticket.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Store old values for audit log
    const oldValues = {
      status: ticket.status,
      priority_id: ticket.priority_id,
      category_id: ticket.category_id,
      title: ticket.title,
      description: ticket.description
    };
    
    const { status, priority_id, category_id, title, description } = req.body;
    if(status && ['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      ticket.status = status;
    }
    if(priority_id !== undefined) ticket.priority_id = priority_id;
    if(category_id !== undefined) ticket.category_id = category_id;
    if(title) ticket.title = title;
    if(description) ticket.description = description;
    
    await ticket.save();
    
    // Log ticket changes
    await logTicketChange(
      ticket.id,
      req.user.id,
      'updated',
      oldValues,
      {
        status: ticket.status,
        priority_id: ticket.priority_id,
        category_id: ticket.category_id,
        title: ticket.title,
        description: ticket.description
      }
    );
    
    const updatedTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: require('../models').User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: require('../models').Priority, as: 'priority', attributes: ['id', 'name', 'rank'] },
        { model: require('../models').Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });
    
    res.json(updatedTicket);
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/assign', authenticate, requireRole(['agent','admin']), async (req,res)=>{
  try {
    const { agent_id, note } = req.body;
    const ticket_id = req.params.id;
    
    const ticket = await Ticket.findByPk(ticket_id);
    if(!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    // Get old assignment for audit log
    const oldAssignment = await TicketAssignment.findOne({ where: { ticket_id } });
    const oldAgentId = oldAssignment?.agent_id || null;
    
    // Remove existing assignment for this ticket
    await TicketAssignment.destroy({ where: { ticket_id } });
    
    // Create new assignment
    const assignment = await TicketAssignment.create({ 
      ticket_id, 
      agent_id: agent_id || null, 
      assigned_by: req.user.id,
      note 
    });
    
    // Log assignment change
    await createAuditLog('ticket', ticket_id, 'assigned', req.user.id, {
      old_agent_id: oldAgentId,
      new_agent_id: agent_id || null,
      note: note || null
    });
    
    const fullAssignment = await TicketAssignment.findByPk(assignment.id, {
      include: [
        { model: require('../models').User, as: 'agent', attributes: ['id', 'name', 'email'] },
        { model: require('../models').User, as: 'assigner', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    res.status(201).json(fullAssignment);
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
