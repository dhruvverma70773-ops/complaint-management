// src/tests/Login.test.jsx
// React Testing Library tests for the Login page

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

// Mock react-toastify so toasts don't cause errors in tests
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock the API service — we don't want to make real HTTP calls in unit tests
vi.mock('../services/api', () => ({
  authAPI: {
    login: vi.fn(),
  },
}));

// Helper: render Login inside the providers it needs
const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

describe('Login Page', () => {
  it('renders the login form correctly', () => {
    renderLogin();

    // Check for key elements
    expect(screen.getByText(/Sign In to Your Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitted with empty fields', async () => {
    renderLogin();

    // Click submit without filling anything
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Validation errors should appear
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('renders a link to the register page', () => {
    renderLogin();

    const registerLink = screen.getByRole('link', { name: /Register here/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.getAttribute('href')).toBe('/register');
  });

  it('renders demo credentials section', () => {
    renderLogin();

    expect(screen.getByText(/Demo Credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@cms.com/i)).toBeInTheDocument();
  });
});
