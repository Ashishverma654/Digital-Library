const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.getDepartments = asyncHandler(async (req, res, next) => {
  const departments = await Department.find();
  res.status(200).json({ success: true, count: departments.length, data: departments });
});

exports.createDepartment = asyncHandler(async (req, res, next) => {
  const { name, code, description } = req.body;
  if (!name || !code) return next(new AppError('Please provide name and code', 400));
  
  const deptExists = await Department.findOne({ $or: [{ name }, { code }] });
  if (deptExists) return next(new AppError('Department already exists', 400));

  const department = await Department.create(req.body);
  res.status(201).json({ success: true, data: department });
});

exports.updateDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!department) return next(new AppError('Department not found', 404));
  res.status(200).json({ success: true, data: department });
});

exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) return next(new AppError('Department not found', 404));
  res.status(200).json({ success: true, data: {} });
});
