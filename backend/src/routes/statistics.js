const express = require('express');
const { Ticket, TicketAssignment, User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { Op } = require('sequelize');
const { apiLimiter } = require('../middleware/security');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticate, apiLimiter, async (req, res) => {
  try {
    let stats = {};

    const statusList = ['Open', 'In Progress', 'Resolved', 'Closed'];

    if (req.user.role === 'client') {
      const [totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets, recentTickets] = await Promise.all([
        Ticket.count({ where: { created_by: req.user.id } }),
        Ticket.count({ where: { created_by: req.user.id, status: 'Open' } }),
        Ticket.count({ where: { created_by: req.user.id, status: 'In Progress' } }),
        Ticket.count({ where: { created_by: req.user.id, status: 'Resolved' } }),
        Ticket.count({ where: { created_by: req.user.id, status: 'Closed' } }),
        Ticket.findAll({
          where: { created_by: req.user.id },
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [
            { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
          ]
        })
      ]);

      stats = {
        totals: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets
        },
        byStatus: [
          { status: 'Open', count: openTickets },
          { status: 'In Progress', count: inProgressTickets },
          { status: 'Resolved', count: resolvedTickets },
          { status: 'Closed', count: closedTickets }
        ],
        recentTickets
      };
    } else if (req.user.role === 'agent') {
      const assignments = await TicketAssignment.findAll({
        where: { agent_id: req.user.id },
        attributes: ['ticket_id']
      });
      const assignedTicketIds = assignments.map(a => a.ticket_id);

      const whereAssigned = assignedTicketIds.length ? { id: { [Op.in]: assignedTicketIds } } : { id: null };

      const [totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets, recentTickets] = await Promise.all([
        Ticket.count({ where: whereAssigned }),
        Ticket.count({ where: { ...whereAssigned, status: 'Open' } }),
        Ticket.count({ where: { ...whereAssigned, status: 'In Progress' } }),
        Ticket.count({ where: { ...whereAssigned, status: 'Resolved' } }),
        Ticket.count({ where: { ...whereAssigned, status: 'Closed' } }),
        Ticket.findAll({
          where: whereAssigned,
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [
            { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
          ]
        })
      ]);

      stats = {
        totals: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets
        },
        byStatus: statusList.map(status => ({
          status,
          count: status === 'Open' ? openTickets :
            status === 'In Progress' ? inProgressTickets :
            status === 'Resolved' ? resolvedTickets : closedTickets
        })),
        recentTickets
      };
    } else if (req.user.role === 'admin') {
      const [totalUsers, totalClients, totalAgents, totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets, recentTickets] = await Promise.all([
        User.count(),
        User.count({ where: { role: 'client' } }),
        User.count({ where: { role: 'agent' } }),
        Ticket.count(),
        Ticket.count({ where: { status: 'Open' } }),
        Ticket.count({ where: { status: 'In Progress' } }),
        Ticket.count({ where: { status: 'Resolved' } }),
        Ticket.count({ where: { status: 'Closed' } }),
        Ticket.findAll({
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [
            { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
          ]
        })
      ]);

      const assignments = await TicketAssignment.findAll({
        where: { agent_id: { [Op.ne]: null } },
        attributes: ['ticket_id']
      });
      const assignedTicketIds = assignments.map(a => a.ticket_id);
      const unassignedTickets = assignedTicketIds.length
        ? await Ticket.count({ where: { id: { [Op.notIn]: assignedTicketIds } } })
        : totalTickets;

      stats = {
        users: {
          total: totalUsers,
          clients: totalClients,
          agents: totalAgents
        },
        totals: {
          total: totalTickets,
          open: openTickets,
          inProgress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets,
          unassigned: unassignedTickets
        },
        byStatus: statusList.map(status => ({
          status,
          count: status === 'Open' ? openTickets :
            status === 'In Progress' ? inProgressTickets :
            status === 'Resolved' ? resolvedTickets : closedTickets
        })),
        recentTickets
      };
    }

    res.json(stats);
  } catch (err) {
    console.error('Statistics error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get ticket trends (for charts) - admin only
router.get('/trends', authenticate, requireRole(['admin']), apiLimiter, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const ticketsByDate = await Ticket.findAll({
      attributes: [
        [Ticket.sequelize.fn('DATE', Ticket.sequelize.col('created_at')), 'date'],
        [Ticket.sequelize.fn('COUNT', Ticket.sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: startDate }
      },
      group: [Ticket.sequelize.fn('DATE', Ticket.sequelize.col('created_at'))],
      order: [[Ticket.sequelize.fn('DATE', Ticket.sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    res.json(ticketsByDate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

