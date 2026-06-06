import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await authApi.getProfile();
          if (res.success) {
            setUser(res.user);
          }
        } catch (error) {
          console.error("Auth init failed", error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success) {
        localStorage.setItem('access_token', res.tokens.access);
        localStorage.setItem('refresh_token', res.tokens.refresh);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.errors || 'Login failed' };
    } catch (error) {
      const msg = error.data?.errors?.non_field_errors?.[0] || 'Invalid credentials';
      return { success: false, error: msg };
    }
  };

  const register = async (data) => {
    try {
      const res = await authApi.register(data);
      if (res.success) {
        localStorage.setItem('access_token', res.tokens.access);
        localStorage.setItem('refresh_token', res.tokens.refresh);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.errors };
    } catch (error) {
      return { success: false, error: error.data?.errors || 'Registration failed' };
    }
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/login';
  };

  const updateProfileContext = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role?.name === 'Admin',
    isStudent: user?.role?.name === 'Student',
    loading,
    login,
    register,
    logout,
    updateProfileContext
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
