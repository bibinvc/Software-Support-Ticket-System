import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  const [tickets,setTickets] = useState([])

  useEffect(()=>{
    const t = async ()=>{
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:4000/api/tickets', { headers: { Authorization: `Bearer ${token}` } })
      setTickets(res.data)
    }
    t()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">My Tickets</h2>
        <Link className="btn btn-sm" to="/tickets/new">Create Ticket</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map(t => (
          <div key={t.id} className="card-compact hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-teal-100 to-cyan-50 flex items-center justify-center text-teal-700 font-semibold">{t.id}</div>
            <div className="flex-1">
              <Link className="text-lg font-medium text-teal-600 hover:underline" to={`/tickets/${t.id}`}>{t.title}</Link>
              <p className="text-sm text-gray-600 mt-2">{t.description?.slice(0,160)}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">{new Date(t.created_at).toLocaleString()}</div>
                <div><span className="badge">{t.status}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
