// routes/adminRoutes.js
// Admin-only routes for stats and user management

const express = require('express');
const router  = express.Router();

const { getStats, getAllUsers } = require('../controllers/adminController');
const { protect, adminOnly }   = require('../middleware/auth');

// All admin routes require authentication AND admin role
router.use(protect, adminOnly);

// @route  GET /api/admin/stats
router.get('/stats', getStats);

// @route  GET /api/admin/users
router.get('/users', getAllUsers);

module.exports = router;
