const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validatorMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.get('/me', protect, getMe);

module.exports = router;
