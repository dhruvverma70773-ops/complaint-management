// routes/complaintRoutes.js
// Complaint CRUD routes for both citizens and admin

const express = require('express');
const { body }  = require('express-validator');
const router    = express.Router();

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
} = require('../controllers/complaintController');

const { protect, adminOnly } = require('../middleware/auth');

// Validation rules for creating a complaint
const complaintValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category')
    .isIn(['Water', 'Electricity', 'Roads', 'Sanitation', 'Other'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority'),
];

// ── Citizen routes ────────────────────────────────────────────────────────────
// NOTE: '/my' MUST come before '/:id' to prevent "my" being treated as an ID
router.post('/',    protect, complaintValidation, createComplaint);
router.get('/my',   protect, getMyComplaints);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.get('/',     protect, adminOnly, getAllComplaints);

// ── Shared (citizen owner OR admin) ──────────────────────────────────────────
router.get('/:id',          protect,              getComplaintById);
router.put('/:id/status',   protect, adminOnly,   updateComplaintStatus);
router.delete('/:id',       protect, adminOnly,   deleteComplaint);

module.exports = router;
