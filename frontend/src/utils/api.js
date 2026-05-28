// frontend/src/utils/api.js
// Centralized Axios API configuration with request headers interceptors.

import axios from 'axios';

// Create a custom instance of Axios with our backend REST server's base URL
const api = axios.create({
  // Note: Standard local Node.js backend port is 5000
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically intercept every outgoing request
// to check if a JWT token is saved in localStorage, and append it as a Bearer authorization header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Forward error along if intercept fails
    return Promise.reject(error);
  }
);

export default api;
