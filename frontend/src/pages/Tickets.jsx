import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketsAPI } from '../services/api'

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', q: '', page: 1 })
  const nav = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isClient = user.role === 'client'

  useEffect(() => {
    loadTickets()
  }, [filters])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const res = await ticketsAPI.getAll(filters)
      setTickets(res.data.tickets || [])
    } catch (err) {
      console.error('Failed to load tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      'Open': 'badge-info',
      'In Progress': 'badge-warning',
      'Resolved': 'badge-success',
      'Closed': 'badge-neutral'
    }
    return <span className={`badge ${colors[status] || 'badge-ghost'}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isClient ? 'My Tickets' : 'All Tickets'}</h1>
        {isClient && (
          <button className="btn btn-primary" onClick={() => nav('/tickets/new')}>
            New Ticket
          </button>
        )}
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              className="input input-bordered flex-1"
              placeholder="Search tickets..."
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
            />
            <select
              className="select select-bordered"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            {(filters.q || filters.status) && (
              <button
                className="btn btn-ghost"
                onClick={() => setFilters({ status: '', q: '', page: 1 })}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="alert alert-info">
          <span>No tickets found. Try adjusting your filters or create a new ticket.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className="card bg-base-100 shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => nav(`/tickets/${ticket.id}`)}
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="card-title text-lg">#{ticket.id} {ticket.title}</h3>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      {ticket.priority && (
                        <span className="badge badge-sm">{ticket.priority.name}</span>
                      )}
                      {ticket.category && (
                        <span className="badge badge-ghost badge-sm">{ticket.category.name}</span>
                      )}
                      {ticket.ticket_assignments?.[0]?.agent && (
                        <span>Assigned to: {ticket.ticket_assignments[0].agent.name}</span>
                      )}
                      <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
