// controllers/authController.js
// Handles user registration, login, and profile retrieval

const jwt              = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User             = require('../models/User');

// ── Helper: sign a JWT for a given user ID ───────────────────────────────────
const generateToken = (id) => {
  return jwt.sign(
    { id },                              // payload — just the user's MongoDB _id
    process.env.JWT_SECRET,
    { expiresIn: '7d' }                  // token valid for 7 days
  );
};

/**
 * @desc    Register a new citizen user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered' });
    }

    // Create the new user (password is hashed in the pre-save hook)
    const user = await User.create({ name, email, phone, password });

    // Respond with user data + token
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role,
      },
    });
  } catch (error) {
    next(error); // pass to centralized error handler
  }
};

/**
 * @desc    Login an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include the password field (it's normally excluded)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    // Compare the entered password with the stored hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Private (requires JWT)
 */
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = { register, login, getMe };
