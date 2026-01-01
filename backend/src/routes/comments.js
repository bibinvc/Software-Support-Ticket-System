const express = require('express');
const { TicketComment } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/:id/comments', authenticate, async (req,res)=>{
  try {
    const ticket_id = req.params.id;
    const { message, is_internal } = req.body;
    
    if(!message) return res.status(400).json({ error: 'Message required' });
    
    // Verify ticket exists and user has access
    const ticket = await require('../models').Ticket.findByPk(ticket_id);
    if(!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    if(req.user.role === 'user' && ticket.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Users cannot create internal notes
    let internalFlag = false;
    if(req.user.role !== 'user' && is_internal) internalFlag = true;
    
    const comment = await TicketComment.create({ 
      ticket_id, 
      user_id: req.user.id, 
      message, 
      is_internal: internalFlag 
    });
    
    const fullComment = await TicketComment.findByPk(comment.id, {
      include: [{ model: require('../models').User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    
    res.status(201).json(fullComment);
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
