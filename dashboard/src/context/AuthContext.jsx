import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        // Decode JWT to get user data
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Check if token is expired
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('accessToken');
          setUser(null);
        } else {
          // Set user from token payload
          setUser({
            id: payload.id,
            email: payload.email,
            role: payload.role,
            units: payload.units,
          });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await getApi().post('/api/auth/login', { email, password });
      const { accessToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
};
