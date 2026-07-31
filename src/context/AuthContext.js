import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Get token from localStorage
  const [loading, setLoading] = useState(true);
  const [premiumEnabled, setPremiumEnabled] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const saveAuthData = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    // Kept so an offline reload can restore "who is logged in" without a
    // network call — see checkAuthStatus below.
    localStorage.setItem('cachedUser', JSON.stringify(userData));
  }, []);

  // SECURITY: Cache Storage (used by public/sw.js for offline materials) is
  // shared by origin, not by logged-in user. If two different people use
  // the same browser one after another (a shared lab/library computer),
  // a stale cache could otherwise leak the first person's materials list
  // or even their personally watermarked PDFs to the second. Flushing the
  // service worker's user-data caches on every logout/session-expiry
  // closes that gap.
  const clearOfflineCaches = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_USER_DATA_CACHE' });
    }
  }, []);

  const clearAuthData = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('cachedUser');
    clearOfflineCaches();
  }, [clearOfflineCaches]);

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
          localStorage.setItem('cachedUser', JSON.stringify(res.data.data));
          // Fetch premium status
          try {
            const premRes = await axios.get(`${API_URL}/settings/premium-enabled`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (premRes.data.success) {
              setPremiumEnabled(premRes.data.data.premiumEnabled);
            }
          } catch (_) {}
        } else {
          // The server explicitly responded but said the session isn't
          // valid — this is a real logout, not a connectivity problem.
          clearAuthData(); 
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // FIX: A request can fail for two very different reasons — (a) the
        // server actively rejected the token (expired/invalid session:
        // error.response will be a 401/403), which really should log the
        // user out, or (b) there was no network at all to even reach the
        // server (error.response is undefined), which should NOT log the
        // user out — otherwise reloading the app while offline (the whole
        // point of the offline-materials feature) would wipe the session
        // and the offline cache along with it on every reload.
        if (error.response) {
          clearAuthData();
        } else {
          const cachedUserRaw = localStorage.getItem('cachedUser');
          if (cachedUserRaw) {
            try {
              setUser(JSON.parse(cachedUserRaw));
              setToken(storedToken);
            } catch {
              // Corrupt cached value — fall back to a real logout.
              clearAuthData();
            }
          }
          // No cached user to fall back on: leave user/token as-is rather
          // than forcing a logout purely because of a connectivity blip.
        }
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
    premiumEnabled,
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
