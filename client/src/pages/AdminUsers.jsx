// src/pages/AdminUsers.jsx
// Admin view of all registered citizen users

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { adminAPI } from '../services/api';
import Spinner from '../components/Spinner';

const AdminUsers = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminAPI.getUsers();
        setUsers(res.data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <Spinner />;

  // Generate initials for avatar
  const getInitials = (name) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  // Cycle through colors for avatars
  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <>
      <div className="page-header">
        <Container>
          <h2 className="fw-bold mb-1">👥 Registered Citizens</h2>
          <p className="mb-0 opacity-75">
            {users.length} citizen(s) registered in the system
          </p>
        </Container>
      </div>

      <Container className="pb-5 fade-in-up">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h5>No citizens registered yet</h5>
          </div>
        ) : (
          <Row className="g-3">
            {users.map((user, i) => (
              <Col key={user._id} xs={12} sm={6} lg={4}>
                <Card className="cms-card p-3">
                  <div className="d-flex align-items-center gap-3">
                    {/* Avatar with initials */}
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                      style={{
                        width:    '48px',
                        height:   '48px',
                        flexShrink: 0,
                        background: COLORS[i % COLORS.length],
                        fontSize:  '1.1rem',
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div className="fw-semibold">{user.name}</div>
                      <div className="text-muted small">{user.email}</div>
                      <div className="text-muted small">📞 {user.phone}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                    <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle small">
                      ✅ Citizen
                    </span>
                    <span className="text-muted small">
                      Joined{' '}
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default AdminUsers;
