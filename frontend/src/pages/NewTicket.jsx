import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketsAPI, categoriesAPI, prioritiesAPI } from '../services/api'

export default function NewTicket(){
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priorityId, setPriorityId] = useState('')
  const [categories, setCategories] = useState([])
  const [priorities, setPriorities] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsRes, priRes] = await Promise.all([
          categoriesAPI.getAll(),
          prioritiesAPI.getAll()
        ])
        setCategories(catsRes.data)
        setPriorities(priRes.data)
      } catch(err) {
        console.error('Failed to load categories/priorities:', err)
      }
    }
    loadData()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required')
      return
    }

    setLoading(true)
    try {
      const res = await ticketsAPI.create({
        title,
        description,
        category_id: categoryId || null,
        priority_id: priorityId || null
      })
      nav(`/tickets/${res.data.id}`)
    } catch(err) {
      setError(err.response?.data?.error || err.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-base-100 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Create New Ticket</h2>
        <p className="text-gray-500 mb-6">Describe your issue and we'll help you resolve it.</p>

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Title</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full" 
              placeholder="Brief summary of the issue" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea 
              className="textarea textarea-bordered w-full h-32" 
              placeholder="Provide detailed information about the issue..." 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Category</span>
              </label>
              <select 
                className="select select-bordered w-full" 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Priority</span>
              </label>
              <select 
                className="select select-bordered w-full" 
                value={priorityId} 
                onChange={e => setPriorityId(e.target.value)}
              >
                <option value="">Select priority</option>
                {priorities.map(pri => (
                  <option key={pri.id} value={pri.id}>{pri.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-6">
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={() => nav('/dashboard')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
