import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
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
  const refreshTimeoutRef = useRef(null);

  const scheduleTokenRefresh = useCallback(
    token => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const refreshAt = expiresAt - 60000; // Refresh 1 minute before expiry

        if (refreshAt > now) {
          refreshTimeoutRef.current = setTimeout(() => {
            refreshToken();
          }, refreshAt - now);
        }
      } catch (error) {
        console.error('Failed to schedule token refresh:', error);
      }
    },
    [refreshToken]
  );

  const refreshToken = useCallback(async () => {
    try {
      const response = await getApi().post('/api/auth/refresh');
      const { accessToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      scheduleTokenRefresh(accessToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }, [scheduleTokenRefresh, logout]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000;

        if (expiresAt > Date.now()) {
          setUser({ id: payload.userId, email: payload.email, role: payload.role });
          scheduleTokenRefresh(token);
        } else {
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    }
    setLoading(false);

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  const login = async (email, password) => {
    try {
      const response = await getApi().post('/api/auth/login', { email, password });
      const { accessToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      scheduleTokenRefresh(accessToken);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Login failed',
      };
    }
  };

  const logout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
