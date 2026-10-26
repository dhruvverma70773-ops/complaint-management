// src/pages/FileComplaint.jsx
// Form for citizens to file a new complaint

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { complaintAPI } from '../services/api';

const CATEGORIES = ['Water', 'Electricity', 'Roads', 'Sanitation', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const FileComplaint = () => {
  const navigate  = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [formData, setFormData] = useState({
    title:       '',
    category:    '',
    description: '',
    location:    '',
    imageUrl:    '',
    priority:    'Medium',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev)   => ({ ...prev, [e.target.name]: '' }));
  };

  // Validate all required fields before submitting
  const validate = () => {
    const errs = {};
    if (!formData.title.trim())
      errs.title = 'Title is required';
    if (!formData.category)
      errs.category = 'Please select a category';
    if (formData.description.trim().length < 20)
      errs.description = 'Description must be at least 20 characters';
    if (!formData.location.trim())
      errs.location = 'Location/address is required';
    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl))
      errs.imageUrl = 'Enter a valid URL (starting with http/https)';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      const res = await complaintAPI.create(formData);
      const { complaintId } = res.data.complaint;
      toast.success(`Complaint filed! Your ID: ${complaintId} 📋`);
      navigate('/complaints');
    } catch (err) {
      // Show backend validation errors if any
      const data = err.response?.data;
      if (data?.errors) {
        const beErrors = {};
        data.errors.forEach((e) => { beErrors[e.path] = e.msg; });
        setErrors(beErrors);
      } else {
        toast.error(data?.message || 'Failed to submit complaint. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <Container>
          <h2 className="fw-bold mb-1">➕ File a New Complaint</h2>
          <p className="mb-0 opacity-75">
            Describe your issue clearly so we can address it quickly
          </p>
        </Container>
      </div>

      <Container className="pb-5 fade-in-up">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="cms-card p-4">
              <Form onSubmit={handleSubmit} className="cms-form" noValidate>
                {/* Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Complaint Title *</Form.Label>
                  <Form.Control
                    id="complaint-title"
                    type="text"
                    name="title"
                    placeholder="e.g. No water supply for 3 days"
                    value={formData.title}
                    onChange={handleChange}
                    isInvalid={!!errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  {/* Category */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Category *</Form.Label>
                      <Form.Select
                        id="complaint-category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        isInvalid={!!errors.category}
                      >
                        <option value="">-- Select Category --</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* Priority */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">Priority</Form.Label>
                      <Form.Select
                        id="complaint-priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Description */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    Description *{' '}
                    <span className="text-muted small">
                      ({formData.description.length}/20 min)
                    </span>
                  </Form.Label>
                  <Form.Control
                    id="complaint-description"
                    as="textarea"
                    name="description"
                    rows={4}
                    placeholder="Describe the issue in detail — when it started, how it's affecting you, etc."
                    value={formData.description}
                    onChange={handleChange}
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Location */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Location / Address *</Form.Label>
                  <Form.Control
                    id="complaint-location"
                    type="text"
                    name="location"
                    placeholder="e.g. Sector 12, Block A, Near Main Park"
                    value={formData.location}
                    onChange={handleChange}
                    isInvalid={!!errors.location}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.location}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Image URL (optional) */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">
                    Image URL{' '}
                    <span className="text-muted small">(optional)</span>
                  </Form.Label>
                  <Form.Control
                    id="complaint-imageUrl"
                    type="url"
                    name="imageUrl"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    isInvalid={!!errors.imageUrl}
                  />
                  <Form.Text className="text-muted">
                    Provide a photo of the issue if available
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.imageUrl}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Info box */}
                <div className="alert alert-info py-2 small mb-4">
                  ℹ️ After submission, you'll receive a unique <strong>Complaint ID</strong> to track your complaint status.
                </div>

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    className="btn-cms flex-grow-1 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Submitting…
                      </>
                    ) : (
                      '📤 Submit Complaint'
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default FileComplaint;
