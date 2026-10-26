// middleware/auth.js
// Authentication & Authorization middleware

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies the JWT from the Authorization header.
 * Attaches the authenticated user to req.user.
 * Usage: router.get('/route', protect, handler)
 */
const protect = async (req, res, next) => {
  let token;

  // JWT is sent as:  Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    // Verify token signature and extract payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user (without password) and attach to request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, token failed' });
  }
};

/**
 * adminOnly — must be used AFTER protect.
 * Ensures only admin users can access the route.
 * Usage: router.get('/route', protect, adminOnly, handler)
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res
      .status(403)
      .json({ success: false, message: 'Access denied: Admins only' });
  }
};

module.exports = { protect, adminOnly };
