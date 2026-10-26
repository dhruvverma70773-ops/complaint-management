// src/tests/StatusBadge.test.jsx
// Tests for the StatusBadge component

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders "Pending" status with correct text', () => {
    render(<StatusBadge status="Pending" />);
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });

  it('renders "In Progress" status', () => {
    render(<StatusBadge status="In Progress" />);
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
  });

  it('renders "Resolved" status', () => {
    render(<StatusBadge status="Resolved" />);
    expect(screen.getByText(/Resolved/i)).toBeInTheDocument();
  });

  it('renders "Rejected" status', () => {
    render(<StatusBadge status="Rejected" />);
    expect(screen.getByText(/Rejected/i)).toBeInTheDocument();
  });

  it('applies correct CSS class for Pending status', () => {
    const { container } = render(<StatusBadge status="Pending" />);
    expect(container.firstChild).toHaveClass('badge-pending');
  });

  it('applies correct CSS class for Resolved status', () => {
    const { container } = render(<StatusBadge status="Resolved" />);
    expect(container.firstChild).toHaveClass('badge-resolved');
  });
});
