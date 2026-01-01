import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function NewTicket(){
  const [title,setTitle] = useState('')
  const [description,setDescription] = useState('')
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    const token = localStorage.getItem('token')
    try{
      const res = await axios.post('http://localhost:4000/api/tickets', { title, description }, { headers: { Authorization: `Bearer ${token}` } })
      nav(`/tickets/${res.data.id}`)
    }catch(err){
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Create a new ticket</h2>
      <form onSubmit={submit} className="space-y-4">
        <input className="input input-bordered w-full" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="textarea textarea-bordered w-full" placeholder="Describe the issue" value={description} onChange={e=>setDescription(e.target.value)} />
        <div className="flex items-center justify-end">
          <button className="btn btn-primary">Submit Ticket</button>
        </div>
      </form>
    </div>
  )
}
