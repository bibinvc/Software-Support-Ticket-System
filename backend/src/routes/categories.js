const express = require('express');
const { Category } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', authenticate, async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get category by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category (admin only)
router.post('/', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update category (admin only)
router.patch('/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    const { name, description } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticate, requireRole(['admin']), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

