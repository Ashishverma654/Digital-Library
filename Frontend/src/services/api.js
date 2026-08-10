import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      const user = JSON.parse(localStorage.getItem('user'));

      if (user && user.refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: user.refreshToken
          });

          if (res.data.success) {
            user.token = res.data.data.token;
            user.refreshToken = res.data.data.refreshToken;
            localStorage.setItem('user', JSON.stringify(user));
            
            originalRequest.headers.Authorization = `Bearer ${user.token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // If it's 401 but we're on login or don't have refresh token, just reject
    if (error.response && error.response.status === 401 && originalRequest.url === '/auth/login') {
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default api;
