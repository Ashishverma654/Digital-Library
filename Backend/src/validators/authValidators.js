const { body } = require('express-validator');

exports.registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

exports.loginValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Please provide a password'),
];
