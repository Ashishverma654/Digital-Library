const Notice = require('../models/Notice');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all active notices
// @route   GET /api/notices
// @access  Public (or Private to all roles)
exports.getNotices = asyncHandler(async (req, res, next) => {
  const notices = await Notice.find({ active: true }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: notices.length, data: notices });
});

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private (Admin)
exports.createNotice = asyncHandler(async (req, res, next) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return next(new AppError('Please provide title and message', 400));
  }
  
  const notice = await Notice.create({
    title,
    message,
    createdBy: req.user.id
  });

  res.status(201).json({ success: true, data: notice });
});

// @desc    Deactivate a notice
// @route   PUT /api/notices/:id/deactivate
// @access  Private (Admin)
exports.deactivateNotice = asyncHandler(async (req, res, next) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return next(new AppError('Notice not found', 404));

  notice.active = false;
  await notice.save();

  res.status(200).json({ success: true, data: notice });
});
