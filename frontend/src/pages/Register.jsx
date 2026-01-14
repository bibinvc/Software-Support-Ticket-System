import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters and contain uppercase, lowercase, and number')
      return
    }

    setLoading(true)
    try {
      await authAPI.register(name, email, password)
      nav('/login', { state: { message: 'Account created successfully! Please sign in.' } })
    } catch(err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot connect to server. Please make sure the backend server is running on http://localhost:4000')
      } else if (err.response?.data?.details?.length) {
        setError(err.response.data.details.map(detail => detail.msg).join(', '))
      } else {
        setError(err.response?.data?.error || err.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-base-100 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-gray-500 mb-6">Create a client account to submit support tickets.</p>
        
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full" 
              placeholder="John Doe" 
              value={name} 
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input 
              type="email" 
              className="input input-bordered w-full" 
              placeholder="your@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input 
              type="password" 
              className="input input-bordered w-full" 
              placeholder="Password (min 8 chars, uppercase, lowercase, number)" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <label className="label">
              <span className="label-text-alt">Must contain uppercase, lowercase, and number</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input 
              type="password" 
              className="input input-bordered w-full" 
              placeholder="Confirm password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-control mt-6">
            <button 
              type="submit" 
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link to="/login" className="link link-primary">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
