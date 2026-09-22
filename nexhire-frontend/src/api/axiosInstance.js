import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexhire_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only auto-redirect on 401 if it's NOT the login endpoint
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('nexhire_token');
      window.location.href = '/login';
    }

    // Re-throw as plain object so callers can read .message and .status
    return Promise.reject({
      message: error.response?.data?.message || error.response?.data?.error?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default axiosInstance;
