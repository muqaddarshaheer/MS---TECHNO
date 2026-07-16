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
    let cancelled = false;
    api
      .get('/auth/me')
      .then((res) => {
        if (cancelled) return;
        setUser(res.data.user);
        localStorage.setItem('scentra_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem('scentra_token');
        localStorage.removeItem('scentra_user');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
    const { data } = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    if (data.token) {
      localStorage.setItem('scentra_token', data.token);
      setToken(data.token);
    }
    if (data.user) {
      localStorage.setItem('scentra_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
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
