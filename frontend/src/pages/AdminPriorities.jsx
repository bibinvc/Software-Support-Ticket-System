import React, { useEffect, useState } from 'react'
import { prioritiesAPI } from '../services/api'

export default function AdminPriorities() {
  const [priorities, setPriorities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPriority, setEditingPriority] = useState(null)
  const [formData, setFormData] = useState({ name: '', rank: 0 })

  useEffect(() => {
    loadPriorities()
  }, [])

  const loadPriorities = async () => {
    try {
      const res = await prioritiesAPI.getAll()
      setPriorities(res.data.sort((a, b) => a.rank - b.rank))
    } catch(err) {
      console.error('Failed to load priorities:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPriority(null)
    setFormData({ name: '', rank: 0 })
    setShowModal(true)
  }

  const handleEdit = (priority) => {
    setEditingPriority(priority)
    setFormData({ name: priority.name, rank: priority.rank })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPriority) {
        await prioritiesAPI.update(editingPriority.id, formData)
      } else {
        await prioritiesAPI.create(formData)
      }
      setShowModal(false)
      loadPriorities()
    } catch(err) {
      alert(err.response?.data?.error || 'Failed to save priority')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this priority?')) return
    try {
      await prioritiesAPI.delete(id)
      loadPriorities()
    } catch(err) {
      alert(err.response?.data?.error || 'Failed to delete priority')
    }
  }

  if (loading) {
    return <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Priority Management</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Priority
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Rank</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {priorities.map(priority => (
              <tr key={priority.id}>
                <td>{priority.id}</td>
                <td><span className="badge">{priority.name}</span></td>
                <td>{priority.rank}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(priority)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(priority.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingPriority ? 'Edit Priority' : 'Create Priority'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Rank (lower = lower urgency)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={formData.rank}
                  onChange={e => setFormData({ ...formData, rank: parseInt(e.target.value) })}
                  required
                  min="0"
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPriority ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

