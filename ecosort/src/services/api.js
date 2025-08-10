import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecosort_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('ecosort_token');
        localStorage.removeItem('ecosort_user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      } else if (status === 403) {
        toast.error('Access denied');
      } else if (status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        // Show specific error message from server
        toast.error(data?.error || 'Something went wrong');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('Something went wrong');
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  verifyToken: async (token) => {
    const response = await api.post('/auth/verify-token', { token });
    return response.data;
  },
};

// User API calls
export const userAPI = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
  
  getMyWasteLogs: async (params = {}) => {
    const response = await api.get('/users/me/waste-logs', { params });
    return response.data;
  },
  
  getMyStats: async () => {
    const response = await api.get('/users/me/stats');
    return response.data;
  },
  
  getLeaderboard: async (limit = 10) => {
    const response = await api.get('/users/leaderboard', { params: { limit } });
    return response.data;
  },
};

// Waste Items API calls
export const wasteItemAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/waste-items', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/waste-items/${id}`);
    return response.data;
  },
  
  search: async (query, limit = 20) => {
    const response = await api.get(`/waste-items/search/${query}`, { params: { limit } });
    return response.data;
  },
  
  getCategoryStats: async () => {
    const response = await api.get('/waste-items/stats/categories');
    return response.data;
  },
};

// Bins API calls
export const binAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/bins', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/bins/${id}`);
    return response.data;
  },
  
  getByType: async (type) => {
    const response = await api.get(`/bins/type/${type}`);
    return response.data;
  },
  
  getNearby: async (lat, lng, radius = 5) => {
    const response = await api.get(`/bins/nearby/${lat}/${lng}`, { params: { radius } });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/bins/stats/overview');
    return response.data;
  },
};

// Waste Logs API calls
export const wasteLogAPI = {
  create: async (logData) => {
    const response = await api.post('/waste-logs', logData);
    return response.data;
  },
  
  getAll: async (params = {}) => {
    const response = await api.get('/waste-logs', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/waste-logs/${id}`);
    return response.data;
  },
  
  getStats: async (days = 30) => {
    const response = await api.get('/waste-logs/stats/overview', { params: { days } });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/waste-logs/${id}`);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/health`,
      { timeout: 5000 }
    );
    return response.data;
  },
};

export default api;
