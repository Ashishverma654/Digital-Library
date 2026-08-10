const { body } = require('express-validator');

exports.requestBookValidator = [
  body('bookId').trim().notEmpty().withMessage('Book ID is required').isMongoId().withMessage('Invalid Book ID format'),
];

exports.rejectRequestValidator = [
  body('reason').optional().trim().isString().withMessage('Reason must be a string'),
];
