// src/pages/CitizenDashboard.jsx
// Dashboard for citizens — shows stats cards and recent complaints

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const CitizenDashboard = () => {
  const { user }                    = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await complaintAPI.getMy();
        setComplaints(res.data.complaints);
      } catch (err) {
        console.error('Failed to fetch complaints', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return <Spinner />;

  // Compute stats from complaints array
  const stats = {
    total:      complaints.length,
    pending:    complaints.filter((c) => c.status === 'Pending').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved:   complaints.filter((c) => c.status === 'Resolved').length,
  };

  const recentComplaints = complaints.slice(0, 5); // show last 5

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <Container>
          <h2 className="fw-bold mb-1">👋 Welcome, {user?.name}!</h2>
          <p className="mb-0 opacity-75">
            Track and manage your complaints here
          </p>
        </Container>
      </div>

      <Container className="pb-5 fade-in-up">
        {/* Stat Cards */}
        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <div className="stat-card stat-card-total">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Complaints</div>
              <div className="stat-icon">📋</div>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <div className="stat-card stat-card-pending">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
              <div className="stat-icon">⏳</div>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <div className="stat-card stat-card-progress">
              <div className="stat-number">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
              <div className="stat-icon">🔧</div>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={3}>
            <div className="stat-card stat-card-resolved">
              <div className="stat-number">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
              <div className="stat-icon">✅</div>
            </div>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6}>
            <Link to="/complaints/new" className="text-decoration-none">
              <Card
                className="cms-card h-100 text-center p-4"
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: '2.5rem' }}>➕</div>
                <Card.Title className="mt-2 fw-semibold">File New Complaint</Card.Title>
                <Card.Text className="text-muted small">
                  Submit a new municipal complaint
                </Card.Text>
              </Card>
            </Link>
          </Col>
          <Col xs={12} sm={6}>
            <Link to="/complaints" className="text-decoration-none">
              <Card
                className="cms-card h-100 text-center p-4"
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: '2.5rem' }}>🔍</div>
                <Card.Title className="mt-2 fw-semibold">View All Complaints</Card.Title>
                <Card.Text className="text-muted small">
                  Search, filter and track your complaints
                </Card.Text>
              </Card>
            </Link>
          </Col>
        </Row>

        {/* Recent Complaints */}
        <Card className="cms-card">
          <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
            <h6 className="mb-0 fw-bold">📋 Recent Complaints</h6>
            <Link to="/complaints" className="btn btn-sm btn-outline-primary">
              View All
            </Link>
          </Card.Header>
          <Card.Body className="p-0">
            {recentComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h5>No complaints yet</h5>
                <p className="mb-3">Be the first to file a complaint</p>
                <Link to="/complaints/new" className="btn btn-cms">
                  File Your First Complaint
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table cms-table mb-0">
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <span className="complaint-id">{c.complaintId}</span>
                        </td>
                        <td className="fw-medium" style={{ maxWidth: '200px' }}>
                          {c.title}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {c.category}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="text-muted small">
                          {new Date(c.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td>
                          <Link
                            to={`/complaints/${c._id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default CitizenDashboard;
