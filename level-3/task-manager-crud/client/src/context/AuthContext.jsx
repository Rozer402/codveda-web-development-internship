import React, { createContext, useState, useEffect } from 'react';
import { getMe as getMeApi, login as loginApi, register as registerApi, logout as logoutApi } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getMeApi(token);
          if (res.success) {
            setUser(res.user);
          }
        } catch (error) {
          console.error("Session invalid or expired", error);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await registerApi(userData);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
    }
    return res;
  };

  const logout = () => {
    logoutApi();
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) return <div>Loading Session...</div>;

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
