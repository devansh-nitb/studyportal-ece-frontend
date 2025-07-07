import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Get token from localStorage
  const [loading, setLoading] = useState(true); 

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const saveAuthData = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
  }, []);

  const clearAuthData = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (res.data.success) {
          setUser(res.data.data); 
          setToken(storedToken); 
        } else {
          clearAuthData(); 
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuthData(); 
      }
    }
    setLoading(false);
  }, [API_URL, clearAuthData]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        saveAuthData(res.data.user, res.data.token);
        return { success: true, message: 'Login successful!' };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      return { success: true, message: res.data.message, userId: res.data.userId };
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const res = await axios.post(`${API_URL}/auth/verify-email`, { email, otp });
      if (res.data.success) {
        saveAuthData(res.data.user, res.data.token);
        return { success: true, message: 'Email verified successfully!' };
      }
    } catch (error) {
      console.error('Email verification error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Email verification failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error('Forgot password error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Failed to send reset OTP' };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await axios.put(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
      if (res.data.success) {
        saveAuthData(res.data.user, res.data.token);
        return { success: true, message: 'Password reset successfully!' };
      }
    } catch (error) {
      console.error('Reset password error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Failed to reset password' };
    }
  };

  const logout = () => {
    clearAuthData();
  };

  const authContextValue = {
    user,
    token,
    loading,
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
    checkAuthStatus, 
    API_URL 
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
