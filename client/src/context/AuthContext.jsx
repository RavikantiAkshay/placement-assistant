import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/auth.service.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await authService.getMe();
          if (data.success) {
            setUser(data.user);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (credentials) => {
    const data = await authService.register(credentials);
    if (data.success) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateGoals = async (goals) => {
    const data = await authService.updateGoals(goals);
    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateGoals }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
