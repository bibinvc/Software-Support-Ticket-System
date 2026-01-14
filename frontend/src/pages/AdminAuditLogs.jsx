import React, { useEffect, useState } from 'react'
import { auditAPI } from '../services/api'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    entity_type: '',
    entity_id: '',
    action: '',
    user_id: ''
  })

  useEffect(() => {
    loadLogs()
  }, [filters])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.entity_type) params.entity_type = filters.entity_type
      if (filters.entity_id) params.entity_id = filters.entity_id
      if (filters.action) params.action = filters.action
      if (filters.user_id) params.user_id = filters.user_id

      const res = await auditAPI.getAll(params)
      setLogs(res.data.logs || res.data || [])
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action) => {
    const colors = {
      created: 'badge-success',
      updated: 'badge-info',
      assigned: 'badge-warning',
      deleted: 'badge-error',
      commented: 'badge-ghost'
    }
    return <span className={`badge ${colors[action] || 'badge-ghost'}`}>{action}</span>
  }

  const formatChanges = (payload) => {
    if (!payload || !payload.changes) return null

    const changes = payload.changes
    return Object.keys(changes).map(key => {
      const change = changes[key]
      return (
        <div key={key} className="text-sm">
          <span className="font-semibold">{key}:</span>{' '}
          <span className="text-error">{change.from !== null ? String(change.from) : 'null'}</span>
          {' -> '}
          <span className="text-success">{change.to !== null ? String(change.to) : 'null'}</span>
        </div>
      )
    })
  }

  if (loading) {
    return <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Audit Logs</h2>
          <p className="text-gray-500 mt-1">
            Complete activity history of all ticketing changes
          </p>
        </div>
      </div>

      <div className="bg-base-100 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="select select-bordered"
            value={filters.entity_type}
            onChange={e => setFilters({ ...filters, entity_type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="ticket">Ticket</option>
            <option value="user">User</option>
            <option value="category">Category</option>
            <option value="priority">Priority</option>
          </select>
          <input
            type="number"
            className="input input-bordered"
            placeholder="Entity ID"
            value={filters.entity_id}
            onChange={e => setFilters({ ...filters, entity_id: e.target.value })}
          />
          <select
            className="select select-bordered"
            value={filters.action}
            onChange={e => setFilters({ ...filters, action: e.target.value })}
          >
            <option value="">All Actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="assigned">Assigned</option>
            <option value="commented">Commented</option>
            <option value="registered">Registered</option>
            <option value="login_success">Login Success</option>
            <option value="login_failed">Login Failed</option>
            <option value="mfa_enabled">MFA Enabled</option>
            <option value="mfa_disabled">MFA Disabled</option>
          </select>
          <input
            type="number"
            className="input input-bordered"
            placeholder="User ID"
            value={filters.user_id}
            onChange={e => setFilters({ ...filters, user_id: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-base-100 rounded-lg shadow">
            <p className="text-gray-500 text-lg">No audit logs found</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getActionBadge(log.action)}
                      <span className="font-semibold">
                        {log.performer?.name || 'System'} ({log.performer?.role || 'unknown'})
                      </span>
                      {log.entity_type && (
                        <span className="text-gray-500">
                          {log.entity_type} #{log.entity_id}
                        </span>
                      )}
                    </div>
                    {log.payload?.changes && (
                      <div className="mt-2 p-3 bg-base-200 rounded">
                        <div className="font-semibold mb-2">Changes:</div>
                        {formatChanges(log.payload)}
                      </div>
                    )}
                    {log.action === 'attachment_uploaded' && log.payload && (
                      <div className="mt-2 text-sm">
                        <span className="font-semibold">File:</span> {log.payload.filename}
                        <span className="text-gray-500 ml-2">
                          ({(log.payload.size_bytes / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                    )}
                    {log.payload && !log.payload.changes && log.action !== 'attachment_uploaded' && (
                      <div className="mt-2 text-sm text-gray-600">
                        {JSON.stringify(log.payload, null, 2)}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
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
