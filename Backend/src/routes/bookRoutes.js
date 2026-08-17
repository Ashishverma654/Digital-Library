const express = require('express');
const { 
  getBooks, 
  getBook, 
  createBook, 
  updateBook, 
  deleteBook,
  createReview,
  getReviews,
  getDigitalContent,
  joinWaitlist,
  getRecommendedBooks
} = require('../controllers/bookController');
const { getBookCopies, addBookCopy, updateBookCopy, deleteBookCopy } = require('../controllers/bookCopyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validatorMiddleware');
const { bookValidator } = require('../validators/bookValidators');

const router = express.Router();

router.route('/')
  .get(getBooks)
  .post(protect, authorize('LIBRARIAN'), bookValidator, validateRequest, createBook);

router.route('/recommended')
  .get(protect, getRecommendedBooks);

router.route('/:id')
  .get(getBook)
  .put(protect, authorize('LIBRARIAN'), bookValidator, validateRequest, updateBook)
  .delete(protect, authorize('LIBRARIAN'), deleteBook);

router.route('/:id/reviews')
  .get(getReviews)
  .post(protect, createReview);

router.route('/:id/read')
  .get(protect, getDigitalContent);

router.route('/:id/waitlist')
  .post(protect, joinWaitlist);

router.route('/:bookId/copies')
  .get(protect, authorize('LIBRARIAN', 'ADMIN'), getBookCopies)
  .post(protect, authorize('LIBRARIAN', 'ADMIN'), addBookCopy);

router.route('/copies/:id')
  .put(protect, authorize('LIBRARIAN', 'ADMIN'), updateBookCopy)
  .delete(protect, authorize('LIBRARIAN', 'ADMIN'), deleteBookCopy);

module.exports = router;
