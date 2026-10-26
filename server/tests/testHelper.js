// tests/testHelper.js
// Shared test utilities — each test file gets its own in-memory MongoDB instance.
// When running with --runInBand, only one MongoMemoryServer is active at a time.

const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv                = require('dotenv');
const path                  = require('path');

// Load .env for JWT_SECRET and other non-DB env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });
process.env.NODE_ENV = 'test';

let mongoServer;

/**
 * connectTestDB — call in beforeAll().
 * Starts a fresh in-memory MongoDB and connects mongoose.
 */
const connectTestDB = async () => {
  // Disconnect any existing connection from a previous test file
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();
  process.env.MONGO_URI = uri;

  await mongoose.connect(uri);
};

/**
 * closeTestDB — call in afterAll().
 * Disconnects mongoose and stops the in-memory server.
 */
const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

/**
 * clearDB — call in beforeEach().
 * Wipes all collections for a clean slate between tests.
 */
const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connectTestDB, closeTestDB, clearDB };
