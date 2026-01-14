import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { statisticsAPI, usersAPI } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        statisticsAPI.getDashboard(),
        isAdmin ? usersAPI.getAll() : Promise.resolve({ data: [] })
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data || [])
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const statusLabels = [
    { key: 'open', label: 'Open', color: 'text-info' },
    { key: 'inProgress', label: 'In Progress', color: 'text-warning' },
    { key: 'resolved', label: 'Resolved', color: 'text-success' },
    { key: 'closed', label: 'Closed', color: 'text-neutral' }
  ]

  if (loading && !stats) {
    return <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-gray-500 mt-1">Welcome back, {user.name || 'User'}! ({user.role})</p>
        </div>
        <div className="flex gap-2">
          <Link to="/tickets" className="btn btn-outline">View Tickets</Link>
          {user.role === 'client' && (
            <Link to="/tickets/new" className="btn btn-primary">New Ticket</Link>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-title">Total Tickets</div>
            <div className="stat-value text-primary">{stats.totals?.total || 0}</div>
            {isAdmin && (
              <div className="stat-desc">Unassigned: {stats.totals?.unassigned || 0}</div>
            )}
          </div>
          {statusLabels.map(item => (
            <div key={item.key} className="stat bg-base-200 rounded-lg shadow">
              <div className="stat-title">{item.label}</div>
              <div className={`stat-value ${item.color}`}>{stats.totals?.[item.key] || 0}</div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && stats?.users && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary">{stats.users.total || 0}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-title">Clients</div>
            <div className="stat-value text-info">{stats.users.clients || 0}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg shadow">
            <div className="stat-title">Agents</div>
            <div className="stat-value text-success">{stats.users.agents || 0}</div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title">Agents</h3>
                <span className="badge">{users.filter(u => u.role === 'agent').length}</span>
              </div>
              {users.filter(u => u.role === 'agent').length === 0 ? (
                <p className="text-sm text-gray-500">No agents yet.</p>
              ) : (
                <div className="space-y-2">
                  {users.filter(u => u.role === 'agent').map(userItem => (
                    <div key={userItem.id} className="flex items-center justify-between text-sm bg-base-200 rounded p-2">
                      <div>
                        <div className="font-semibold">{userItem.name}</div>
                        <div className="text-gray-500">{userItem.email}</div>
                      </div>
                      <span className={`badge ${userItem.is_active ? 'badge-success' : 'badge-error'}`}>
                        {userItem.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title">Clients</h3>
                <span className="badge">{users.filter(u => u.role === 'client').length}</span>
              </div>
              {users.filter(u => u.role === 'client').length === 0 ? (
                <p className="text-sm text-gray-500">No clients yet.</p>
              ) : (
                <div className="space-y-2">
                  {users.filter(u => u.role === 'client').map(userItem => (
                    <div key={userItem.id} className="flex items-center justify-between text-sm bg-base-200 rounded p-2">
                      <div>
                        <div className="font-semibold">{userItem.name}</div>
                        <div className="text-gray-500">{userItem.email}</div>
                      </div>
                      <span className={`badge ${userItem.is_active ? 'badge-success' : 'badge-error'}`}>
                        {userItem.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-title">Recent Tickets</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => nav('/tickets')}>View all</button>
          </div>
          {loading ? (
            <div className="text-center py-6"><span className="loading loading-spinner"></span></div>
          ) : stats?.recentTickets?.length ? (
            <div className="space-y-3">
              {stats.recentTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 bg-base-200 rounded cursor-pointer"
                  onClick={() => nav(`/tickets/${ticket.id}`)}
                >
                  <div>
                    <div className="font-semibold">#{ticket.id} {ticket.title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="badge">{ticket.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No tickets yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
