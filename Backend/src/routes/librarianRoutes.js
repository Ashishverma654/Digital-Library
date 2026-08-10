const express = require('express');
const { getAllTransactions, approveRequest, rejectRequest } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validatorMiddleware');
const { rejectRequestValidator } = require('../validators/transactionValidators');

const router = express.Router();

router.use(protect);
router.use(authorize('LIBRARIAN'));

router.route('/transactions')
  .get(getAllTransactions);

router.route('/transactions/:id/approve')
  .put(approveRequest);

router.route('/transactions/:id/reject')
  .put(rejectRequestValidator, validateRequest, rejectRequest);

router.route('/transactions/:id/return')
  .put(require('../controllers/transactionController').returnBook);

router.route('/transactions/:id/fine-paid')
  .put(require('../controllers/transactionController').markFinePaid);

router.route('/stats')
  .get(require('../controllers/statsController').getSystemStats);

module.exports = router;
