// tests/setup.js
// Jest global setup — starts an in-memory MongoDB server for testing.
// This means tests work WITHOUT a real MongoDB Atlas connection.
// The in-memory server is fast, isolated, and automatically cleaned up.

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose              = require('mongoose');
const dotenv                = require('dotenv');
const path                  = require('path');

// Load .env (for JWT_SECRET, etc.) but we'll override MONGO_URI
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Set test environment
process.env.NODE_ENV = 'test';

let mongoServer;

// Before all tests: start in-memory MongoDB and connect
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();

  // Override the MONGO_URI with the in-memory server's URI
  process.env.MONGO_URI = uri;

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

// After all tests: disconnect and stop the in-memory server
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
