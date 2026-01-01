const express = require('express');
const { Ticket, TicketComment, TicketAssignment, Attachment } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req,res)=>{
  const { status, assigned_to, page = 1, q } = req.query;
  const where = {};
  if(status) where.status = status;
  if(q) where.title = { [require('sequelize').Op.iLike]: `%${q}%` };
  if(req.user.role === 'user') where.created_by = req.user.id;
  const tickets = await Ticket.findAll({ where, limit: 50, order: [['created_at','DESC']] });
  res.json(tickets);
});

router.post('/', authenticate, async (req,res)=>{
  const { title, description, priority_id, category_id } = req.body;
  try{
    const ticket = await Ticket.create({ title, description, priority_id, category_id, created_by: req.user.id });
    res.status(201).json(ticket);
  }catch(err){
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req,res)=>{
  const id = req.params.id;
  const ticket = await Ticket.findByPk(id, { include: [{ model: TicketComment }, { model: Attachment }, { model: TicketAssignment }] });
  if(!ticket) return res.status(404).json({ error: 'Not Found' });
  // hide internal comments for regular users
  if(req.user.role === 'user'){
    ticket.ticket_comments = ticket.ticket_comments?.filter(c=>!c.is_internal) ?? [];
  }
  res.json(ticket);
});

router.patch('/:id', authenticate, async (req,res)=>{
  const id = req.params.id;
  const ticket = await Ticket.findByPk(id);
  if(!ticket) return res.status(404).json({ error: 'Not Found' });
  const { status, priority_id, category_id } = req.body;
  if(status) ticket.status = status;
  if(priority_id) ticket.priority_id = priority_id;
  if(category_id) ticket.category_id = category_id;
  await ticket.save();
  res.json(ticket);
});

router.post('/:id/assign', authenticate, requireRole(['agent','admin']), async (req,res)=>{
  const { agent_id } = req.body;
  const ticket_id = req.params.id;
  const assignment = await TicketAssignment.create({ ticket_id, agent_id, assigned_by: req.user.id });
  res.status(201).json(assignment);
});

module.exports = router;
