// src/components/Navbar.jsx
// Responsive navigation bar with role-based links

import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to add 'active' class to current route link
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <Navbar className="cms-navbar" expand="lg" variant="dark" sticky="top">
      <Container>
        {/* Brand / Logo */}
        <Navbar.Brand as={Link} to={isAdmin ? '/admin/dashboard' : '/dashboard'}>
          <span>🏛️</span> CMS Portal
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {user && !isAdmin && (
              <>
                <Nav.Link
                  as={Link}
                  to="/dashboard"
                  className={isActive('/dashboard')}
                >
                  📊 Dashboard
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/complaints"
                  className={isActive('/complaints')}
                >
                  📋 My Complaints
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/complaints/new"
                  className={isActive('/complaints/new')}
                >
                  ➕ File Complaint
                </Nav.Link>
              </>
            )}

            {user && isAdmin && (
              <>
                <Nav.Link
                  as={Link}
                  to="/admin/dashboard"
                  className={isActive('/admin/dashboard')}
                >
                  📊 Dashboard
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/admin/complaints"
                  className={isActive('/admin/complaints')}
                >
                  📋 All Complaints
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/admin/users"
                  className={isActive('/admin/users')}
                >
                  👥 Users
                </Nav.Link>
              </>
            )}
          </Nav>

          {/* Right-side: user info + logout */}
          <Nav className="align-items-center gap-2">
            {user && (
              <>
                <span
                  className="text-white-50 small"
                  style={{ fontSize: '0.85rem' }}
                >
                  👤 {user.name}
                  {isAdmin && (
                    <span className="badge bg-warning text-dark ms-1 small">
                      Admin
                    </span>
                  )}
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  style={{ borderRadius: '20px' }}
                >
                  Logout
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
