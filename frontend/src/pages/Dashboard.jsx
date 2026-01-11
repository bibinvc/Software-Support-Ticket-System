import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { servicesAPI, ordersAPI, statisticsAPI } from '../services/api'

export default function Dashboard(){
  const [services, setServices] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const nav = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'
  const isProvider = user.role === 'provider'
  const isCustomer = user.role === 'customer'

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes] = await Promise.all([
        statisticsAPI.getDashboard()
      ])
      setStats(statsRes.data)

      // Load role-specific data
      if (isProvider || isAdmin) {
        const servicesRes = await servicesAPI.getMyServices({ limit: 10 })
        setServices(servicesRes.data.services || [])
      }

      if (isCustomer || isProvider || isAdmin) {
        const ordersRes = await ordersAPI.getAll({ limit: 10 })
        setOrders(ordersRes.data.orders || [])
      }
    } catch(err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'in_progress': 'badge-primary',
      'completed': 'badge-success',
      'cancelled': 'badge-error',
      'active': 'badge-success',
      'inactive': 'badge-neutral',
      'suspended': 'badge-error'
    }
    return <span className={`badge ${colors[status] || 'badge-ghost'}`}>{status.replace('_', ' ')}</span>
  }

  if (loading && !stats) {
    return <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-gray-500 mt-1">Welcome back, {user.name || 'User'}! ({user.role})</p>
        </div>
        <div className="flex gap-2">
          {isProvider && (
            <Link to="/services/new" className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Service
            </Link>
          )}
          <Link to="/services" className="btn btn-outline">
            Browse Services
          </Link>
        </div>
      </div>

      {/* Statistics Cards - Role Based */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isCustomer && (
            <>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">Total Orders</div>
                <div className="stat-value text-primary">{stats.totals?.total || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">Pending</div>
                <div className="stat-value text-warning">{stats.totals?.pending || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">In Progress</div>
                <div className="stat-value text-info">{stats.totals?.inProgress || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">Completed</div>
                <div className="stat-value text-success">{stats.totals?.completed || 0}</div>
              </div>
            </>
          )}

          {isProvider && (
            <>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">My Services</div>
                <div className="stat-value text-primary">{stats.services?.total || 0}</div>
                <div className="stat-desc">Active: {stats.services?.active || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">Total Orders</div>
                <div className="stat-value text-info">{stats.orders?.total || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">Pending</div>
                <div className="stat-value text-warning">{stats.orders?.pending || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">In Progress</div>
                <div className="stat-value text-primary">{stats.orders?.inProgress || 0}</div>
              </div>
            </>
          )}

          {isAdmin && (
            <>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">Total Users</div>
                <div className="stat-value text-primary">{stats.users?.total || 0}</div>
                <div className="stat-desc">Customers: {stats.users?.customers || 0} | Providers: {stats.users?.providers || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">Total Services</div>
                <div className="stat-value text-info">{stats.services?.total || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">Total Orders</div>
                <div className="stat-value text-success">{stats.orders?.total || 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">Platform Health</div>
                <div className="stat-value text-success">Active</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <button
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        {(isProvider || isAdmin) && (
          <button
            className={`tab ${activeTab === 'services' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            My Services
          </button>
        )}
        {(isCustomer || isProvider || isAdmin) && (
          <button
            className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        )}
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (isProvider || isAdmin) && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 bg-base-100 rounded-lg shadow">
              <p className="text-gray-500 text-lg">No services yet</p>
              <Link to="/services/new" className="btn btn-primary mt-4">Create Your First Service</Link>
            </div>
          ) : (
            services.map(service => (
              <div
                key={service.id}
                className="card bg-base-100 shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => nav(`/services/${service.id}`)}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="card-title text-lg">{service.title}</h3>
                        {getStatusBadge(service.status)}
                        {service.is_available && <span className="badge badge-success">Available</span>}
                      </div>
                      <p className="text-gray-600 line-clamp-2">{service.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="text-lg font-bold text-primary">${service.price} {service.currency}</span>
                        {service.category && <span>Category: {service.category.name}</span>}
                        {service.location && <span>📍 {service.location}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (isCustomer || isProvider || isAdmin) && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12"><span className="loading loading-spinner loading-lg"></span></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-base-100 rounded-lg shadow">
              <p className="text-gray-500 text-lg">No orders yet</p>
              {isCustomer && (
                <Link to="/services" className="btn btn-primary mt-4">Browse Services</Link>
              )}
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="card bg-base-100 shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => nav(`/orders/${order.id}`)}
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="card-title text-lg">Order #{order.id}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      {order.service && (
                        <p className="text-gray-600 font-semibold">{order.service.title}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="text-lg font-bold text-primary">${order.total_price} {order.currency}</span>
                        {isCustomer && order.provider && (
                          <span>Provider: {order.provider.name}</span>
                        )}
                        {isProvider && order.customer && (
                          <span>Customer: {order.customer.name}</span>
                        )}
                        <span>Created: {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">Quick Actions</h3>
              <div className="space-y-2 mt-4">
                {isProvider && (
                  <Link to="/services/new" className="btn btn-primary btn-block">Create New Service</Link>
                )}
                {isCustomer && (
                  <Link to="/services" className="btn btn-primary btn-block">Browse Services</Link>
                )}
                <Link to="/services" className="btn btn-outline btn-block">View All Services</Link>
                {(isCustomer || isProvider) && (
                  <Link to="/orders" className="btn btn-outline btn-block">View All Orders</Link>
                )}
                {isAdmin && (
                  <>
                    <Link to="/admin/users" className="btn btn-outline btn-block">Manage Users</Link>
                    <Link to="/admin/categories" className="btn btn-outline btn-block">Manage Categories</Link>
                    <Link to="/admin/audit" className="btn btn-outline btn-block">View Audit Logs</Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">Recent Activity</h3>
              <div className="space-y-2 mt-4">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-2 bg-base-200 rounded">
                      <span className="text-sm">Order #{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
