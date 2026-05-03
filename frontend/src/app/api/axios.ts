import axios, { AxiosInstance } from 'axios';

const baseURL: string = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:8000/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 15000, // 15s — allow for cold-start on DigitalOcean
});

// Attach access token to every request automatically
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses by refreshing the token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Guard: if there's no response (network error), reject immediately
    if (!error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Only attempt refresh once to prevent infinite loops
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const res = await axios.post(`${baseURL}/token/refresh/`, {
              refresh: refreshToken,
            });

            const { access, refresh } = res.data;
            localStorage.setItem('access_token', access);
            if (refresh) {
              localStorage.setItem('refresh_token', refresh);
            }

            originalRequest.headers['Authorization'] = `Bearer ${access}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed — clear tokens, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;