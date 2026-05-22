import axios from 'axios';
import { toast } from "react-toastify";

const api = axios.create();

// Request interceptor
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('accessToken');
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
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      window.location.href = '/';
      try {
        // TODO: Add refresh token logic
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }

    const errorMsg = error.response?.data?.error || error.response?.data?.message;

    if (error.response?.status === 400) {
      toast.error(errorMsg || 'Status code: 400. Invalid request.');
    } else if (error.response?.status === 403 || error.response?.status === 401) {
      toast.error(errorMsg || 'Status code: 403. Access denied.');
    } else if (error.response?.status === 404) {
      toast.error(errorMsg || 'Status code: 404. Resource not found.');
    } else if (error.response?.status === 422) {
      toast.error(errorMsg || 'Status code: 422. Unprocessable entity.');
    } else if (error.response?.status === 429) {
      toast.error(errorMsg || 'Status code: 429. Too many requests.');
    } else if (error.response?.status === 500) {
      toast.error(errorMsg || 'Status code: 500. Internal server error.');
    }
    return Promise.reject(error);
  }
);

// API helper functions
export const apiClient = {
  // GET request
  get: (url, config = {}) => api.get(url, config),

  // POST request
  post: (url, data = {}, config = {}) => api.post(url, data, config),

  // PUT request
  put: (url, data = {}, config = {}) => api.put(url, data, config),

  // PATCH request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),

  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),

  // Upload file
  upload: (url, formData, config = {}) => {
    return api.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Download file
  download: (url, config = {}) => {
    return api.get(url, {
      ...config,
      responseType: 'blob',
    });
  },
};

export default api;