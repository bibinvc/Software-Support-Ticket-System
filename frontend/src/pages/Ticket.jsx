import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ticketsAPI, commentsAPI, attachmentsAPI, categoriesAPI, prioritiesAPI, usersAPI, auditAPI } from '../services/api'

export default function Ticket(){
  const { id } = useParams()
  const nav = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [message, setMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editPriorityId, setEditPriorityId] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editAgentId, setEditAgentId] = useState('')
  const [categories, setCategories] = useState([])
  const [priorities, setPriorities] = useState([])
  const [agents, setAgents] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'
  const isAgent = user.role === 'agent' || isAdmin
  const canEdit = isAgent || (ticket && ticket.created_by === user.id)

  useEffect(() => {
    loadTicket()
    if (isAgent) {
      loadOptions()
    }
    loadAuditLogs()
  }, [id])
  
  const loadAuditLogs = async () => {
    try {
      const res = await auditAPI.getByTicket(id)
      setAuditLogs(res.data)
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    }
  }

  const loadTicket = async () => {
    setLoading(true)
    try {
      const res = await ticketsAPI.getById(id)
      setTicket(res.data)
      setEditTitle(res.data.title)
      setEditDescription(res.data.description)
      setEditStatus(res.data.status)
      setEditPriorityId(res.data.priority_id || '')
      setEditCategoryId(res.data.category_id || '')
      setEditAgentId(res.data.ticket_assignments?.[0]?.agent_id || '')
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }

  const loadOptions = async () => {
    try {
      const [catsRes, priRes, agentsRes] = await Promise.all([
        categoriesAPI.getAll(),
        prioritiesAPI.getAll(),
        usersAPI.getAgents()
      ])
      setCategories(catsRes.data)
      setPriorities(priRes.data)
      setAgents(agentsRes.data)
    } catch(err) {
      console.error('Failed to load options:', err)
    }
  }

  const postComment = async () => {
    if (!message.trim()) return
    setSubmitting(true)
    try {
      await commentsAPI.create(id, message, isInternal && isAgent)
      setMessage('')
      setIsInternal(false)
      await loadTicket()
      await loadAuditLogs() // Reload audit logs after comment
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const uploadFile = async () => {
    if (!file) return
    setUploading(true)
    try {
      await attachmentsAPI.upload(id, file)
      setFile(null)
      await loadTicket()
      await loadAuditLogs() // Reload audit logs after upload
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const updateTicket = async () => {
    setSubmitting(true)
    try {
      await ticketsAPI.update(id, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority_id: editPriorityId || null,
        category_id: editCategoryId || null
      })
      
      if (isAgent && editAgentId !== (ticket.ticket_assignments?.[0]?.agent_id || '')) {
        await ticketsAPI.assign(id, editAgentId || null)
      }
      
      setEditing(false)
      await loadTicket()
      await loadAuditLogs() // Reload audit logs after update
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to update ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const downloadFile = async (attachmentId, filename) => {
    try {
      const res = await attachmentsAPI.download(attachmentId)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch(err) {
      setError('Failed to download file')
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

  if (loading) {
    return <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-error text-lg">Ticket not found</p>
        <button className="btn btn-primary mt-4" onClick={() => nav('/dashboard')}>Back to Dashboard</button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Ticket Header */}
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                className="input input-bordered w-full mb-4 text-2xl font-bold"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
            ) : (
              <h2 className="text-3xl font-bold mb-2">#{ticket.id} - {ticket.title}</h2>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              {getStatusBadge(ticket.status)}
              {ticket.priority && (
                <span className="badge badge-sm">{ticket.priority.name}</span>
              )}
              {ticket.category && (
                <span className="badge badge-ghost badge-sm">{ticket.category.name}</span>
              )}
            </div>
          </div>
          {canEdit && !editing && (
            <button className="btn btn-sm btn-ghost" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <textarea
              className="textarea textarea-bordered w-full"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              rows={6}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isAgent && (
                <select
                  className="select select-bordered"
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              )}
              <select
                className="select select-bordered"
                value={editPriorityId}
                onChange={e => setEditPriorityId(e.target.value)}
              >
                <option value="">No Priority</option>
                {priorities.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                className="select select-bordered"
                value={editCategoryId}
                onChange={e => setEditCategoryId(e.target.value)}
              >
                <option value="">No Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {isAgent && (
                <select
                  className="select select-bordered"
                  value={editAgentId}
                  onChange={e => setEditAgentId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={updateTicket}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setEditing(false)
                  loadTicket()
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            <div className="mt-4 text-sm text-gray-500 space-y-1">
              <p>Created: {new Date(ticket.created_at).toLocaleString()}</p>
              {ticket.creator && <p>Created by: {ticket.creator.name} ({ticket.creator.email})</p>}
              {ticket.ticket_assignments?.[0]?.agent && (
                <p>Assigned to: {ticket.ticket_assignments[0].agent.name}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Attachments */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="bg-base-100 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Attachments ({ticket.attachments.length})</h3>
          <div className="space-y-4">
            {ticket.attachments.map(att => {
              const isImage = att.content_type && att.content_type.startsWith('image/');
              const imageUrl = isImage ? `http://localhost:4000/api/attachments/${att.id}/download` : null;
              
              return (
                <div key={att.id} className="p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{att.filename}</p>
                      <p className="text-sm text-gray-500">
                        {(att.size_bytes / 1024).toFixed(2)} KB • {new Date(att.created_at).toLocaleDateString()}
                        {att.uploader && ` • Uploaded by: ${att.uploader.name}`}
                      </p>
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => downloadFile(att.id, att.filename)}
                    >
                      Download
                    </button>
                  </div>
                  {isImage && imageUrl && (
                    <div className="mt-3">
                      <img 
                        src={imageUrl} 
                        alt={att.filename}
                        className="max-w-full h-auto rounded-lg border border-base-300"
                        style={{ maxHeight: '400px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* File Upload */}
      <div className="bg-base-100 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Upload Attachment</h3>
        <div className="flex gap-4">
          <input
            type="file"
            className="file-input file-input-bordered flex-1"
            onChange={e => setFile(e.target.files[0])}
          />
          <button
            className="btn btn-primary"
            onClick={uploadFile}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-base-100 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Comments</h3>
        <div className="space-y-4 mb-6">
          {ticket.ticket_comments && ticket.ticket_comments.length > 0 ? (
            ticket.ticket_comments.map(comment => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg ${
                  comment.is_internal
                    ? 'bg-warning/10 border-l-4 border-warning'
                    : 'bg-base-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{comment.user?.name || 'Unknown'}</span>
                    {comment.is_internal && (
                      <span className="badge badge-warning badge-sm">Internal</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          )}
        </div>

        <div className="space-y-3">
          {isAgent && (
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox"
                checked={isInternal}
                onChange={e => setIsInternal(e.target.checked)}
              />
              <span className="label-text">Internal note (only visible to agents/admins)</span>
            </label>
          )}
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Write a comment..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end">
            <button
              className="btn btn-primary"
              onClick={postComment}
              disabled={!message.trim() || submitting}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      {(isAgent || (ticket && ticket.created_by === user.id)) && (
        <div className="bg-base-100 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Activity History</h3>
            {isAdmin && (
              <Link to={`/admin/audit/ticket/${id}`} className="btn btn-sm btn-ghost">
                View Full Logs
              </Link>
            )}
          </div>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No activity history yet</p>
            ) : (
              auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="text-sm p-3 bg-base-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{log.performer?.name || 'System'}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-sm">{log.action}</span>
                  {log.payload?.changes && (
                    <span className="text-xs text-gray-600">
                      {Object.keys(log.payload.changes).length} change(s)
                    </span>
                  )}
                </div>
                {log.payload?.changes && (
                  <div className="text-xs text-gray-600 mt-2">
                    {Object.keys(log.payload.changes).map(key => {
                      const change = log.payload.changes[key]
                      return (
                        <div key={key}>
                          {key}: <span className="text-error">{String(change.from || 'null')}</span> → <span className="text-success">{String(change.to || 'null')}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
                {log.action === 'commented' && log.payload && (
                  <div className="text-xs text-gray-600 mt-2">
                    Comment: {log.payload.message_preview}
                    {log.payload.is_internal && <span className="badge badge-warning badge-xs ml-1">Internal</span>}
                  </div>
                )}
                {log.action === 'attachment_uploaded' && log.payload && (
                  <div className="text-xs text-gray-600 mt-2">
                    Uploaded: {log.payload.filename}
                  </div>
                )}
              </div>
            ))
            )}
            {auditLogs.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                Showing 5 of {auditLogs.length} activities
                {isAdmin && (
                  <Link to={`/admin/audit/ticket/${id}`} className="link ml-2">View all</Link>
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
