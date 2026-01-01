const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Attachment } = require('../models');
const { authenticate } = require('../middleware/auth');

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
  res.status(201).json(record);
});

router.get('/:id/download', authenticate, async (req,res)=>{
  const id = req.params.id;
  const rec = await Attachment.findByPk(id);
  if(!rec) return res.status(404).json({ error: 'Not found' });
  const file = path.join(uploadDir, rec.file_key);
  res.download(file, rec.filename);
});

module.exports = router;
