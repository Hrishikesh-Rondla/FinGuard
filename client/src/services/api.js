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
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};

// ==================== TRANSACTIONS ====================
export const transactions = {
  getTransactions: async (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters };
    const { data } = await api.get('/transactions', { params });
    return data;
  },
  addTransaction: async (transactionData) => {
    const { data } = await api.post('/transactions', transactionData);
    return data;
  },
  updateTransaction: async (id, transactionData) => {
    const { data } = await api.put(`/transactions/${id}`, transactionData);
    return data;
  },
  deleteTransaction: async (id) => {
    const { data } = await api.delete(`/transactions/${id}`);
    return data;
  },
  getTransactionSummary: async () => {
    const { data } = await api.get('/transactions/summary');
    return data;
  },
};

// ==================== PREDICTIONS ====================
export const predictions = {
  runPrediction: async () => {
    const { data } = await api.post('/predictions/run');
    return data;
  },
  getPredictionHistory: async () => {
    const { data } = await api.get('/predictions/history');
    return data;
  },
  getLatestPrediction: async () => {
    const { data } = await api.get('/predictions/latest');
    return data;
  },
};

// ==================== ALERTS ====================
export const alerts = {
  getAlerts: async () => {
    const { data } = await api.get('/alerts');
    return data;
  },
  markAlertRead: async (id) => {
    const { data } = await api.put(`/alerts/${id}/read`);
    return data;
  },
  markAllRead: async () => {
    const { data } = await api.put('/alerts/read-all');
    return data;
  },
  dismissAlert: async (id) => {
    const { data } = await api.delete(`/alerts/${id}`);
    return data;
  },
};

export default api;
