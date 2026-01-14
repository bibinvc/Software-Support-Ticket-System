import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const token = typeof window !== 'undefined' && localStorage.getItem('token')
  const user = token ? JSON.parse(localStorage.getItem('user') || '{}') : null

  return (
    <div className="space-y-12">
      <div className="hero bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-12">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Software Support Ticketing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Submit issues, track progress, and get resolutions fast. Admins assign tickets
              to agents, and every update is tracked with full audit history.
            </p>
            <div className="flex gap-4 justify-center">
              {token ? (
                <>
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    Go to Dashboard
                  </Link>
                  <Link to="/tickets" className="btn btn-outline btn-lg">
                    View Tickets
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Create Client Account
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="text-sm text-gray-400 mb-2">01</div>
            <h3 className="card-title">Submit Issues</h3>
            <p className="text-gray-600">
              Clients create tickets with categories, priorities, and attachments for clarity.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="text-sm text-gray-400 mb-2">02</div>
            <h3 className="card-title">Admin Assignment</h3>
            <p className="text-gray-600">
              Admins assign tickets to agents and track ownership from one place.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="text-sm text-gray-400 mb-2">03</div>
            <h3 className="card-title">Resolution Workflow</h3>
            <p className="text-gray-600">
              Agents update status, add internal notes, and resolve issues with a full trail.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-base-100 p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="text-2xl">A</div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Secure Authentication</h4>
              <p className="text-gray-600">Role-based access with JWT sessions and optional MFA.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-2xl">B</div>
            <div>
              <h4 className="font-semibold text-lg mb-2">File Attachments</h4>
              <p className="text-gray-600">Attach screenshots and documents directly to tickets.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-2xl">C</div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Smart Filters</h4>
              <p className="text-gray-600">Search by status, category, priority, or assigned agent.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-2xl">D</div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Audit History</h4>
              <p className="text-gray-600">Every change is logged for compliance and traceability.</p>
            </div>
          </div>
        </div>
      </div>

      {user && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Welcome back, {user.name}! You're logged in as {user.role}.</span>
        </div>
      )}
    </div>
  )
}
