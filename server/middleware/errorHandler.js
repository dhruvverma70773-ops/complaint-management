// middleware/errorHandler.js
// Centralized error handling middleware for Express

/**
 * This middleware is registered LAST in server.js (after all routes).
 * Any error passed via next(error) lands here.
 * It returns a consistent JSON error response so the frontend always
 * receives the same error shape: { success: false, message: "..." }
 */
const errorHandler = (err, req, res, next) => {
  // Log the error stack in development for easy debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('🔴 Error:', err.stack);
  }

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message    = err.message || 'Internal Server Error';

  // Handle Mongoose "document not found" error
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message    = 'Resource not found (invalid ID format)';
  }

  // Handle Mongoose duplicate key error (e.g., duplicate email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
