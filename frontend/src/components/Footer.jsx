import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-100 bg-white">
      <div className="app-container py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="text-xl font-bold">Support Tickets</div>
          <div className="text-sm text-gray-600 mt-2">
            A simple helpdesk to submit and track IT requests. Built for small teams and enterprises.
          </div>
        </div>

        <div>
          <div className="font-semibold mb-2">Quick Links</div>
          <ul className="space-y-1 text-sm">
            <li><Link to="/" className="text-gray-600 hover:text-teal-600">Home</Link></li>
            <li><Link to="/dashboard" className="text-gray-600 hover:text-teal-600">Dashboard</Link></li>
            <li><Link to="/tickets/new" className="text-gray-600 hover:text-teal-600">Create Ticket</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-2">Contact</div>
          <div className="text-sm text-gray-600">
            <a href="mailto:support@ticket.com" className="hover:text-teal-600">support@ticket.com</a>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            <a href="tel:+33745720912" className="hover:text-teal-600">+33 7 45 72 09 12</a>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <a aria-label="twitter" className="text-gray-400 hover:text-teal-600" href="#">T</a>
            <a aria-label="linkedin" className="text-gray-400 hover:text-teal-600" href="#">L</a>
            <a aria-label="github" className="text-gray-400 hover:text-teal-600" href="#">G</a>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 py-4">
        (c) {new Date().getFullYear()} Support Tickets - All rights reserved.
      </div>
    </footer>
  )
}
