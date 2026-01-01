import React from 'react'
import { Link } from 'react-router-dom'
import Illustration from '../assets/illustration.svg'

export default function Home(){
  return (
    <div className="site-hero p-8 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-4xl font-extrabold">Support Tickets</h2>
          <p className="mt-3 text-lg text-gray-600 max-w-xl">A modern helpdesk to create, assign and resolve IT tickets quickly. Friendly for employees and powerful for support teams.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/tickets/new" className="btn btn-primary btn-lg">Create Ticket</Link>
            <Link to="/dashboard" className="btn btn-ghost">My Tickets</Link>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <img src={Illustration} alt="illustration" style={{width:'100%',borderRadius:12,boxShadow:'0 10px 30px rgba(2,6,23,0.06)'}} />
          </div>
        </div>
      </div>
    </div>
  )
}
