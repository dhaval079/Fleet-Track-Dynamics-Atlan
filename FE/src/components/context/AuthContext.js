import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiCall } from '../../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiCall('/api/v2/auth/me');
        if (response.success) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        localStorage.removeItem('user');
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiCall('/api/v2/auth/login', 'POST', credentials);
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiCall('/api/v2/auth/logout', 'POST');
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);