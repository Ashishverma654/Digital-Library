const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all activity logs (Admin only)
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getAllLogs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;

  // Optional filtering
  const query = {};
  if (req.query.action) query.action = req.query.action;
  if (req.query.user) query.user = req.query.user;

  const logs = await ActivityLog.find(query)
    .populate('user', 'name email role')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  const total = await ActivityLog.countDocuments(query);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    pagination: {
      page,
      pages: Math.ceil(total / limit)
    },
    data: logs
  });
});

// @desc    Get logs for a specific user
// @route   GET /api/users/:id/logs
// @access  Private
exports.getUserLogs = asyncHandler(async (req, res, next) => {
  // Users can only view their own logs unless they are ADMIN/LIBRARIAN
  if (req.user.id !== req.params.id && req.user.role === 'STUDENT') {
    return next(new AppError('Not authorized to access this route', 403));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const logs = await ActivityLog.find({ user: req.params.id })
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  const total = await ActivityLog.countDocuments({ user: req.params.id });

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    pagination: {
      page,
      pages: Math.ceil(total / limit)
    },
    data: logs
  });
});
