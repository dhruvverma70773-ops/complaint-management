// src/pages/Register.jsx
// Registration page for new citizens

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  // Client-side validation
  const validate = () => {
    const errs = {};
    if (!formData.name.trim())                       errs.name    = 'Full name is required';
    if (!formData.email)                             errs.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))  errs.email   = 'Enter a valid email';
    if (!formData.phone)                             errs.phone   = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(formData.phone))   errs.phone   = 'Phone must be 10-15 digits';
    if (!formData.password)                          errs.password = 'Password is required';
    else if (formData.password.length < 6)           errs.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const res = await authAPI.register(payload);
      const { token, user } = res.data;

      login(token, user);
      toast.success('Registration successful! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, type = 'text', placeholder, name }) => (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-medium">{label}</label>
      <input
        id={id}
        type={type}
        name={name || id}
        className={`form-control ${errors[name || id] ? 'is-invalid' : ''}`}
        placeholder={placeholder}
        value={formData[name || id]}
        onChange={handleChange}
      />
      {errors[name || id] && (
        <div className="invalid-feedback">{errors[name || id]}</div>
      )}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card fade-in-up" style={{ maxWidth: '520px' }}>
          <div className="auth-logo">
            <div className="logo-icon">🏛️</div>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--primary)' }}>
              Create Account
            </h2>
            <p className="text-muted small">Register to file and track complaints</p>
          </div>

          <form onSubmit={handleSubmit} className="cms-form" noValidate>
            <Field id="name"    label="Full Name"    placeholder="Dhruv Verma" />
            <Field id="email"   label="Email Address" type="email" placeholder="dhruv@example.com" />
            <Field id="phone"   label="Phone Number"  placeholder="9876543210" />
            <Field id="password" label="Password" type="password" placeholder="Min. 6 characters" />
            <Field
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
            />

            <button
              type="submit"
              className="btn btn-cms w-100 py-2 mt-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating Account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center mt-3 mb-0 small text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none fw-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
