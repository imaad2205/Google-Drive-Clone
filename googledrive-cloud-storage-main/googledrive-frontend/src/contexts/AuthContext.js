import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // API URL - uses environment variable, falls back for development
  const API_URL = process.env.REACT_APP_API_URL || '';
  
  // Debug: Log API URL (check browser console to verify)
  console.log('API URL:', API_URL || '(empty - using relative URLs)');

  // Create axios instance with interceptor to always use current token
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      timeout: 30000 // 30 second timeout (Render free tier can be slow to wake up)
    });

    // Add request interceptor to always include current token
    instance.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return instance;
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/api/auth/register', formData);
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      console.error('Register error details:', error);
      let message = 'Registration failed';
      if (error.response) message = error.response.data?.message || message;
      else if (error.request) message = 'Network error. Backend not reachable.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const activateAccount = async (token) => {
    try {
      const response = await api.get(`/api/auth/activate/${token}`);
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Activation failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const login = async (email, password) => {
    console.log('🚀 Attempting login with:', { email });
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log('✅ Login Response:', response.data);
      
      const { token: newToken, user: userData } = response.data;

      // Store token and update state
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      toast.success('Login successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Login Error Details:', error);
      
      let message = 'Login failed';
      if (error.response) {
        message = error.response.data?.message || 'Login failed';
        
        // If account not activated, offer to resend activation
        if (message.includes('not activated')) {
          return { 
            success: false, 
            message, 
            needsActivation: true,
            email 
          };
        }
      } else if (error.request) {
        message = 'Network error. Could not connect to backend.';
      }

      toast.error(message);
      return { success: false, message };
    }
  };

  const loginWithGoogle = async (credential, userInfo) => {
    try {
      const response = await api.post('/api/auth/google', { 
        credential,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        googleId: userInfo.sub
      });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      toast.success('Successfully logged in with Google');
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      const message = error.response?.data?.message || 'Google authentication failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await api.post(`/api/auth/reset-password/${token}`, { password });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const resendActivation = async (email) => {
    try {
      const response = await api.post('/api/auth/resend-activation', { email });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend activation email';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update user's storage used value
  const updateStorageUsed = (newStorageUsed) => {
    if (user) {
      setUser(prev => ({
        ...prev,
        storageUsed: newStorageUsed
      }));
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    activateAccount,
    logout,
    forgotPassword,
    resetPassword,
    resendActivation,
    fetchUser,
    loginWithGoogle,
    updateStorageUsed,
    api // Export api instance for authenticated requests
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
