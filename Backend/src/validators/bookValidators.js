const { body } = require('express-validator');

exports.bookValidator = [
  body('title').trim().notEmpty().withMessage('Book title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('isbn').trim().notEmpty().withMessage('ISBN is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('type').isIn(['physical', 'digital', 'hybrid']).withMessage('Type must be physical, digital, or hybrid'),
  body('totalCopies').optional().isInt({ min: 0 }).withMessage('Total copies must be a positive integer'),
];
