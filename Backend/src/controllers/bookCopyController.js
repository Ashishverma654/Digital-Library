const BookCopy = require('../models/BookCopy');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all copies of a book
// @route   GET /api/books/:bookId/copies
// @access  Private (Librarian)
exports.getBookCopies = asyncHandler(async (req, res, next) => {
  const copies = await BookCopy.find({ book: req.params.bookId })
    .populate('currentBorrower', 'name studentId email');

  res.status(200).json({
    success: true,
    count: copies.length,
    data: copies
  });
});

// @desc    Add a copy to a book
// @route   POST /api/books/:bookId/copies
// @access  Private (Librarian)
exports.addBookCopy = asyncHandler(async (req, res, next) => {
  const { accessionNumber, barcode, condition, shelfLocation } = req.body;
  
  if (!accessionNumber) {
    return next(new AppError('Accession number is required', 400));
  }

  const bookExists = await Book.findById(req.params.bookId);
  if (!bookExists) {
    return next(new AppError('Book not found', 404));
  }

  const copyExists = await BookCopy.findOne({ accessionNumber });
  if (copyExists) {
    return next(new AppError('Accession number already in use', 400));
  }

  const newCopy = await BookCopy.create({
    book: req.params.bookId,
    accessionNumber,
    barcode: barcode || undefined,
    condition,
    shelfLocation,
    status: 'AVAILABLE'
  });

  res.status(201).json({
    success: true,
    data: newCopy
  });
});

// @desc    Update a book copy
// @route   PUT /api/books/copies/:id
// @access  Private (Librarian)
exports.updateBookCopy = asyncHandler(async (req, res, next) => {
  let copy = await BookCopy.findById(req.params.id);
  
  if (!copy) {
    return next(new AppError('Book copy not found', 404));
  }

  copy = await BookCopy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: copy
  });
});

// @desc    Delete a book copy
// @route   DELETE /api/books/copies/:id
// @access  Private (Librarian)
exports.deleteBookCopy = asyncHandler(async (req, res, next) => {
  const copy = await BookCopy.findById(req.params.id);
  
  if (!copy) {
    return next(new AppError('Book copy not found', 404));
  }

  if (copy.status === 'ISSUED') {
    return next(new AppError('Cannot delete a copy that is currently issued', 400));
  }

  await copy.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
