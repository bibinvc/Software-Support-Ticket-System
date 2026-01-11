import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicesAPI, ordersAPI } from '../services/api';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    special_instructions: ''
  });
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const res = await servicesAPI.getById(id);
      setService(res.data);
    } catch (err) {
      console.error('Failed to load service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    try {
      setOrdering(true);
      const res = await ordersAPI.create({
        service_id: parseInt(id),
        quantity: parseInt(orderForm.quantity),
        special_instructions: orderForm.special_instructions
      });
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create order');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="alert alert-error">
        <span>Service not found</span>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canOrder = user.role === 'customer' && service.provider_id !== user.id;

  return (
    <div className="space-y-6">
      <Link to="/services" className="btn btn-ghost btn-sm">
        ← Back to Services
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h1 className="text-3xl font-bold">{service.title}</h1>
              {service.category && (
                <span className="badge badge-primary">{service.category.name}</span>
              )}
              <p className="text-gray-600 whitespace-pre-wrap">{service.description}</p>
              
              {service.location && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📍</span>
                  <span>{service.location}</span>
                </div>
              )}
              
              {service.duration_hours && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">⏱️</span>
                  <span>{service.duration_hours} hours</span>
                </div>
              )}
            </div>
          </div>

          {/* Provider Info */}
          {service.provider && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Provider</h2>
                <p className="font-semibold">{service.provider.name}</p>
                {service.provider.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    <span>{service.provider.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Form */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-lg sticky top-4">
            <div className="card-body">
              <div className="text-3xl font-bold text-primary mb-4">
                ${service.price} <span className="text-sm font-normal text-gray-500">{service.currency}</span>
              </div>

              {canOrder ? (
                <form onSubmit={handleOrder} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Quantity</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input input-bordered"
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Special Instructions</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      rows="3"
                      value={orderForm.special_instructions}
                      onChange={(e) => setOrderForm({ ...orderForm, special_instructions: e.target.value })}
                      placeholder="Any special requirements..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={ordering || !service.is_available || service.status !== 'active'}
                  >
                    {ordering ? 'Placing Order...' : 'Place Order'}
                  </button>
                </form>
              ) : (
                <div className="alert alert-info">
                  {user.role === 'provider' ? (
                    <span>This is your service. Switch to customer account to order.</span>
                  ) : (
                    <span>Please <Link to="/login" className="link">login</Link> as a customer to place an order.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

