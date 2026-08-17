const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.getCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find().populate('department', 'name code');
  res.status(200).json({ success: true, count: courses.length, data: courses });
});

exports.createCourse = asyncHandler(async (req, res, next) => {
  const { name, code, department } = req.body;
  if (!name || !code || !department) return next(new AppError('Please provide name, code, and department', 400));
  
  const courseExists = await Course.findOne({ $or: [{ name }, { code }] });
  if (courseExists) return next(new AppError('Course already exists', 400));

  const course = await Course.create(req.body);
  res.status(201).json({ success: true, data: course });
});

exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) return next(new AppError('Course not found', 404));
  res.status(200).json({ success: true, data: course });
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));
  res.status(200).json({ success: true, data: {} });
});
