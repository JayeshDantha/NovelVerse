// client/src/api/api.js - ROBUST FINAL VERSION

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Request interceptor to add the token (Unchanged)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- MODIFIED: Response interceptor is now smarter ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is a 401 and that this is NOT the initial auth check
    if (error.response && error.response.status === 401 && !error.config._isAuthCheck) {
      // This is where the automatic logout happens for any API call *except* the first one.
      localStorage.removeItem('token');
      window.location = '/login';
    }
    // For all other errors, or for the initial auth check, just pass the error along.
    return Promise.reject(error);
  }
);

export default api;