import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000', // Base URL of your API
});

// Add a request interceptor to include the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // Get the token from localStorage

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Set the Authorization header
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
