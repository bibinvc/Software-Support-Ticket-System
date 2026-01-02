const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Attachment } = require('../models');
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
  const record = await Attachment.create({ ticket_id, file_key: req.file.filename, filename: req.file.originalname, content_type: req.file.mimetype, size_bytes: req.file.size, uploaded_by: req.user.id });
  
  // Log attachment upload
  await createAuditLog('ticket', ticket_id, 'attachment_uploaded', req.user.id, {
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
