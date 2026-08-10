const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isRead: true },
    { new: true, runValidators: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});
