// routes/authRoutes.js
// Authentication routes: register, login, get profile

const express = require('express');
const { body }  = require('express-validator');
const router    = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const { protect }                = require('../middleware/auth');

// Validation rules for registration
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone must be 10-15 digits'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// @route  POST /api/auth/register
router.post('/register', registerValidation, register);

// @route  POST /api/auth/login
router.post('/login', loginValidation, login);

// @route  GET /api/auth/me   (protected)
router.get('/me', protect, getMe);

module.exports = router;
