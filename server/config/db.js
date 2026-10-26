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

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
