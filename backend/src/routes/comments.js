const express = require('express');
const { TicketComment } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/:id/comments', authenticate, async (req,res)=>{
  const ticket_id = req.params.id;
  const { message, is_internal } = req.body;
  // Users cannot create internal notes
  let internalFlag = false;
  if(req.user.role !== 'user' && is_internal) internalFlag = true;
  const comment = await TicketComment.create({ ticket_id, user_id: req.user.id, message, is_internal: internalFlag });
  res.status(201).json(comment);
});

module.exports = router;
