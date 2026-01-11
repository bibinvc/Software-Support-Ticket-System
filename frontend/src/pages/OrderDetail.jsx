import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getById(id);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to load order:', err);
      alert('Order not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }

    try {
      const res = await ordersAPI.updateStatus(id, newStatus);
      setOrder(res.data);
      alert('Status updated successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSendingMessage(true);
      await ordersAPI.addMessage(id, message.trim());
      setMessage('');
      loadOrder(); // Reload to get new messages
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSubmitRating = async (from) => {
    if (rating < 1 || rating > 5) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmittingRating(true);
      await ordersAPI.addRating(id, rating, review, from);
      alert('Rating submitted successfully');
      loadOrder();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
      setRating(0);
      setReview('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="alert alert-error">
        <span>Order not found</span>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isCustomer = user.id === order.customer_id;
  const isProvider = user.id === order.provider_id;
  const isAdmin = user.role === 'admin';
  const canUpdateStatus = isProvider || isAdmin;
  const canCancel = (isCustomer || isProvider) && ['pending', 'confirmed'].includes(order.status);

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'in_progress': 'badge-primary',
      'completed': 'badge-success',
      'cancelled': 'badge-error'
    };
    return <span className={`badge badge-lg ${colors[status] || 'badge-ghost'}`}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="btn btn-ghost btn-sm">
        ← Back to Dashboard
      </Link>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Order #{order.id}</h1>
              <div className="mt-2">{getStatusBadge(order.status)}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ${order.total_price} {order.currency}
              </div>
              <div className="text-sm text-gray-500">Quantity: {order.quantity}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          {order.service && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Service Details</h2>
                <h3 className="text-xl font-semibold">{order.service.title}</h3>
                <p className="text-gray-600">{order.service.description}</p>
                {order.service.provider && (
                  <div className="mt-4">
                    <span className="font-semibold">Provider: </span>
                    <span>{order.service.provider.name}</span>
                    {order.service.provider.rating > 0 && (
                      <span className="ml-2">⭐ {order.service.provider.rating.toFixed(1)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Order Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Customer: </span>
                  <span>{order.customer?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold">Provider: </span>
                  <span>{order.provider?.name || 'N/A'}</span>
                </div>
                {order.special_instructions && (
                  <div>
                    <span className="font-semibold">Special Instructions: </span>
                    <p className="text-gray-600">{order.special_instructions}</p>
                  </div>
                )}
                {order.scheduled_date && (
                  <div>
                    <span className="font-semibold">Scheduled Date: </span>
                    <span>{new Date(order.scheduled_date).toLocaleString()}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Created: </span>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                {order.completed_at && (
                  <div>
                    <span className="font-semibold">Completed: </span>
                    <span>{new Date(order.completed_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h2 className="card-title">Messages</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {order.messages && order.messages.length > 0 ? (
                  order.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded ${
                        msg.is_system ? 'bg-base-200' : msg.user_id === user.id ? 'bg-primary/10' : 'bg-base-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {msg.is_system ? (
                            <span className="text-sm text-gray-500 italic">{msg.message}</span>
                          ) : (
                            <>
                              <div className="font-semibold">{msg.user?.name || 'Unknown'}</div>
                              <div className="text-gray-700">{msg.message}</div>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No messages yet</p>
                )}
              </div>

              {/* Send Message */}
              <form onSubmit={handleSendMessage} className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sendingMessage || !message.trim()}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Ratings */}
          {order.status === 'completed' && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">Ratings & Reviews</h2>
                {isCustomer && !order.customer_rating && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Rate Provider</h3>
                    <div className="rating rating-lg">
                      {[1, 2, 3, 4, 5].map(star => (
                        <input
                          key={star}
                          type="radio"
                          className="mask mask-star-2 bg-orange-400"
                          checked={rating === star}
                          onChange={() => setRating(star)}
                        />
                      ))}
                    </div>
                    <textarea
                      className="textarea textarea-bordered w-full"
                      placeholder="Write a review (optional)"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSubmitRating('customer')}
                      disabled={submittingRating || rating === 0}
                    >
                      Submit Rating
                    </button>
                  </div>
                )}
                {isProvider && !order.provider_rating && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Rate Customer</h3>
                    <div className="rating rating-lg">
                      {[1, 2, 3, 4, 5].map(star => (
                        <input
                          key={star}
                          type="radio"
                          className="mask mask-star-2 bg-orange-400"
                          checked={rating === star}
                          onChange={() => setRating(star)}
                        />
                      ))}
                    </div>
                    <textarea
                      className="textarea textarea-bordered w-full"
                      placeholder="Write a review (optional)"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSubmitRating('provider')}
                      disabled={submittingRating || rating === 0}
                    >
                      Submit Rating
                    </button>
                  </div>
                )}
                {order.customer_rating && (
                  <div className="mt-4">
                    <h4 className="font-semibold">Customer Rating: ⭐ {order.customer_rating}/5</h4>
                    {order.customer_review && <p className="text-gray-600">{order.customer_review}</p>}
                  </div>
                )}
                {order.provider_rating && (
                  <div className="mt-4">
                    <h4 className="font-semibold">Provider Rating: ⭐ {order.provider_rating}/5</h4>
                    {order.provider_review && <p className="text-gray-600">{order.provider_review}</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status Actions */}
          {canUpdateStatus && order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title">Update Status</h3>
                <div className="space-y-2">
                  {order.status === 'pending' && (
                    <button
                      className="btn btn-info btn-block"
                      onClick={() => handleStatusUpdate('confirmed')}
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      className="btn btn-primary btn-block"
                      onClick={() => handleStatusUpdate('in_progress')}
                    >
                      Start Work
                    </button>
                  )}
                  {order.status === 'in_progress' && (
                    <button
                      className="btn btn-success btn-block"
                      onClick={() => handleStatusUpdate('completed')}
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {canCancel && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title">Cancel Order</h3>
                <button
                  className="btn btn-error btn-block"
                  onClick={() => handleStatusUpdate('cancelled')}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

