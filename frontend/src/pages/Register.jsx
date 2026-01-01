import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const nav = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    try{
      await axios.post('http://localhost:4000/api/auth/register', { name, email, password })
      nav('/login')
    }catch(err){
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-xs text-gray-600">Full name</label>
          <input className="input input-bordered w-full" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          <label className="block text-xs text-gray-600">Email</label>
          <input className="input input-bordered w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <label className="block text-xs text-gray-600">Password</label>
          <input className="input input-bordered w-full" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="flex items-center justify-between">
            <button className="btn btn-primary">Create account</button>
            <a className="text-sm text-teal-600" href="/login">Already have an account?</a>
          </div>
        </form>
      </div>
    </div>
  )
}
