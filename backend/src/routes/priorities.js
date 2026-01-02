const express = require('express');
const { Priority } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all priorities
router.get('/', authenticate, async (req, res) => {
  try {
    const priorities = await Priority.findAll({ order: [['rank', 'ASC']] });
    res.json(priorities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get priority by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const priority = await Priority.findByPk(req.params.id);
    if (!priority) return res.status(404).json({ error: 'Priority not found' });
    res.json(priority);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create priority (admin only)
router.post('/', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { name, rank } = req.body;
    if (!name || rank === undefined) return res.status(400).json({ error: 'Name and rank required' });
    const priority = await Priority.create({ name, rank });
    res.status(201).json(priority);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update priority (admin only)
router.patch('/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const priority = await Priority.findByPk(req.params.id);
    if (!priority) return res.status(404).json({ error: 'Priority not found' });
    const { name, rank } = req.body;
    if (name) priority.name = name;
    if (rank !== undefined) priority.rank = rank;
    await priority.save();
    res.json(priority);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete priority (admin only)
router.delete('/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const priority = await Priority.findByPk(req.params.id);
    if (!priority) return res.status(404).json({ error: 'Priority not found' });
    await priority.destroy();
    res.json({ message: 'Priority deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

