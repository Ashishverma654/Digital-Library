const express = require('express');
const { requestBook, getMyTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validatorMiddleware');
const { requestBookValidator } = require('../validators/transactionValidators');

const router = express.Router();

router.route('/request')
  .post(protect, requestBookValidator, validateRequest, requestBook);

router.route('/my')
  .get(protect, getMyTransactions);

module.exports = router;
