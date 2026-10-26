// src/services/api.js
// Centralized Axios instance for all API calls
// All components import from here — never create raw Axios calls in components

import axios from 'axios';

// Base URL: in development, Vite proxies /api to localhost:5000
// In production, set VITE_API_URL in the Vercel environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a reusable Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ────────────────────────────────────────────────────────
// Automatically attach the JWT token to every request that goes out
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// If a 401 is returned, the token has expired — log the user out automatically
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

// ── Auth API calls ─────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

// ── Complaint API calls ────────────────────────────────────────────────────────
export const complaintAPI = {
  create:       (data)         => api.post('/complaints', data),
  getMy:        (params)       => api.get('/complaints/my', { params }),
  getById:      (id)           => api.get(`/complaints/${id}`),
  getAll:       (params)       => api.get('/complaints', { params }),
  updateStatus: (id, data)     => api.put(`/complaints/${id}/status`, data),
  delete:       (id)           => api.delete(`/complaints/${id}`),
};

// ── Admin API calls ────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
};

export default api;
