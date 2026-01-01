const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

router.post('/register', async (req,res)=>{
  const { name, email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email and password required' });
  try{
    const user = await User.create({ name, email, password_hash: password });
    return res.status(201).json({ id: user.id, email: user.email });
  }catch(err){
    return res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await User.findOne({ where: { email } });
  if(!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await user.verifyPassword(password);
  if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
