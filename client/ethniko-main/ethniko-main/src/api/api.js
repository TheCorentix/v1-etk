import axios from 'axios';

// 1. Create a single, reusable Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for transferring HTTP-only secure cookie sessions
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Attach bearer authorization fallback header if ID token is in storage
api.interceptors.request.use(
  (config) => {
    const idToken = localStorage.getItem('etniko_firebase_id_token');
    if (idToken) {
      config.headers.Authorization = `Bearer ${idToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Catch global API errors
api.interceptors.response.use(
  (response) => {
    // Return standard success response data envelope
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    // Handle session expirations or unauthorized states
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Auto-purge client session credentials upon token decay
      localStorage.removeItem('etniko_firebase_id_token');
      
      // Dispatch custom logout event to notify AuthContext
      window.dispatchEvent(new Event('auth_session_expired'));
    }

    // Standardize error formats thrown to service callers
    const errorDetails = {
      status,
      message: error.response?.data?.message || 'A network error occurred. Please try again.',
      errors: error.response?.data?.errors || [],
      originalError: error,
    };

    return Promise.reject(errorDetails);
  }
);

export default api;
