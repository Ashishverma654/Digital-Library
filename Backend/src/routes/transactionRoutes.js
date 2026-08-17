const express = require('express');
const { requestBook, getMyTransactions, renewBook, studentReturnBook, payFineStudent, cancelExpiredRequests } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validatorMiddleware');
const { requestBookValidator } = require('../validators/transactionValidators');

const router = express.Router();

router.route('/request')
  .post(protect, requestBookValidator, validateRequest, requestBook);

router.route('/my')
  .get(protect, getMyTransactions);

router.route('/:id/renew')
  .put(protect, renewBook);

router.route('/:id/return')
  .put(protect, studentReturnBook);

router.route('/:id/pay-fine')
  .put(protect, payFineStudent);

router.route('/cancel-expired')
  .post(protect, authorize('ADMIN', 'LIBRARIAN'), cancelExpiredRequests);

module.exports = router;
