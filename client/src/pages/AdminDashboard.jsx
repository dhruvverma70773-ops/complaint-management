// src/pages/AdminDashboard.jsx
// Admin dashboard with stats cards and charts (Recharts)

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { adminAPI } from '../services/api';
import Spinner from '../components/Spinner';

// Colors for pie chart slices
const STATUS_COLORS = {
  'Pending':     '#f59e0b',
  'In Progress': '#3b82f6',
  'Resolved':    '#10b981',
  'Rejected':    '#ef4444',
};

const AdminDashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner />;
  if (!stats)  return <div className="text-center p-5">Failed to load stats.</div>;

  // Prepare data for Recharts
  const categoryData = stats.byCategory.map((b) => ({ name: b._id, count: b.count }));
  const statusData   = stats.byStatus.map((b) => ({
    name:  b._id,
    value: b.count,
    fill:  STATUS_COLORS[b._id] || '#8884d8',
  }));

  return (
    <>
      <div className="page-header">
        <Container>
          <h2 className="fw-bold mb-1">🛡️ Admin Dashboard</h2>
          <p className="mb-0 opacity-75">
            Overview of all complaints and citizens in the system
          </p>
        </Container>
      </div>

      <Container className="pb-5 fade-in-up">
        {/* Stat Cards Row 1 */}
        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} lg={2}>
            <div className="stat-card stat-card-total">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total</div>
              <div className="stat-icon">📋</div>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={2}>
            <div className="stat-card stat-card-pending">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
              <div className="stat-icon">⏳</div>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={2}>
            <div className="stat-card stat-card-progress">
              <div className="stat-number">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
              <div className="stat-icon">🔧</div>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={2}>
            <div className="stat-card stat-card-resolved">
              <div className="stat-number">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
              <div className="stat-icon">✅</div>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={2}>
            <div className="stat-card stat-card-rejected">
              <div className="stat-number">{stats.rejected}</div>
              <div className="stat-label">Rejected</div>
              <div className="stat-icon">❌</div>
            </div>
          </Col>
          <Col xs={12} sm={6} lg={2}>
            <div className="stat-card stat-card-users">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Citizens</div>
              <div className="stat-icon">👥</div>
            </div>
          </Col>
        </Row>

        {/* Charts */}
        <Row className="g-4 mb-4">
          {/* Bar Chart — Complaints by Category */}
          <Col lg={7}>
            <Card className="cms-card h-100">
              <Card.Header className="bg-white border-bottom py-3">
                <h6 className="mb-0 fw-bold">📊 Complaints by Category</h6>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>

          {/* Pie Chart — Complaints by Status */}
          <Col lg={5}>
            <Card className="cms-card h-100">
              <Card.Header className="bg-white border-bottom py-3">
                <h6 className="mb-0 fw-bold">🍩 Status Distribution</h6>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Links */}
        <Row className="g-3">
          <Col md={4}>
            <Link to="/admin/complaints" className="text-decoration-none">
              <Card className="cms-card text-center p-3" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '2rem' }}>📋</div>
                <p className="fw-semibold mb-0 mt-1">Manage Complaints</p>
              </Card>
            </Link>
          </Col>
          <Col md={4}>
            <Link to="/admin/users" className="text-decoration-none">
              <Card className="cms-card text-center p-3" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '2rem' }}>👥</div>
                <p className="fw-semibold mb-0 mt-1">View Citizens</p>
              </Card>
            </Link>
          </Col>
          <Col md={4}>
            <Card className="cms-card text-center p-3">
              <div style={{ fontSize: '2rem' }}>📈</div>
              <p className="fw-semibold mb-0 mt-1">
                {stats.recentCount} new in last 7 days
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminDashboard;
