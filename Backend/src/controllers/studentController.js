const User = require('../models/User');
const BorrowTransaction = require('../models/BorrowTransaction');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Librarian)
exports.getStudents = asyncHandler(async (req, res, next) => {
  const students = await User.find({ role: 'STUDENT' }).populate('course department');
  res.status(200).json({ success: true, count: students.length, data: students });
});

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (Admin, Librarian)
exports.createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, phone, studentId, course, yearEnrolled, section } = req.body;

  if (!name || !email || !phone || !studentId || !course) {
    return next(new AppError('Please provide all required fields including studentId and course', 400));
  }

  const userExists = await User.findOne({ $or: [{ email }, { studentId }] });
  if (userExists) {
    return next(new AppError('Email or Student ID already exists', 400));
  }

  const student = await User.create({
    name,
    email,
    phone,
    password: req.body.password || studentId, // Default password to studentId
    role: 'STUDENT',
    studentId,
    course,
    yearEnrolled,
    section
  });

  res.status(201).json({ success: true, data: student });
});

// @desc    Get student details with active borrows
// @route   GET /api/students/:id
// @access  Private (Admin, Librarian)
exports.getStudentDetails = asyncHandler(async (req, res, next) => {
  const student = await User.findById(req.params.id);
  if (!student || student.role !== 'STUDENT') {
    return next(new AppError('Student not found', 404));
  }

  const transactions = await BorrowTransaction.find({ user: student._id })
    .populate('book', 'title type')
    .sort({ requestedAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      student,
      transactions
    }
  });
});
