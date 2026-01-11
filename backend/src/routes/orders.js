const express = require('express');
const { Order, Service, User, OrderMessage, Attachment } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate, orderRules } = require('../middleware/validation');
const { apiLimiter } = require('../middleware/security');
const { createAuditLog } = require('../middleware/audit');
const { Op } = require('sequelize');

const router = express.Router();

// Get all orders (filtered by role)
router.get('/', authenticate, apiLimiter, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    
    // Role-based filtering
    if (req.user.role === 'customer') {
      where.customer_id = req.user.id;
    } else if (req.user.role === 'provider') {
      where.provider_id = req.user.id;
    }
    // Admin can see all
    
    if (status) where.status = status;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Service, as: 'service', attributes: ['id', 'title', 'price', 'currency'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'provider', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    res.json({ orders, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Orders list error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get order by ID
router.get('/:id', authenticate, apiLimiter, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { 
          model: Service, 
          as: 'service', 
          include: [
            { model: User, as: 'provider', attributes: ['id', 'name', 'email', 'rating'] },
            { model: require('../models').Category, as: 'category', attributes: ['id', 'name'] }
          ]
        },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'rating'] },
        { model: User, as: 'provider', attributes: ['id', 'name', 'email', 'rating'] },
        { 
          model: OrderMessage, 
          as: 'messages',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
          order: [['created_at', 'ASC']],
          separate: true
        },
        { 
          model: Attachment, 
          as: 'attachments',
          attributes: ['id', 'filename', 'file_key', 'content_type', 'size_bytes'],
          separate: true
        }
      ]
    });
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Check access
    if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user.role === 'provider' && order.provider_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Order get error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create order (customer only)
router.post('/', authenticate, requireRole(['customer', 'admin']), apiLimiter, validate(orderRules), async (req, res) => {
  try {
    const { service_id, quantity = 1, special_instructions, scheduled_date } = req.body;
    
    // Get service
    const service = await Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    if (service.status !== 'active' || !service.is_available) {
      return res.status(400).json({ error: 'Service is not available' });
    }
    
    // Prevent ordering own service
    if (service.provider_id === req.user.id && req.user.role !== 'admin') {
      return res.status(400).json({ error: 'Cannot order your own service' });
    }
    
    // Calculate total price
    const totalPrice = parseFloat(service.price) * parseInt(quantity);
    
    // Create order
    const order = await Order.create({
      service_id,
      customer_id: req.user.id,
      provider_id: service.provider_id,
      quantity: parseInt(quantity),
      total_price: totalPrice,
      currency: service.currency,
      status: 'pending',
      special_instructions: special_instructions || null,
      scheduled_date: scheduled_date || null
    });
    
    // Create system message
    await OrderMessage.create({
      order_id: order.id,
      user_id: null,
      message: 'Order created and awaiting provider confirmation',
      is_system: true
    });
    
    await createAuditLog('order', order.id, 'created', req.user.id, {
      service_id: order.service_id,
      total_price: order.total_price
    });
    
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: Service, as: 'service', attributes: ['id', 'title', 'price'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'provider', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    res.status(201).json(fullOrder);
  } catch (err) {
    console.error('Order create error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update order status (provider or customer based on status)
router.patch('/:id/status', authenticate, apiLimiter, async (req, res) => {
  try {
    const { status, cancellation_reason } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Check access and business logic
    const isCustomer = order.customer_id === req.user.id;
    const isProvider = order.provider_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Business logic for status transitions
    const currentStatus = order.status;
    let message = '';
    
    if (status === 'confirmed' && currentStatus === 'pending') {
      if (!isProvider && !isAdmin) {
        return res.status(403).json({ error: 'Only provider can confirm orders' });
      }
      order.status = 'confirmed';
      message = 'Order confirmed by provider';
    } else if (status === 'in_progress' && currentStatus === 'confirmed') {
      if (!isProvider && !isAdmin) {
        return res.status(403).json({ error: 'Only provider can start work' });
      }
      order.status = 'in_progress';
      message = 'Provider has started working on the order';
    } else if (status === 'completed' && currentStatus === 'in_progress') {
      if (!isProvider && !isAdmin) {
        return res.status(403).json({ error: 'Only provider can complete orders' });
      }
      order.status = 'completed';
      order.completed_at = new Date();
      message = 'Order completed by provider';
    } else if (status === 'cancelled') {
      if (currentStatus === 'completed') {
        return res.status(400).json({ error: 'Cannot cancel completed order' });
      }
      if (currentStatus === 'cancelled') {
        return res.status(400).json({ error: 'Order already cancelled' });
      }
      order.status = 'cancelled';
      order.cancelled_at = new Date();
      if (cancellation_reason) order.cancellation_reason = cancellation_reason;
      message = isCustomer ? 'Order cancelled by customer' : 'Order cancelled by provider';
    } else {
      return res.status(400).json({ error: 'Invalid status transition' });
    }
    
    await order.save();
    
    // Create system message
    if (message) {
      await OrderMessage.create({
        order_id: order.id,
        user_id: null,
        message: message,
        is_system: true
      });
    }
    
    await createAuditLog('order', order.id, 'status_updated', req.user.id, {
      old_status: currentStatus,
      new_status: status,
      cancellation_reason: cancellation_reason || null
    });
    
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        { model: Service, as: 'service', attributes: ['id', 'title'] },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'provider', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    res.json(updatedOrder);
  } catch (err) {
    console.error('Order status update error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Add message to order
router.post('/:id/messages', authenticate, apiLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Check access
    const isCustomer = order.customer_id === req.user.id;
    const isProvider = order.provider_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const orderMessage = await OrderMessage.create({
      order_id: order.id,
      user_id: req.user.id,
      message: message.trim()
    });
    
    const fullMessage = await OrderMessage.findByPk(orderMessage.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });
    
    res.status(201).json(fullMessage);
  } catch (err) {
    console.error('Order message create error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Add rating and review
router.post('/:id/rating', authenticate, apiLimiter, async (req, res) => {
  try {
    const { rating, review, from } = req.body; // from: 'customer' or 'provider'
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    if (order.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed orders' });
    }
    
    // Check access and set rating
    if (from === 'customer' && order.customer_id === req.user.id) {
      order.customer_rating = parseInt(rating);
      if (review) order.customer_review = review;
    } else if (from === 'provider' && order.provider_id === req.user.id) {
      order.provider_rating = parseInt(rating);
      if (review) order.provider_review = review;
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await order.save();
    
    // Update user ratings (simplified - would need more complex calculation)
    // This is a placeholder - in production, you'd want to recalculate average ratings
    
    await createAuditLog('order', order.id, 'rated', req.user.id, {
      rating: rating,
      from: from
    });
    
    res.json(order);
  } catch (err) {
    console.error('Order rating error:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

