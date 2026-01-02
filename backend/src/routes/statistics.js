const express = require('express');
const { sequelize, Ticket, User, TicketAssignment } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'user') {
      where.created_by = req.user.id;
    }

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      allTickets,
      myAssignedTickets
    ] = await Promise.all([
      Ticket.count({ where }),
      Ticket.count({ where: { ...where, status: 'Open' } }),
      Ticket.count({ where: { ...where, status: 'In Progress' } }),
      Ticket.count({ where: { ...where, status: 'Resolved' } }),
      Ticket.count({ where: { ...where, status: 'Closed' } }),
      Ticket.findAll({
        where,
        limit: 10,
        order: [['created_at', 'DESC']],
        include: [
          { model: User, as: 'creator', attributes: ['name', 'email'] },
          { model: require('../models').Priority, as: 'priority', attributes: ['name'] },
          { model: require('../models').Category, as: 'category', attributes: ['name'] }
        ]
      }),
      req.user.role !== 'user' ? (async () => {
        try {
          const assignments = await TicketAssignment.findAll({
            where: { agent_id: req.user.id },
            attributes: ['ticket_id']
          });
          if (assignments.length === 0) return 0;
          const ticketIds = assignments.map(a => a.ticket_id);
          const openTickets = await Ticket.count({
            where: {
              id: { [Op.in]: ticketIds },
              status: { [Op.ne]: 'Closed' }
            }
          });
          return openTickets;
        } catch (err) {
          console.error('Error fetching assigned tickets:', err);
          return 0;
        }
      })() : Promise.resolve(0)
    ]);

    // Calculate tickets by priority manually
    const ticketsByPriority = [];
    const priorityMap = {};
    allTickets.forEach(ticket => {
      if (ticket.priority_id) {
        if (!priorityMap[ticket.priority_id]) {
          priorityMap[ticket.priority_id] = {
            priority_id: ticket.priority_id,
            count: 0,
            priority: ticket.priority
          };
        }
        priorityMap[ticket.priority_id].count++;
      }
    });
    Object.values(priorityMap).forEach(p => ticketsByPriority.push(p));

    // Calculate tickets by status manually
    const ticketsByStatus = [
      { status: 'Open', count: openTickets },
      { status: 'In Progress', count: inProgressTickets },
      { status: 'Resolved', count: resolvedTickets },
      { status: 'Closed', count: closedTickets }
    ];

    res.json({
      totals: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets
      },
      byPriority: ticketsByPriority,
      byStatus: ticketsByStatus,
      recentTickets: allTickets,
      myAssignedTickets: myAssignedTickets || 0
    });
  } catch (err) {
    console.error('Statistics error:', err);
    res.status(500).json({ error: err.message, details: process.env.NODE_ENV === 'development' ? err.stack : undefined });
  }
});

// Get ticket trends (for charts)
router.get('/trends', authenticate, requireRole(['admin', 'agent']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const ticketsByDate = await Ticket.findAll({
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

    res.json(ticketsByDate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

