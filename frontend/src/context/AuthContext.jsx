import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('adaptive_exam_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adaptive_exam_token');
      if (token) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
          localStorage.setItem('adaptive_exam_user', JSON.stringify(profile));
        } catch {
          setUser(null);
          localStorage.removeItem('adaptive_exam_token');
          localStorage.removeItem('adaptive_exam_user');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    const handleAuthChange = () => {
      setUser(null);
    };
    window.addEventListener('auth_change', handleAuthChange);
    return () => window.removeEventListener('auth_change', handleAuthChange);
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    localStorage.setItem('adaptive_exam_token', res.access_token);
    localStorage.setItem('adaptive_exam_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    localStorage.setItem('adaptive_exam_token', res.access_token);
    localStorage.setItem('adaptive_exam_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('adaptive_exam_token');
    localStorage.removeItem('adaptive_exam_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
