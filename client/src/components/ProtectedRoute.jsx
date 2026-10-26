// src/components/ProtectedRoute.jsx
// A wrapper component that redirects unauthenticated users to /login
// Also handles role-based access (adminOnly prop)

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * Props:
 *   children  — the page to render if authorized
 *   adminOnly — if true, only admin users can access this route
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show a loading spinner while we check localStorage for a token
  if (loading) return <Spinner />;

  // Not logged in → redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Admin-only page but user is a citizen → redirect to citizen dashboard
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  // All checks passed → render the protected page
  return children;
};

export default ProtectedRoute;
