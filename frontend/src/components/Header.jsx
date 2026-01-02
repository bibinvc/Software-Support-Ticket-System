import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header(){
  const token = typeof window !== 'undefined' && localStorage.getItem('token')
  const user = token ? JSON.parse(localStorage.getItem('user') || '{}') : null
  const isAdmin = user?.role === 'admin'
  const isAgent = user?.role === 'agent' || isAdmin
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <header className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white font-extrabold text-lg backdrop-blur-sm">
              ST
            </div>
            <div>
              <div className="text-lg font-semibold">Support Tickets</div>
              <div className="text-xs text-white/70">IT Helpdesk System</div>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link className="text-sm font-medium hover:text-white/80 transition-colors" to="/">
            Home
          </Link>
          {token ? (
            <>
              <Link className="text-sm font-medium hover:text-white/80 transition-colors" to="/dashboard">
                Dashboard
              </Link>
              <Link className="text-sm font-medium hover:text-white/80 transition-colors" to="/tickets/new">
                New Ticket
              </Link>
              {isAdmin && (
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="text-sm font-medium hover:text-white/80 transition-colors cursor-pointer">
                    Admin
                  </label>
                  <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-2 text-gray-700">
                    <li><Link to="/admin/users">Users</Link></li>
                    <li><Link to="/admin/categories">Categories</Link></li>
                    <li><Link to="/admin/priorities">Priorities</Link></li>
                    <li><Link to="/admin/audit">Audit Logs</Link></li>
                  </ul>
                </div>
              )}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                  <span className="text-sm font-medium">{user?.name || 'User'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-2 text-gray-700">
                  <li><a onClick={handleLogout}>Logout</a></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link className="text-sm font-medium hover:text-white/80 transition-colors" to="/login">
                Login
              </Link>
              <Link 
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
                to="/register"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
