const express = require('express');
const { register, login, getMe, refresh, logout, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validatorMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { getUserLogs } = require('../controllers/activityController');

const router = express.Router();

router.post('/login', loginValidator, validateRequest, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Route to get current user's logs
router.get('/me/logs', protect, (req, res, next) => {
  req.params.id = req.user.id;
  next();
}, getUserLogs);

module.exports = router;
