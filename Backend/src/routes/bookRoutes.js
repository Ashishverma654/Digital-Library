const express = require('express');
const { getBooks, getBook, createBook, updateBook, deleteBook } = require('../controllers/bookController');
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

module.exports = router;
