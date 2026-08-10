const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  // Basic validation (Will be replaced by express-validator in Phase 2)
  if (!name || !email || !phone || !password || !confirmPassword) {
    return next(new AppError('Please provide all required fields', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new AppError('Email already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password (Will be replaced by express-validator in Phase 2)
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
