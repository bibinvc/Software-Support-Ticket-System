import React, { useEffect, useState } from 'react'
import { categoriesAPI } from '../services/api'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll()
      setCategories(res.data)
    } catch(err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setShowModal(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData)
      } else {
        await categoriesAPI.create(formData)
      }
      setShowModal(false)
      loadCategories()
    } catch(err) {
      alert(err.response?.data?.error || 'Failed to save category')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await categoriesAPI.delete(id)
      loadCategories()
    } catch(err) {
      alert(err.response?.data?.error || 'Failed to delete category')
    }
  }

  if (loading) {
    return <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Category Management</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <div key={category.id} className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">{category.name}</h3>
              {category.description && <p className="text-gray-600">{category.description}</p>}
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(category)}>
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleDelete(category.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingCategory ? 'Edit Category' : 'Create Category'}
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
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

