const express = require('express');
const { getNotices, createNotice, deactivateNotice } = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getNotices)
  .post(protect, authorize('ADMIN'), createNotice);

router.route('/:id/deactivate')
  .put(protect, authorize('ADMIN'), deactivateNotice);

module.exports = router;
