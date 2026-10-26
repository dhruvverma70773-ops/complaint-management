// tests/auth.test.js
// Backend integration tests for authentication routes
// Uses mongodb-memory-server — no real MongoDB Atlas connection needed!

const request  = require('supertest');
const { connectTestDB, closeTestDB, clearDB } = require('./testHelper');

// Set test env BEFORE requiring the app (so server.js doesn't listen)
process.env.NODE_ENV = 'test';

let app;

beforeAll(async () => {
  await connectTestDB();           // 1. Start in-memory MongoDB
  app = require('../server');      // 2. Load Express app (db.js will connect to memory URI)
});

afterAll(async () => {
  await closeTestDB();             // Disconnect and stop memory server
});

beforeEach(async () => {
  await clearDB();                 // Fresh slate before each test
});

// ── Test suite ────────────────────────────────────────────────────────────────
describe('Auth API', () => {

  // ── POST /api/auth/register ─────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register a new citizen user and return a token', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User', email: 'test@example.com',
        phone: '9876543210', password: 'test1234',
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('citizen');  // default role
    });

    it('should reject registration with a duplicate email', async () => {
      // Register first user
      await request(app).post('/api/auth/register').send({
        name: 'First', email: 'dupe@example.com', phone: '9876543210', password: 'test1234',
      });
      // Attempt to register with same email
      const res = await request(app).post('/api/auth/register').send({
        name: 'Second', email: 'dupe@example.com', phone: '9876543211', password: 'test1234',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with an invalid email format', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Bad Email', email: 'not-valid-email',
        phone: '9876543212', password: 'test1234',
      });
      expect(res.statusCode).toBe(400);
    });

    it('should reject registration when password is shorter than 6 chars', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Short Pass', email: 'short@example.com',
        phone: '9876543213', password: '123',
      });
      expect(res.statusCode).toBe(400);
    });

    it('should reject registration when the name is missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'missing-name@example.com',
        phone: '9876543214',
        password: 'test1234',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── POST /api/auth/login ────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Pre-create a user to login with
      await request(app).post('/api/auth/register').send({
        name: 'Login User', email: 'login@example.com',
        phone: '9876543210', password: 'test1234',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com', password: 'test1234',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com', password: 'wrongpassword',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for a non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com', password: 'test1234',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── GET /api/auth/me ────────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return the authenticated user profile', async () => {
      // Register to get a token
      const reg = await request(app).post('/api/auth/register').send({
        name: 'Profile User', email: 'profile@example.com',
        phone: '9876543210', password: 'test1234',
      });
      const token = reg.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('profile@example.com');
    });

    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
