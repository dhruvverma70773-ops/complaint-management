// controllers/adminController.js
// Handles admin-specific operations: stats and user listing

const Complaint = require('../models/Complaint');
const User      = require('../models/User');

/**
 * @desc    Get aggregated statistics for the admin dashboard
 * @route   GET /api/admin/stats
 * @access  Private (admin)
 */
const getStats = async (req, res, next) => {
  try {
    // Count documents matching each status using Promise.all for parallel execution
    const [total, pending, inProgress, resolved, rejected] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Rejected' }),
    ]);

    // Complaints grouped by category — used for the bar chart on the admin dashboard
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]);

    // Complaints grouped by status — used for the doughnut/pie chart
    const byStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Complaints over the last 7 days — simple trend data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = await Complaint.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const totalUsers = await User.countDocuments({ role: 'citizen' });

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        rejected,
        totalUsers,
        recentCount,
        byCategory,
        byStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registered citizen users
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    // Exclude admins from this list; also exclude password field
    const users = await User.find({ role: 'citizen' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getAllUsers };
