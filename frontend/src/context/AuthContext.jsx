import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('scentra_user') || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('scentra_token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('scentra_token'));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('scentra_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('scentra_token');
        localStorage.removeItem('scentra_user');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('scentra_token', data.token);
    localStorage.setItem('scentra_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('scentra_token');
    localStorage.removeItem('scentra_user');
    setToken(null);
    setUser(null);
  }

  async function changePassword(currentPassword, newPassword) {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    changePassword,
    isSuper: user?.role === 'super',
    isShop: user?.role === 'shop',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
