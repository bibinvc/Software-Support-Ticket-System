const express = require('express');
const { Service, Category, User, Attachment, Order } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate, serviceRules } = require('../middleware/validation');
const { apiLimiter } = require('../middleware/security');
const { createAuditLog } = require('../middleware/audit');
const { Op } = require('sequelize');

const router = express.Router();

// Get all services (public or filtered)
router.get('/', apiLimiter, async (req, res) => {
  try {
    const { category_id, provider_id, status = 'active', q, page = 1, limit = 20 } = req.query;
    const where = { status: 'active', is_available: true };
    
    // Only show active services to non-authenticated users
    if (req.user && req.user.role === 'admin') {
      where.status = status;
      delete where.is_available;
    }
    
    if (category_id) where.category_id = category_id;
    if (provider_id) where.provider_id = provider_id;
    
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: services } = await Service.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'provider', attributes: ['id', 'name', 'email', 'rating'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }
      ]
    });
    
    res.json({ services, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Services list error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get service by ID
router.get('/:id', apiLimiter, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        { model: User, as: 'provider', attributes: ['id', 'name', 'email', 'rating', 'bio'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'description', 'icon'] },
        { model: Attachment, as: 'attachments', attributes: ['id', 'filename', 'file_key', 'content_type'] }
      ]
    });
    
    if (!service) return res.status(404).json({ error: 'Service not found' });
    
    // Check if service is available (unless admin)
    if (service.status !== 'active' || !service.is_available) {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(404).json({ error: 'Service not found' });
      }
    }
    
    res.json(service);
  } catch (err) {
    console.error('Service get error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create service (provider only)
router.post('/', authenticate, requireRole(['provider', 'admin']), apiLimiter, validate(serviceRules), async (req, res) => {
  try {
    const { title, description, category_id, price, currency, duration_hours, location } = req.body;
    
    const service = await Service.create({
      title,
      description,
      category_id: category_id || null,
      provider_id: req.user.id,
      price: parseFloat(price),
      currency: currency || 'USD',
      duration_hours: duration_hours || null,
      location: location || null,
      status: 'active',
      is_available: true
    });
    
    await createAuditLog('service', service.id, 'created', req.user.id, {
      title: service.title,
      provider_id: service.provider_id
    });
    
    const fullService = await Service.findByPk(service.id, {
      include: [
        { model: User, as: 'provider', attributes: ['id', 'name', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });
    
    res.status(201).json(fullService);
  } catch (err) {
    console.error('Service create error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update service (provider owns or admin)
router.patch('/:id', authenticate, apiLimiter, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    
    // Check ownership or admin
    if (service.provider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { title, description, category_id, price, currency, duration_hours, location, is_available, status } = req.body;
    
    if (title) service.title = title;
    if (description) service.description = description;
    if (category_id !== undefined) service.category_id = category_id;
    if (price !== undefined) service.price = parseFloat(price);
    if (currency) service.currency = currency;
    if (duration_hours !== undefined) service.duration_hours = duration_hours;
    if (location !== undefined) service.location = location;
    if (is_available !== undefined) service.is_available = is_available;
    if (status && ['active', 'inactive', 'suspended'].includes(status) && req.user.role === 'admin') {
      service.status = status;
    }
    
    await service.save();
    
    await createAuditLog('service', service.id, 'updated', req.user.id, {
      changes: req.body
    });
    
    const updatedService = await Service.findByPk(service.id, {
      include: [
        { model: User, as: 'provider', attributes: ['id', 'name', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });
    
    res.json(updatedService);
  } catch (err) {
    console.error('Service update error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete service (provider owns or admin)
router.delete('/:id', authenticate, apiLimiter, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    
    // Check ownership or admin
    if (service.provider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Check if service has active orders
    const activeOrders = await Order.count({
      where: {
        service_id: service.id,
        status: { [Op.in]: ['pending', 'confirmed', 'in_progress'] }
      }
    });
    
    if (activeOrders > 0) {
      return res.status(400).json({ error: 'Cannot delete service with active orders' });
    }
    
    await service.destroy();
    
    await createAuditLog('service', service.id, 'deleted', req.user.id, {
      title: service.title
    });
    
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Service delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get provider's services
router.get('/provider/my-services', authenticate, requireRole(['provider', 'admin']), apiLimiter, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { provider_id: req.user.id };
    
    if (status) where.status = status;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: services } = await Service.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon'] }
      ]
    });
    
    res.json({ services, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('My services error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

