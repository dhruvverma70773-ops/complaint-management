// controllers/complaintController.js
// Handles all complaint CRUD operations

const { validationResult } = require('express-validator');
const Complaint            = require('../models/Complaint');

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Private (citizen)
 */
const createComplaint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, category, description, location, imageUrl, priority } =
      req.body;

    // Create complaint and attach the logged-in citizen's ID
    const complaint = await Complaint.create({
      title,
      category,
      description,
      location,
      imageUrl,
      priority,
      citizen: req.user._id,
      // Seed the statusHistory with the initial "Pending" status
      statusHistory: [
        {
          status:    'Pending',
          remark:    'Complaint registered successfully',
          updatedBy: req.user._id,
        },
      ],
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all complaints filed by the logged-in citizen
 * @route   GET /api/complaints/my
 * @access  Private (citizen)
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;

    // Build a dynamic filter object
    const filter = { citizen: req.user._id };
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 }) // newest first
      .populate('citizen', 'name email');

    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single complaint by ID
 * @route   GET /api/complaints/:id
 * @access  Private (owner citizen OR any admin)
 */
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone')
      .populate('statusHistory.updatedBy', 'name');

    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: 'Complaint not found' });
    }

    // Citizens may only view their own complaints; admins can view any
    if (
      req.user.role !== 'admin' &&
      complaint.citizen._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all complaints (admin) with search and filters
 * @route   GET /api/complaints
 * @access  Private (admin)
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, search, startDate, endDate } =
      req.query;

    const filter = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } },
        { location:    { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate('citizen', 'name email phone');

    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the status of a complaint (admin only)
 * @route   PUT /api/complaints/:id/status
 * @access  Private (admin)
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, remark } = req.body;

    const allowed = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: 'Complaint not found' });
    }

    // Update the current status
    complaint.status = status;

    // Append to statusHistory so the citizen can see the timeline
    complaint.statusHistory.push({
      status,
      remark:    remark || '',
      updatedBy: req.user._id,
    });

    await complaint.save();

    const updated = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email')
      .populate('statusHistory.updatedBy', 'name');

    res.status(200).json({ success: true, complaint: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a complaint (admin only)
 * @route   DELETE /api/complaints/:id
 * @access  Private (admin)
 */
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: 'Complaint not found' });
    }

    await complaint.deleteOne();
    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
};
