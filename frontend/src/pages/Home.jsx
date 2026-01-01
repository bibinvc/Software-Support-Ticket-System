import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  const token = typeof window !== 'undefined' && localStorage.getItem('token')
  const user = token ? JSON.parse(localStorage.getItem('user') || '{}') : null

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-12">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Software Support Ticket System
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              A modern, efficient helpdesk solution for managing IT support tickets. 
              Streamline your support workflow with powerful features and an intuitive interface.
            </p>
            <div className="flex gap-4 justify-center">
              {token ? (
                <>
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    Go to Dashboard
                  </Link>
                  <Link to="/tickets/new" className="btn btn-outline btn-lg">
                    Create New Ticket
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started
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

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="text-4xl mb-4">🎫</div>
            <h3 className="card-title">Ticket Management</h3>
            <p className="text-gray-600">
              Create, track, and manage support tickets with ease. Organize by priority, category, and status.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="card-title">Team Collaboration</h3>
            <p className="text-gray-600">
              Assign tickets to agents, add comments, and collaborate effectively to resolve issues quickly.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="card-title">Analytics & Insights</h3>
            <p className="text-gray-600">
              Track ticket statistics, monitor trends, and gain insights into your support operations.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="bg-base-100 p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="text-2xl">🔐</div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Secure Authentication</h4>
              <p className="text-gray-600">Role-based access control with secure JWT authentication.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-2xl">📎</div>
            <div>
              <h4 className="font-semibold text-lg mb-2">File Attachments</h4>
              <p className="text-gray-600">Upload and manage attachments for better issue documentation.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-2xl">🔍</div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Advanced Search</h4>
              <p className="text-gray-600">Search and filter tickets by status, priority, category, and more.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚡</div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Real-time Updates</h4>
              <p className="text-gray-600">Fast, responsive interface with instant updates and notifications.</p>
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
