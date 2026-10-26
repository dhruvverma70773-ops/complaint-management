// src/pages/ComplaintDetail.jsx
// Shows full details of a single complaint with status history timeline

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

const ComplaintDetail = () => {
  const { id }                      = useParams();
  const navigate                    = useNavigate();
  const { isAdmin }                 = useAuth();
  const [complaint, setComplaint]   = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await complaintAPI.getById(id);
        setComplaint(res.data.complaint);
      } catch (err) {
        if (err.response?.status === 404) {
          toast.error('Complaint not found');
          navigate(-1);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id, navigate]);

  if (loading)    return <Spinner />;
  if (!complaint) return null;

  // Map status string to timeline dot CSS class
  const dotClass = (status) => ({
    'Pending':     'pending',
    'In Progress': 'in-progress',
    'Resolved':    'resolved',
    'Rejected':    'rejected',
  }[status] || '');

  const priorityConfig = {
    High:   { cls: 'priority-high',   emoji: '🔴' },
    Medium: { cls: 'priority-medium', emoji: '🟡' },
    Low:    { cls: 'priority-low',    emoji: '🟢' },
  };

  return (
    <>
      <div className="page-header">
        <Container>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
            <div>
              <h2 className="fw-bold mb-1">Complaint Details</h2>
              <span className="complaint-id" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                {complaint.complaintId}
              </span>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pb-5 fade-in-up">
        <Row className="g-4">
          {/* Left column: main details */}
          <Col lg={8}>
            <Card className="cms-card mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
                  <StatusBadge status={complaint.status} />
                  <span
                    className={`badge small ${priorityConfig[complaint.priority]?.cls}`}
                    style={{ padding: '5px 10px' }}
                  >
                    {priorityConfig[complaint.priority]?.emoji} {complaint.priority} Priority
                  </span>
                </div>

                <h4 className="fw-bold mb-3">{complaint.title}</h4>

                <div className="d-flex gap-3 flex-wrap mb-4">
                  <span className="badge bg-light text-dark border fs-6 px-3 py-2">
                    🏷️ {complaint.category}
                  </span>
                  <span className="text-muted d-flex align-items-center gap-1">
                    📍 {complaint.location}
                  </span>
                  <span className="text-muted d-flex align-items-center gap-1">
                    📅 {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>

                <h6 className="fw-semibold text-muted text-uppercase small mb-2">
                  Description
                </h6>
                <p className="mb-0" style={{ lineHeight: '1.7' }}>
                  {complaint.description}
                </p>

                {/* Image preview */}
                {complaint.imageUrl && (
                  <div className="mt-4">
                    <h6 className="fw-semibold text-muted text-uppercase small mb-2">
                      Attached Image
                    </h6>
                    <img
                      src={complaint.imageUrl}
                      alt="Complaint"
                      className="img-fluid rounded"
                      style={{ maxHeight: '300px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Status Timeline */}
            <Card className="cms-card">
              <Card.Header className="bg-white border-bottom py-3">
                <h6 className="mb-0 fw-bold">🕐 Status History / Timeline</h6>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="timeline">
                  {complaint.statusHistory.map((h, i) => (
                    <div key={i} className="timeline-item">
                      <div className={`timeline-dot ${dotClass(h.status)}`} />
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <StatusBadge status={h.status} />
                          <span className="text-muted small">
                            {new Date(h.updatedAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {h.remark && (
                          <p className="mb-0 text-muted small">
                            💬 {h.remark}
                          </p>
                        )}
                        {h.updatedBy && (
                          <p className="mb-0 text-muted small">
                            👤 By: {h.updatedBy.name || 'Admin'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right column: citizen info */}
          <Col lg={4}>
            <Card className="cms-card mb-4">
              <Card.Header className="bg-white border-bottom py-3">
                <h6 className="mb-0 fw-bold">👤 Filed By</h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-1">
                  <strong>Name:</strong> {complaint.citizen?.name}
                </p>
                <p className="mb-1">
                  <strong>Email:</strong> {complaint.citizen?.email}
                </p>
                {isAdmin && (
                  <p className="mb-0">
                    <strong>Phone:</strong> {complaint.citizen?.phone}
                  </p>
                )}
              </Card.Body>
            </Card>

            <Card className="cms-card">
              <Card.Header className="bg-white border-bottom py-3">
                <h6 className="mb-0 fw-bold">📊 Complaint Info</h6>
              </Card.Header>
              <Card.Body>
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted small">ID</td>
                      <td><span className="complaint-id">{complaint.complaintId}</span></td>
                    </tr>
                    <tr>
                      <td className="text-muted small">Filed On</td>
                      <td className="small">
                        {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted small">Last Updated</td>
                      <td className="small">
                        {new Date(complaint.updatedAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted small">Updates</td>
                      <td className="small">{complaint.statusHistory.length} change(s)</td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ComplaintDetail;
