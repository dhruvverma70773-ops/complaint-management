// src/pages/AdminComplaints.jsx
// Admin view of all complaints with search, filters, update status, and delete

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, InputGroup, Modal, Button,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { complaintAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const STATUSES   = ['', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
const CATEGORIES = ['', 'Water', 'Electricity', 'Roads', 'Sanitation', 'Other'];
const PRIORITIES = ['', 'High', 'Medium', 'Low'];

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({
    status: '', category: '', priority: '', search: '',
  });

  // Status update modal state
  const [showModal, setShowModal]     = useState(false);
  const [selected, setSelected]       = useState(null);
  const [newStatus, setNewStatus]     = useState('');
  const [remark, setRemark]           = useState('');
  const [updating, setUpdating]       = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status)   params.status   = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search)   params.search   = filters.search;

      const res = await complaintAPI.getAll(params);
      setComplaints(res.data.complaints);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Open the status update modal
  const openUpdateModal = (complaint) => {
    setSelected(complaint);
    setNewStatus(complaint.status);
    setRemark('');
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await complaintAPI.updateStatus(selected._id, { status: newStatus, remark });
      toast.success('Status updated successfully ✅');
      setShowModal(false);
      fetchComplaints(); // refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id, complaintId) => {
    if (!window.confirm(`Are you sure you want to delete ${complaintId}?`)) return;
    try {
      await complaintAPI.delete(id);
      toast.success('Complaint deleted');
      fetchComplaints();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <>
      <div className="page-header">
        <Container>
          <h2 className="fw-bold mb-1">📋 All Complaints</h2>
          <p className="mb-0 opacity-75">
            Manage, update, and resolve citizen complaints
          </p>
        </Container>
      </div>

      <Container className="pb-5 fade-in-up">
        {/* Filter Bar */}
        <Card className="cms-card mb-4 p-3">
          <Row className="g-2">
            <Col md={3}>
              <Form.Control
                id="admin-search"
                type="text"
                name="search"
                placeholder="🔍 Search by title, ID, location…"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Col>
            <Col md={2}>
              <Form.Select id="filter-status" name="status" value={filters.status} onChange={handleFilterChange}>
                {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select id="filter-category" name="category" value={filters.category} onChange={handleFilterChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select id="filter-priority" name="priority" value={filters.priority} onChange={handleFilterChange}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ status: '', category: '', priority: '', search: '' })}
              >
                Clear Filters
              </button>
            </Col>
          </Row>
        </Card>

        {loading ? (
          <Spinner message="Loading complaints…" />
        ) : (
          <>
            <p className="text-muted small mb-3">
              Showing <strong>{complaints.length}</strong> complaint(s)
            </p>

            {complaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h5>No complaints found</h5>
              </div>
            ) : (
              <Card className="cms-card">
                <div className="table-responsive">
                  <table className="table cms-table mb-0">
                    <thead>
                      <tr>
                        <th>Complaint ID</th>
                        <th>Citizen</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((c) => (
                        <tr key={c._id}>
                          <td>
                            <span className="complaint-id">{c.complaintId}</span>
                          </td>
                          <td className="small">
                            <div className="fw-medium">{c.citizen?.name}</div>
                            <div className="text-muted">{c.citizen?.email}</div>
                          </td>
                          <td style={{ maxWidth: '180px' }}>
                            <span className="small fw-medium">{c.title}</span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {c.category}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge small priority-${c.priority.toLowerCase()}`}
                              style={{ padding: '4px 8px' }}
                            >
                              {c.priority}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="small text-muted">
                            {new Date(c.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Link
                                to={`/complaints/${c._id}`}
                                className="btn btn-sm btn-outline-primary"
                                title="View"
                              >
                                👁️
                              </Link>
                              <button
                                className="btn btn-sm btn-outline-success"
                                title="Update Status"
                                onClick={() => openUpdateModal(c)}
                              >
                                🔄
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                                onClick={() => handleDelete(c._id, c.complaintId)}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </Container>

      {/* Update Status Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🔄 Update Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <>
              <p className="mb-3">
                Complaint:{' '}
                <span className="complaint-id">{selected.complaintId}</span>
                <br />
                <strong>{selected.title}</strong>
              </p>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">New Status *</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUSES.filter((s) => s).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label className="fw-medium">Remark / Note (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="e.g. Team assigned, work in progress…"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button className="btn-cms" onClick={handleStatusUpdate} disabled={updating}>
            {updating ? 'Updating…' : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminComplaints;
