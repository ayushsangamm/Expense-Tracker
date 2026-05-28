// frontend/src/context/AuthContext.jsx
// Core React context to store, distribute, and persist authentication state across pages.

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

// Create context object
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token and user exist in local storage on page loads to restore authentication
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Send request to /profile using our interceptor to confirm token validity
        const response = await api.get('/auth/profile');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          // Token is stale or invalid, clear state
          logout();
        }
      } catch (error) {
        console.error('Initial session restoration failed:', error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Register a new user account
   */
  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        // Save auth details locally
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in with traditional email/password credentials
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        // Store details in local storage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Authenticate through Google OAuth using credentials token
   */
  const googleLogin = async (credential) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/google', { credential });
      
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Google Auth verification failed';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear authorization states and log user out
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /**
   * Update active user profile details
   */
  const updateProfile = async (name, password, avatar) => {
    try {
      const response = await api.put('/auth/profile', { name, password, avatar });
      
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        // Update stored profile particulars
        if (token) localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile settings';
      return { success: false, error: msg };
    }
  };

  // Supply context parameters
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        googleLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Reusable custom hook to quickly ingest auth states in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be wrapped inside an AuthProvider component');
  }
  return context;
};
