// src/pages/Login.jsx
// Login page for citizens and admins

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  // Form state
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  // Update form field on change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  // Client-side validation before submitting
  const validate = () => {
    const errs = {};
    if (!formData.email)    errs.email    = 'Email is required';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      const res = await authAPI.login(formData);
      const { token, user } = res.data;

      // Store in context + localStorage
      login(token, user);
      toast.success(`Welcome back, ${user.name}! 🎉`);

      // Redirect based on role
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card fade-in-up">
          {/* Logo */}
          <div className="auth-logo">
            <div className="logo-icon">🏛️</div>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--primary)' }}>
              CMS Portal
            </h2>
            <p className="text-muted small">Municipal Complaint Management System</p>
          </div>

          <h5 className="mb-4 fw-semibold text-center">Sign In to Your Account</h5>

          <form onSubmit={handleSubmit} className="cms-form" noValidate>
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-cms w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-3 p-3 rounded" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <p className="mb-1 small fw-semibold text-info">🔑 Demo Credentials:</p>
            <p className="mb-0 small text-muted">Admin: admin@cms.com / admin123</p>
            <p className="mb-0 small text-muted">Citizen: dhruv@citizen.com / citizen123</p>
          </div>

          <p className="text-center mt-3 mb-0 small text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-decoration-none fw-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
