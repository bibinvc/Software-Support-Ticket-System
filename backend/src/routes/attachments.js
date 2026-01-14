const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Attachment, Ticket, TicketAssignment } = require('../models');
const { authenticate } = require('../middleware/auth');
const { createAuditLog } = require('../middleware/audit');

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname,'../../uploads');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req,file,cb)=> cb(null, uploadDir),
  filename: (req,file,cb)=> cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const router = express.Router();

router.post('/', authenticate, upload.single('file'), async (req,res)=>{
  const { ticket_id } = req.body;
  if(!req.file) return res.status(400).json({ error: 'file required' });
  
  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type. Allowed: images and PDF' });
  }
  
  if (req.file.size > maxSize) {
    return res.status(400).json({ error: 'File too large. Maximum size: 10MB' });
  }
  
  if (!ticket_id) {
    return res.status(400).json({ error: 'ticket_id required' });
  }

  const ticket = await Ticket.findByPk(ticket_id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  if (req.user.role === 'client' && ticket.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.user.role === 'agent') {
    const assignment = await TicketAssignment.findOne({
      where: { ticket_id, agent_id: req.user.id }
    });
    if (!assignment) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
  
  const record = await Attachment.create({ 
    ticket_id: ticket_id || null,
    file_key: req.file.filename, 
    filename: req.file.originalname, 
    content_type: req.file.mimetype, 
    size_bytes: req.file.size, 
    uploaded_by: req.user.id 
  });
  
  const entityType = 'ticket';
  const entityId = ticket_id;

  // Log attachment upload
  await createAuditLog(entityType, entityId, 'attachment_uploaded', req.user.id, {
    attachment_id: record.id,
    filename: req.file.originalname,
    size_bytes: req.file.size,
    content_type: req.file.mimetype
  });
  
  res.status(201).json(record);
});

router.get('/:id/download', authenticate, async (req,res)=>{
  try {
    const id = req.params.id;
    const rec = await Attachment.findByPk(id);
    if(!rec) return res.status(404).json({ error: 'Not found' });

    if (rec.ticket_id) {
      const ticket = await Ticket.findByPk(rec.ticket_id);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      if (req.user.role === 'client' && ticket.created_by !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (req.user.role === 'agent') {
        const assignment = await TicketAssignment.findOne({
          where: { ticket_id: rec.ticket_id, agent_id: req.user.id }
        });
        if (!assignment) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }
    }
    
    const file = path.join(uploadDir, rec.file_key);
    if(!fs.existsSync(file)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    // Set appropriate headers for images (display inline)
    if(rec.content_type && rec.content_type.startsWith('image/')) {
      res.setHeader('Content-Type', rec.content_type);
      res.setHeader('Content-Disposition', `inline; filename="${rec.filename}"`);
      res.sendFile(path.resolve(file));
    } else {
      // For other files, download
      res.download(file, rec.filename);
    }
  } catch(err) {
    console.error('Download error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
