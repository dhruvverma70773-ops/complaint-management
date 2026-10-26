// src/context/AuthContext.jsx
// Global authentication state management using React Context API
// This avoids prop drilling — any component can access auth state via useAuth()

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create the context object
const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app and provides authentication state.
 * It reads the initial user/token from localStorage so the session
 * persists across browser refreshes.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true until we know if user is logged in

  useEffect(() => {
    // On app load, check if a token exists in localStorage
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false); // done checking
  }, []);

  /**
   * login — stores token + user in state and localStorage
   */
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  /**
   * logout — clears everything and redirects to login
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Expose state and functions to all child components
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — custom hook for consuming the AuthContext.
 * Usage:  const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
