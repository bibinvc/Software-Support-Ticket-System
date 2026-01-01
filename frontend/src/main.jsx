import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewTicket from './pages/NewTicket'
import Ticket from './pages/Ticket'
import Home from './pages/Home'
import AdminUsers from './pages/AdminUsers'
import AdminCategories from './pages/AdminCategories'
import AdminPriorities from './pages/AdminPriorities'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

import Header from './components/Header'
import Footer from './components/Footer'

const App = () => (
  <BrowserRouter>
    <Header />
    <main className="container mx-auto px-4 app-container py-8 min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tickets/new" 
          element={
            <ProtectedRoute>
              <NewTicket />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tickets/:id" 
          element={
            <ProtectedRoute>
              <Ticket />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/categories" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminCategories />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/priorities" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminPriorities />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </main>
    <Footer />
  </BrowserRouter>
)

createRoot(document.getElementById('root')).render(<App />)
