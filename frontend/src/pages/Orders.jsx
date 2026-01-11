import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });
  const nav = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getAll(filters);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'in_progress': 'badge-primary',
      'completed': 'badge-success',
      'cancelled': 'badge-error'
    };
    return <span className={`badge ${colors[status] || 'badge-ghost'}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex gap-4">
            <select
              className="select select-bordered"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {filters.status && (
              <button
                className="btn btn-ghost"
                onClick={() => setFilters({ ...filters, status: '', page: 1 })}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : orders.length === 0 ? (
        <div className="alert alert-info">
          <span>No orders found. {user.role === 'customer' && 'Browse services to place an order!'}</span>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
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
                      <span className="text-lg font-bold text-primary">
                        ${order.total_price} {order.currency}
                      </span>
                      {user.role === 'customer' && order.provider && (
                        <span>Provider: {order.provider.name}</span>
                      )}
                      {user.role === 'provider' && order.customer && (
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
          ))}
        </div>
      )}
    </div>
  );
}

