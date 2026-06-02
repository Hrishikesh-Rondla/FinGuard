import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap server envelope and handle 401
api.interceptors.response.use(
  (response) => {
    // Server returns { success, data: { ... }, message, error }
    // Unwrap the envelope so consumers get the inner data directly
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      return body.data !== undefined ? body.data : body;
    }
    return body;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('finguard_token');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        'An unexpected error occurred';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('Network error. Please check your connection.'));
  }
);

// ==================== AUTH ====================
export const auth = {
  login: async (email, password) => {
    return await api.post('/auth/login', { email, password });
  },
  register: async (name, email, password) => {
    return await api.post('/auth/register', { name, email, password });
  },
  getMe: async () => {
    return await api.get('/auth/me');
  },
  logout: async () => {
    return await api.post('/auth/logout');
  },
};

// ==================== TRANSACTIONS ====================
export const transactions = {
  getTransactions: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    return await api.get('/transactions', { params });
  },
  addTransaction: async (transactionData) => {
    return await api.post('/transactions', transactionData);
  },
  updateTransaction: async (id, transactionData) => {
    return await api.put(`/transactions/${id}`, transactionData);
  },
  deleteTransaction: async (id) => {
    return await api.delete(`/transactions/${id}`);
  },
  getTransactionSummary: async () => {
    return await api.get('/transactions/summary');
  },
  uploadTransactions: async (formData) => {
    return await api.post('/transactions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// ==================== PREDICTIONS ====================
export const predictions = {
  runPrediction: async () => {
    return await api.post('/predictions/run');
  },
  getPredictionHistory: async () => {
    return await api.get('/predictions/history');
  },
  getLatestPrediction: async () => {
    return await api.get('/predictions/latest');
  },
};
// ==================== ADMIN ====================
export const admin = {
  getUsersAndStats: async () => {
    return await api.get('/admin/users');
  },
  toggleUserStatus: async (id) => {
    return await api.put(`/admin/users/${id}/suspend`);
  },
  deleteUser: async (id) => {
    return await api.delete(`/admin/users/${id}`);
  },
};

export default api;
