// src/App.jsx
// Root component — defines all application routes using React Router v6

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import AppNavbar      from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages — Public
import Login    from './pages/Login';
import Register from './pages/Register';

// Pages — Citizen
import CitizenDashboard from './pages/CitizenDashboard';
import MyComplaints     from './pages/MyComplaints';
import FileComplaint    from './pages/FileComplaint';
import ComplaintDetail  from './pages/ComplaintDetail';

// Pages — Admin
import AdminDashboard  from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminUsers      from './pages/AdminUsers';

/**
 * App — sets up the entire routing tree.
 *
 * Route structure:
 *  /                     → redirect to /login
 *  /login                → public
 *  /register             → public
 *  /dashboard            → citizen only
 *  /complaints           → citizen only
 *  /complaints/new       → citizen only
 *  /complaints/:id       → citizen (own) or admin
 *  /admin/dashboard      → admin only
 *  /admin/complaints     → admin only
 *  /admin/users          → admin only
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global Toast Notification Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />

        {/* Navbar is shown on all pages (it hides links when not logged in) */}
        <AppNavbar />

        <Routes>
          {/* ── Public Routes ───────────────────────────────────────────── */}
          <Route path="/"         element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Citizen Routes ──────────────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <MyComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/new"
            element={
              <ProtectedRoute>
                <FileComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetail />
              </ProtectedRoute>
            }
          />

          {/* ── Admin Routes ─────────────────────────────────────────────── */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute adminOnly>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* ── 404 Fallback ─────────────────────────────────────────────── */}
          <Route
            path="*"
            element={
              <div className="full-page-loader text-center">
                <h1 style={{ fontSize: '5rem' }}>404</h1>
                <h4 className="text-muted">Page not found</h4>
                <a href="/login" className="btn btn-cms mt-3">Go Home</a>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
