const User = require('../models/User');
const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all Librarians
// @route   GET /api/admin/librarians
// @access  Private (Admin)
exports.getLibrarians = asyncHandler(async (req, res, next) => {
  const librarians = await User.find({ role: 'LIBRARIAN' });
  res.status(200).json({ success: true, count: librarians.length, data: librarians });
});

// @desc    Create a Librarian
// @route   POST /api/admin/librarians
// @access  Private (Admin)
exports.createLibrarian = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('Email already exists', 400));
  }

  const librarian = await User.create({
    name,
    email,
    phone,
    password,
    role: 'LIBRARIAN'
  });

  res.status(201).json({ success: true, data: librarian });
});

// @desc    Get Settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
exports.getSettings = asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({}); // Create default if none
  }
  res.status(200).json({ success: true, data: settings });
});

// @desc    Update Settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
exports.updateSettings = asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  const { finePerDay, maxBorrowDays, maxBooksPerStudent, libraryHours, waitlistEnabled } = req.body;
  if (finePerDay !== undefined) settings.finePerDay = finePerDay;
  if (maxBorrowDays !== undefined) settings.maxBorrowDays = maxBorrowDays;
  if (maxBooksPerStudent !== undefined) settings.maxBooksPerStudent = maxBooksPerStudent;
  
  // Handle new fields
  if (libraryHours !== undefined) settings.libraryHours = libraryHours;
  if (waitlistEnabled !== undefined) settings.waitlistEnabled = waitlistEnabled;

  await settings.save();
  res.status(200).json({ success: true, data: settings });
});

// @desc    Get all users (Students & Librarians & Admins)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find()
    .populate('course')
    .populate('department');
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Create any user
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, role, studentId, department, course, section } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return next(new AppError('Please provide all required fields', 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('Email already exists', 400));
  }

  if (role === 'STUDENT') {
    if (!studentId || !department || !course) {
      return next(new AppError('Student ID, Department, and Course are required for students', 400));
    }
    const studentExists = await User.findOne({ studentId });
    if (studentExists) {
      return next(new AppError('Student ID already exists', 400));
    }
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    ...(role === 'STUDENT' && { studentId, department, course, section })
  });

  res.status(201).json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!user) return next(new AppError('User not found', 404));
  res.status(200).json({ success: true, data: user });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Do not allow deleting yourself
  if (user._id.toString() === req.user.id) {
    return next(new AppError('You cannot delete your own account', 400));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});

// @desc    Toggle user suspension status
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin)
exports.toggleUserSuspension = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Do not allow suspending yourself
  if (user._id.toString() === req.user.id) {
    return next(new AppError('You cannot suspend your own account', 400));
  }

  user.status = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, data: user });
});

// @desc    Bulk create users
// @route   POST /api/admin/users/bulk
// @access  Private (Admin)
exports.bulkCreateUsers = asyncHandler(async (req, res, next) => {
  const { users } = req.body;

  if (!users || !Array.isArray(users) || users.length === 0) {
    return next(new AppError('Please provide an array of users', 400));
  }

  const createdUsers = [];
  const errors = [];

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    try {
      // Basic validation
      if (!u.name || !u.email || !u.role) {
        errors.push({ row: i + 1, email: u.email, message: 'Missing required fields' });
        continue;
      }

      const userExists = await User.findOne({ email: u.email });
      if (userExists) {
        errors.push({ row: i + 1, email: u.email, message: 'Email already exists' });
        continue;
      }

      // Default password to student id or a generic one if not provided
      const password = u.password || u.studentId || 'defaultPassword123';

      const newUser = await User.create({
        name: u.name,
        email: u.email,
        phone: u.phone || '0000000000',
        password,
        role: u.role,
        studentId: u.studentId,
        department: u.department || null,
        course: u.course || null,
        yearEnrolled: u.yearEnrolled || new Date().getFullYear(),
      });

      createdUsers.push(newUser);
    } catch (err) {
      errors.push({ row: i + 1, email: u.email, message: err.message });
    }
  }

  res.status(201).json({
    success: true,
    count: createdUsers.length,
    data: createdUsers,
    errors
  });
});
