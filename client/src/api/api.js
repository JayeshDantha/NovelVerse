// client/src/api/api.js - FINAL ROBUST VERSION
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// This interceptor adds the token to every request.
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

// This interceptor handles 401 errors and logs the user out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // This is where the automatic logout happens
      // We can add a more robust logout logic here later
      localStorage.removeItem('token');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;