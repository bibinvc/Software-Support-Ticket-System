import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password, mfaToken) => api.post('/auth/login', { email, password, mfaToken }),
  register: (name, email, password, role = 'customer') => api.post('/auth/register', { name, email, password, role }),
  logout: () => api.post('/auth/logout'),
  setupMFA: () => api.post('/auth/mfa/setup'),
  enableMFA: (token) => api.post('/auth/mfa/enable', { token }),
  disableMFA: (password, mfaToken) => api.post('/auth/mfa/disable', { password, mfaToken })
};

// Services
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.patch(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  getMyServices: (params) => api.get('/services/provider/my-services', { params })
};

// Orders
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status, cancellationReason) => api.patch(`/orders/${id}/status`, { status, cancellation_reason: cancellationReason }),
  addMessage: (id, message) => api.post(`/orders/${id}/messages`, { message }),
  addRating: (id, rating, review, from) => api.post(`/orders/${id}/rating`, { rating, review, from })
};

// Attachments
export const attachmentsAPI = {
  upload: (file, serviceId = null, orderId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (serviceId) formData.append('service_id', serviceId);
    if (orderId) formData.append('order_id', orderId);
    return api.post('/attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  download: (id) => api.get(`/attachments/${id}/download`, { responseType: 'blob' })
};

// Users
export const usersAPI = {
  getAll: () => api.get('/users'),
  getMe: () => api.get('/users/me'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  updatePassword: (id, password, oldPassword) => 
    api.patch(`/users/${id}/password`, { password, old_password: oldPassword }),
  getProviders: () => api.get('/users/providers/list')
};

// Categories
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};


// Statistics
export const statisticsAPI = {
  getDashboard: () => api.get('/statistics/dashboard'),
  getTrends: (days = 30) => api.get('/statistics/trends', { params: { days } })
};

// Audit Logs
export const auditAPI = {
  getAll: (params) => api.get('/audit', { params })
};

export default api;

