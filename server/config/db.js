// config/db.js
// Handles MongoDB Atlas connection using Mongoose

const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas (or in-memory server in tests).
 * Skips reconnection if already connected — safe for test environments.
 */
const connectDB = async () => {
  // Already connected — skip (important in test environments)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MongoDB Connection Error: MONGO_URI or MONGODB_URI is not configured');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
