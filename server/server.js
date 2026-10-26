// server.js
// Main entry point for the Express application

const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const dotenv       = require('dotenv');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

// Enable CORS — allows the React frontend (on a different port/domain) to call this API
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL   // in production, restrict to deployed frontend URL
    : '*',                     // in development, allow all origins
  credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// HTTP request logger — only in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));

// Health-check endpoint — useful for deployment platforms like Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running ✅' });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Centralized error handler (must be LAST middleware) ───────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Only listen if not in test mode (Supertest handles its own server)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`
    );
  });
}

// Export app for Supertest in tests
module.exports = app;
