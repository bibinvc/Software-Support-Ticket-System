const express = require('express');
const { sequelize, Service, Order, User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { Op } = require('sequelize');
const { apiLimiter } = require('../middleware/security');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticate, apiLimiter, async (req, res) => {
  try {
    let stats = {};
    
    if (req.user.role === 'customer') {
      // Customer statistics
      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders,
        recentOrders
      ] = await Promise.all([
        Order.count({ where: { customer_id: req.user.id } }),
        Order.count({ where: { customer_id: req.user.id, status: 'pending' } }),
        Order.count({ where: { customer_id: req.user.id, status: 'confirmed' } }),
        Order.count({ where: { customer_id: req.user.id, status: 'in_progress' } }),
        Order.count({ where: { customer_id: req.user.id, status: 'completed' } }),
        Order.count({ where: { customer_id: req.user.id, status: 'cancelled' } }),
        Order.findAll({
          where: { customer_id: req.user.id },
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [
            { model: Service, as: 'service', attributes: ['id', 'title', 'price'] },
            { model: User, as: 'provider', attributes: ['id', 'name', 'email'] }
          ]
        })
      ]);
      
      stats = {
        totals: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          inProgress: inProgressOrders,
          completed: completedOrders,
          cancelled: cancelledOrders
        },
        byStatus: [
          { status: 'pending', count: pendingOrders },
          { status: 'confirmed', count: confirmedOrders },
          { status: 'in_progress', count: inProgressOrders },
          { status: 'completed', count: completedOrders },
          { status: 'cancelled', count: cancelledOrders }
        ],
        recentOrders
      };
    } else if (req.user.role === 'provider') {
      // Provider statistics
      const [
        totalServices,
        activeServices,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        inProgressOrders,
        completedOrders,
        recentOrders
      ] = await Promise.all([
        Service.count({ where: { provider_id: req.user.id } }),
        Service.count({ where: { provider_id: req.user.id, status: 'active', is_available: true } }),
        Order.count({ where: { provider_id: req.user.id } }),
        Order.count({ where: { provider_id: req.user.id, status: 'pending' } }),
        Order.count({ where: { provider_id: req.user.id, status: 'confirmed' } }),
        Order.count({ where: { provider_id: req.user.id, status: 'in_progress' } }),
        Order.count({ where: { provider_id: req.user.id, status: 'completed' } }),
        Order.findAll({
          where: { provider_id: req.user.id },
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [
            { model: Service, as: 'service', attributes: ['id', 'title', 'price'] },
            { model: User, as: 'customer', attributes: ['id', 'name', 'email'] }
          ]
        })
      ]);
      
      stats = {
        services: {
          total: totalServices,
          active: activeServices
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          inProgress: inProgressOrders,
          completed: completedOrders
        },
        byStatus: [
          { status: 'pending', count: pendingOrders },
          { status: 'confirmed', count: confirmedOrders },
          { status: 'in_progress', count: inProgressOrders },
          { status: 'completed', count: completedOrders }
        ],
        recentOrders
      };
    } else if (req.user.role === 'admin') {
      // Admin statistics
      const [
        totalUsers,
        totalCustomers,
        totalProviders,
        totalServices,
        totalOrders,
        ordersByStatus
      ] = await Promise.all([
        User.count(),
        User.count({ where: { role: 'customer' } }),
        User.count({ where: { role: 'provider' } }),
        Service.count(),
        Order.count(),
        Order.findAll({
          attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['status'],
          raw: true
        })
      ]);
      
      stats = {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          providers: totalProviders
        },
        services: {
          total: totalServices
        },
        orders: {
          total: totalOrders,
          byStatus: ordersByStatus
        }
      };
    }

    res.json(stats);
  } catch (err) {
    console.error('Statistics error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get order trends (for charts) - admin only
router.get('/trends', authenticate, requireRole(['admin']), apiLimiter, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const ordersByDate = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: startDate }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    res.json(ordersByDate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

