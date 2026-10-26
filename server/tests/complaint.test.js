// tests/complaint.test.js
// Backend integration tests for complaint API routes
// Uses mongodb-memory-server — works without a real MongoDB Atlas connection

const request  = require('supertest');
const User     = require('../models/User');
const { connectTestDB, closeTestDB, clearDB } = require('./testHelper');

process.env.NODE_ENV = 'test';

let app;
let citizenToken, adminToken, complaintId;

beforeAll(async () => {
  await connectTestDB();
  app = require('../server');
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearDB();

  // Register a citizen
  const citizenRes = await request(app).post('/api/auth/register').send({
    name: 'Citizen', email: 'citizen@test.com', phone: '9000000001', password: 'pass1234',
  });
  citizenToken = citizenRes.body.token;

  // Create admin directly in DB (register API always creates citizens)
  await User.create({
    name: 'Admin', email: 'admin@test.com', phone: '9000000002',
    password: 'admin1234', role: 'admin',
  });
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com', password: 'admin1234',
  });
  adminToken = adminRes.body.token;
});

// Helper: create a sample complaint as citizen
const createComplaint = () =>
  request(app)
    .post('/api/complaints')
    .set('Authorization', `Bearer ${citizenToken}`)
    .send({
      title:       'Water Problem',
      category:    'Water',
      description: 'No water supply in the area for the last 3 days continuously.',
      location:    'Sector 5, Block A',
      priority:    'High',
    });

// ── Test suite ────────────────────────────────────────────────────────────────
describe('Complaint API', () => {

  // ── POST /api/complaints ──────────────────────────────────────────────────
  describe('POST /api/complaints', () => {
    it('should create a complaint and generate a CMP-XXXX id', async () => {
      const res = await createComplaint();
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.complaint.complaintId).toMatch(/^CMP-\d{4}$/);
    });

    it('should reject complaint creation without auth token', async () => {
      const res = await request(app).post('/api/complaints').send({
        title: 'No auth', category: 'Water',
        description: 'This should fail with 401 since no token.',
        location: 'Somewhere',
      });
      expect(res.statusCode).toBe(401);
    });

    it('should reject complaint when description is too short (< 20 chars)', async () => {
      const res = await request(app)
        .post('/api/complaints')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          title: 'Short', category: 'Roads',
          description: 'Too short',   // < 20 chars
          location: 'Sector 1',
        });
      expect(res.statusCode).toBe(400);
    });
  });

  // ── GET /api/complaints/my ────────────────────────────────────────────────
  describe('GET /api/complaints/my', () => {
    it('should return the citizen\'s own complaints', async () => {
      await createComplaint();  // create one

      const res = await request(app)
        .get('/api/complaints/my')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.complaints.length).toBeGreaterThan(0);
    });
  });

  // ── GET /api/complaints (admin) ───────────────────────────────────────────
  describe('GET /api/complaints', () => {
    it('should allow admin to get all complaints', async () => {
      const res = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });

    it('should return 403 when citizen tries to access all-complaints', async () => {
      const res = await request(app)
        .get('/api/complaints')
        .set('Authorization', `Bearer ${citizenToken}`);
      expect(res.statusCode).toBe(403);
    });
  });

  // ── PUT /api/complaints/:id/status (admin) ────────────────────────────────
  describe('PUT /api/complaints/:id/status', () => {
    beforeEach(async () => {
      const res = await createComplaint();
      complaintId = res.body.complaint._id;
    });

    it('should allow admin to update status to "In Progress"', async () => {
      const res = await request(app)
        .put(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'In Progress', remark: 'Team assigned' });

      expect(res.statusCode).toBe(200);
      expect(res.body.complaint.status).toBe('In Progress');
    });

    it('should return 400 for an invalid status value', async () => {
      const res = await request(app)
        .put(`/api/complaints/${complaintId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Not A Valid Status' });

      expect(res.statusCode).toBe(400);
    });
  });

  // ── DELETE /api/complaints/:id (admin) ───────────────────────────────────
  describe('DELETE /api/complaints/:id', () => {
    beforeEach(async () => {
      const res = await createComplaint();
      complaintId = res.body.complaint._id;
    });

    it('should allow admin to delete a complaint', async () => {
      const res = await request(app)
        .delete(`/api/complaints/${complaintId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 when citizen tries to delete a complaint', async () => {
      const res = await request(app)
        .delete(`/api/complaints/${complaintId}`)
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
