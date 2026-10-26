// src/pages/MyComplaints.jsx
// Lists all complaints filed by the logged-in citizen with search and filters

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, InputGroup } from 'react-bootstrap';
import { complaintAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const CATEGORIES = ['', 'Water', 'Electricity', 'Roads', 'Sanitation', 'Other'];
const STATUSES   = ['', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({ status: '', category: '', search: '' });

  // Fetch complaints from API — re-run when filters change
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      // Build query params (only include non-empty values)
      const params = {};
      if (filters.status)   params.status   = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search)   params.search   = filters.search;

      const res = await complaintAPI.getMy(params);
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', category: '', search: '' });
  };

  const priorityClass = (p) => ({
    High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low',
  }[p] || '');

  return (
    <>
      <div className="page-header">
        <Container>
          <h2 className="fw-bold mb-1">📋 My Complaints</h2>
          <p className="mb-0 opacity-75">
            Search, filter, and track all your filed complaints
          </p>
        </Container>
      </div>

      <Container className="pb-5 fade-in-up">
        {/* Filters Bar */}
        <Card className="cms-card mb-4 p-3">
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Label className="small fw-medium mb-1">🔍 Search</Form.Label>
              <InputGroup>
                <Form.Control
                  id="search-input"
                  type="text"
                  name="search"
                  placeholder="Title or complaint ID…"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label className="small fw-medium mb-1">Status</Form.Label>
              <Form.Select
                id="filter-status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s || 'All Statuses'}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small fw-medium mb-1">Category</Form.Label>
              <Form.Select
                id="filter-category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c || 'All Categories'}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={clearFilters}
              >
                Clear
              </button>
              <Link to="/complaints/new" className="btn btn-cms btn-sm w-100">
                ➕ New
              </Link>
            </Col>
          </Row>
        </Card>

        {/* Results */}
        {loading ? (
          <Spinner message="Loading complaints…" />
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h5>No complaints found</h5>
            <p>Try changing your filters or file a new complaint.</p>
            <Link to="/complaints/new" className="btn btn-cms">
              File a Complaint
            </Link>
          </div>
        ) : (
          <>
            <p className="text-muted small mb-3">
              Showing <strong>{complaints.length}</strong> complaint(s)
            </p>
            <Row className="g-3">
              {complaints.map((c) => (
                <Col xs={12} key={c._id}>
                  <Card className="cms-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div>
                          <span className="complaint-id me-2">{c.complaintId}</span>
                          <span
                            className={`badge small ${priorityClass(c.priority)} me-2`}
                            style={{ borderRadius: '4px', padding: '3px 8px' }}
                          >
                            {c.priority}
                          </span>
                          <span className="badge bg-light text-dark border small">
                            {c.category}
                          </span>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>

                      <h6 className="fw-semibold mt-2 mb-1">{c.title}</h6>
                      <p
                        className="text-muted small mb-2"
                        style={{ overflow: 'hidden', maxHeight: '2.8em' }}
                      >
                        {c.description}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">
                          📍 {c.location} &nbsp;•&nbsp; 📅{' '}
                          {new Date(c.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                        <Link
                          to={`/complaints/${c._id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View Details →
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default MyComplaints;
