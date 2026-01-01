import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewTicket from './pages/NewTicket'
import Ticket from './pages/Ticket'
import Home from './pages/Home'
import './index.css'

import Header from './components/Header'
import Footer from './components/Footer'

const App = () => (
  <BrowserRouter>
    <Header />
    <main className="container mx-auto px-4 app-container py-8">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets/new" element={<NewTicket />} />
        <Route path="/tickets/:id" element={<Ticket />} />
      </Routes>
    </main>
    <Footer />
  </BrowserRouter>
)

createRoot(document.getElementById('root')).render(<App />)
