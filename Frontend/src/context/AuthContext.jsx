import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
