import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scentra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = String(err.config?.url || '');
    const isLogin = url.includes('/auth/login');
    const isMe = url.includes('/auth/me');

    // Only clear session on real auth failures for protected calls.
    // /auth/me is handled by AuthContext (avoid racing password-change requests).
    if (status === 401 && !isLogin && !isMe) {
      localStorage.removeItem('scentra_token');
      localStorage.removeItem('scentra_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export function money(amount) {
  return `PKR ${Number(amount || 0).toFixed(2)}`;
}
