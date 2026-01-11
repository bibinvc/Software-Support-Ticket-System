import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesAPI, categoriesAPI } from '../services/api'

export default function NewService(){
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [durationHours, setDurationHours] = useState('')
  const [location, setLocation] = useState('')
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await categoriesAPI.getAll()
        setCategories(res.data)
      } catch(err) {
        console.error('Failed to load categories:', err)
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

    if (!price || parseFloat(price) <= 0) {
      setError('Price must be greater than 0')
      return
    }

    setLoading(true)
    try {
      const res = await servicesAPI.create({
        title,
        description,
        category_id: categoryId || null,
        price: parseFloat(price),
        currency,
        duration_hours: durationHours ? parseInt(durationHours) : null,
        location: location || null
      })
      nav(`/services/${res.data.id}`)
    } catch(err) {
      setError(err.response?.data?.error || err.message || 'Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-base-100 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Create New Service</h2>
        <p className="text-gray-500 mb-6">List your service and start connecting with customers.</p>

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
              <span className="label-text font-semibold">Service Title</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full" 
              placeholder="e.g., Professional House Cleaning" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              required
              minLength={3}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea 
              className="textarea textarea-bordered w-full h-32" 
              placeholder="Describe your service in detail..." 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              required
              minLength={10}
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
                <span className="label-text font-semibold">Currency</span>
              </label>
              <select 
                className="select select-bordered w-full" 
                value={currency} 
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Price</span>
              </label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="input input-bordered w-full" 
                placeholder="0.00" 
                value={price} 
                onChange={e => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Duration (hours)</span>
              </label>
              <input 
                type="number" 
                min="1"
                className="input input-bordered w-full" 
                placeholder="Optional" 
                value={durationHours} 
                onChange={e => setDurationHours(e.target.value)}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Location</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full" 
              placeholder="e.g., New York, NY or Remote" 
              value={location} 
              onChange={e => setLocation(e.target.value)}
            />
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
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

