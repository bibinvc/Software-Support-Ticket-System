import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ticketsAPI, statisticsAPI } from '../services/api'

export default function Dashboard(){
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    priority_id: '',
    category_id: '',
    q: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const nav = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'
  const isAgent = user.role === 'agent' || isAdmin

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = { ...filters }
      if (searchQuery) params.q = searchQuery
      const [ticketsRes, statsRes] = await Promise.all([
        ticketsAPI.getAll(params),
        statisticsAPI.getDashboard()
      ])
      setTickets(ticketsRes.data.tickets || ticketsRes.data)
      setStats(statsRes.data)
    } catch(err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters({ ...filters, q: searchQuery })
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

  const getPriorityBadge = (priority) => {
    if (!priority) return null
    const colors = {
      'Low': 'badge-ghost',
      'Medium': 'badge-info',
      'High': 'badge-warning',
      'Critical': 'badge-error'
    }
    return <span className={`badge badge-sm ${colors[priority.name] || 'badge-ghost'}`}>{priority.name}</span>
  }

  if (loading && !stats) {
    return <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-gray-500 mt-1">Welcome back, {user.name || 'User'}!</p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Ticket
        </Link>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-title">Total Tickets</div>
            <div className="stat-value text-primary">{stats.totals?.total || 0}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-title">Open</div>
            <div className="stat-value text-info">{stats.totals?.open || 0}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-title">In Progress</div>
            <div className="stat-value text-warning">{stats.totals?.inProgress || 0}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-title">Resolved</div>
            <div className="stat-value text-success">{stats.totals?.resolved || 0}</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-base-100 p-4 rounded-lg shadow">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tickets..."
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="select select-bordered"
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <button type="submit" className="btn btn-primary">Search</button>
          {(filters.status || filters.q) && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setFilters({ status: '', priority_id: '', category_id: '', q: '' })
                setSearchQuery('')
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-base-100 rounded-lg shadow">
            <p className="text-gray-500 text-lg">No tickets found</p>
            <Link to="/tickets/new" className="btn btn-primary mt-4">Create Your First Ticket</Link>
          </div>
        ) : (
          tickets.map(ticket => (
            <div
              key={ticket.id}
              className="card bg-base-100 shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => nav(`/tickets/${ticket.id}`)}
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="card-title text-lg">#{ticket.id} - {ticket.title}</h3>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <p className="text-gray-600 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                      {ticket.creator && <span>By: {ticket.creator.name}</span>}
                      {ticket.category && <span>Category: {ticket.category.name}</span>}
                      {ticket.ticket_assignments?.[0]?.agent && (
                        <span className="badge badge-sm">Assigned to: {ticket.ticket_assignments[0].agent.name}</span>
                      )}
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
          ))
        )}
      </div>
    </div>
  )
}
