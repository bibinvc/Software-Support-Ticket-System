import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

export default function Ticket(){
  const { id } = useParams()
  const [ticket,setTicket] = useState(null)
  const [message,setMessage] = useState('')

  useEffect(()=>{
    const load = async ()=>{
      const token = localStorage.getItem('token')
      const res = await axios.get(`http://localhost:4000/api/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setTicket(res.data)
    }
    load()
  }, [id])

  const postComment = async ()=>{
    const token = localStorage.getItem('token')
    await axios.post(`http://localhost:4000/api/tickets/${id}/comments`, { message }, { headers: { Authorization: `Bearer ${token}` } })
    const res = await axios.get(`http://localhost:4000/api/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    setTicket(res.data)
    setMessage('')
  }

  if(!ticket) return <div className="text-center py-12">Loading...</div>
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{ticket.title}</h2>
          <p className="text-sm text-gray-500">Created by: {ticket.created_by}</p>
        </div>
        <div className="text-right">
          <span className="badge">{ticket.status}</span>
        </div>
      </div>

      <div className="mt-4 text-gray-700">{ticket.description}</div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Comments</h3>
        <div className="space-y-3">
          {ticket.ticket_comments?.map(c=> (
            <div key={c.id} className={`p-3 rounded ${c.is_internal? 'bg-slate-50 border-l-4 border-teal-200' : 'bg-gray-50'}`}>
              <div className="text-sm text-gray-600">{c.user_id} {c.is_internal? <span className="text-xs text-red-500">(internal)</span> : null}</div>
              <div className="mt-1 text-gray-800">{c.message}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <textarea className="textarea textarea-bordered w-full" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write a comment" />
        <div className="flex justify-end mt-2">
          <button className="btn btn-primary" onClick={postComment}>Add Comment</button>
        </div>
      </div>
    </div>
  )
}
