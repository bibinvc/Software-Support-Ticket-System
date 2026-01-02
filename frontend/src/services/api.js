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
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password })
};

// Tickets
export const ticketsAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.patch(`/tickets/${id}`, data),
  assign: (id, agentId, note) => api.post(`/tickets/${id}/assign`, { agent_id: agentId, note })
};

// Comments
export const commentsAPI = {
  create: (ticketId, message, isInternal = false) => 
    api.post(`/tickets/${ticketId}/comments`, { message, is_internal: isInternal })
};

// Attachments
export const attachmentsAPI = {
  upload: (ticketId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticket_id', ticketId);
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
  getAgents: () => api.get('/users/agents/list')
};

// Categories
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Priorities
export const prioritiesAPI = {
  getAll: () => api.get('/priorities'),
  getById: (id) => api.get(`/priorities/${id}`),
  create: (data) => api.post('/priorities', data),
  update: (id, data) => api.patch(`/priorities/${id}`, data),
  delete: (id) => api.delete(`/priorities/${id}`)
};

// Statistics
export const statisticsAPI = {
  getDashboard: () => api.get('/statistics/dashboard'),
  getTrends: (days = 30) => api.get('/statistics/trends', { params: { days } })
};

// Audit Logs
export const auditAPI = {
  getAll: (params) => api.get('/audit', { params }),
  getByTicket: (ticketId) => api.get(`/audit/ticket/${ticketId}`)
};

export default api;

