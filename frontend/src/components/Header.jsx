import React from 'react'
import { Link } from 'react-router-dom'

export default function Header(){
  const token = typeof window !== 'undefined' && localStorage.getItem('token')
  return (
    <header className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white">
      <div className="app-container flex items-center justify-between py-5">
        <div className="flex items-center gap-4">
          <div className="logo flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white font-extrabold text-lg">ST</div>
            <div>
              <div className="text-lg font-semibold">Support Tickets</div>
              <div className="text-xs text-gray-500">IT helpdesk</div>
            </div>
          </div>
        </div>

        <nav className="header-nav">
          <Link className="text-sm uppercase tracking-wide text-white/90 hover:text-white" to="/">Home</Link>
          <Link className="text-sm uppercase tracking-wide text-white/90 hover:text-white" to="/dashboard">Dashboard</Link>
          <Link className="inline-flex items-center justify-center px-3 py-1.5 border border-white/30 rounded text-sm uppercase text-white/90 hover:bg-white/10" to="/tickets/new">New Ticket</Link>
          {token ? (
            <button className="ml-2 px-3 py-1.5 rounded bg-white/10 text-white/90 hover:bg-white/20">Account</button>
          ) : (
            <Link className="ml-2 text-sm uppercase text-white/90 hover:text-white" to="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
