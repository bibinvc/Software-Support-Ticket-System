import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import NewService from './pages/NewService'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Home from './pages/Home'
import AdminUsers from './pages/AdminUsers'
import AdminCategories from './pages/AdminCategories'
import AdminAuditLogs from './pages/AdminAuditLogs'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

import Header from './components/Header'
import Footer from './components/Footer'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
        <Route path="/services" element={<Services />} />
        <Route 
          path="/services/new" 
          element={
            <ProtectedRoute>
              <NewService />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/:id" 
          element={
            <ProtectedRoute>
              <ServiceDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id" 
          element={
            <ProtectedRoute>
              <OrderDetail />
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
          path="/admin/audit" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminAuditLogs />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </main>
    <Footer />
  </BrowserRouter>
)

createRoot(document.getElementById('root')).render(<App />)
