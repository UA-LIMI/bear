/**
 * Centralized API Client
 * 
 * This module provides a pre-configured axios instance for making requests
 * to the Limi AI backend. It handles API key authentication and base URL
 * configuration automatically.
 */

import axios from 'axios';

// Get backend configuration from environment variables
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const aiGatewayApiKey = process.env.NEXT_PUBLIC_AI_GATEWAY_API_KEY;

// Create a new axios instance
const apiClient = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use an interceptor to dynamically add the Authorization header
apiClient.interceptors.request.use(
  (config) => {
    if (aiGatewayApiKey) {
      config.headers.Authorization = `Bearer ${aiGatewayApiKey}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for logging errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
