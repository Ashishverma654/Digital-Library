const express = require('express');
const { getBooks, getBook, createBook, updateBook, deleteBook, createReview, getReviews, getDigitalContent } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validatorMiddleware');
const { bookValidator } = require('../validators/bookValidators');

const router = express.Router();

router.route('/')
  .get(getBooks)
  .post(protect, authorize('LIBRARIAN'), bookValidator, validateRequest, createBook);

router.route('/:id')
  .get(getBook)
  .put(protect, authorize('LIBRARIAN'), bookValidator, validateRequest, updateBook)
  .delete(protect, authorize('LIBRARIAN'), deleteBook);

router.route('/:id/reviews')
  .get(getReviews)
  .post(protect, createReview);

router.route('/:id/read')
  .get(protect, getDigitalContent);

module.exports = router;
