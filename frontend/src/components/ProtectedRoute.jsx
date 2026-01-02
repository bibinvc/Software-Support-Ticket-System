import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem('token')
  const user = token ? JSON.parse(localStorage.getItem('user') || '{}') : null

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

