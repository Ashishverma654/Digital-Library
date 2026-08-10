const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all books (with search & filter)
// @route   GET /api/books
// @access  Public
exports.getBooks = asyncHandler(async (req, res, next) => {
  const { search, category, type, availability } = req.query;
    let query = {};

    // Search by title, author, or ISBN
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by availability
    if (availability === 'available') {
      query.$or = [
        { type: 'digital' },
        { availableCopies: { $gt: 0 } }
      ];
    } else if (availability === 'unavailable') {
      query.type = { $ne: 'digital' };
      query.availableCopies = { $lte: 0 };
    }

    let sortOption = { createdAt: -1 }; // Default to newest
    if (req.query.sort === 'popular') {
      // For now popular could just sort by title, later by averageRating
      sortOption = { title: 1 };
    }

  const books = await Book.find(query).sort(sortOption);

  res.status(200).json({
    success: true,
    count: books.length,
    data: books,
  });
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  res.status(200).json({
    success: true,
    data: book,
  });
});

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Librarian only)
exports.createBook = asyncHandler(async (req, res, next) => {
  const { title, author, isbn, publisher, category, description, type, totalCopies, coverImage, digitalFileUrl } = req.body;

  // Basic validation for physical/hybrid types
  if ((type === 'physical' || type === 'hybrid') && (totalCopies === undefined || totalCopies < 0)) {
    return next(new AppError('Valid total copies required for physical/hybrid books', 400));
  }

    // Set availableCopies equal to totalCopies initially for physical books
    let availableCopies = totalCopies || 0;

  const book = await Book.create({
    title, author, isbn, publisher, category, description, type, totalCopies, availableCopies, coverImage, digitalFileUrl
  });

  res.status(201).json({
    success: true,
    data: book,
  });
});

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Librarian only)
exports.updateBook = asyncHandler(async (req, res, next) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

    const { totalCopies } = req.body;
    
  // Validate that new total copies isn't less than currently issued copies
  if (totalCopies !== undefined && (book.type === 'physical' || book.type === 'hybrid')) {
    const issuedCopies = book.totalCopies - book.availableCopies;
    if (totalCopies < issuedCopies) {
      return next(new AppError(`Cannot reduce total copies below currently issued copies (${issuedCopies})`, 400));
    }
    // Update available copies based on new total
    req.body.availableCopies = totalCopies - issuedCopies;
  }

  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: book,
  });
});

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Librarian only)
exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // Check if copies are currently issued
  if ((book.type === 'physical' || book.type === 'hybrid') && book.availableCopies < book.totalCopies) {
    return next(new AppError('This book cannot be deleted because copies are currently issued.', 400));
  }

  await book.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Book removed',
  });
});

const Review = require('../models/Review');
const BorrowTransaction = require('../models/BorrowTransaction');

// @desc    Create new review
// @route   POST /api/books/:id/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const bookId = req.params.id;

  const book = await Book.findById(bookId);

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // Ensure the user has actually borrowed this book before (and returned it, or at least had it issued)
  const hasBorrowed = await BorrowTransaction.findOne({
    user: req.user.id,
    book: bookId,
    status: { $in: ['ISSUED', 'RETURNED', 'OVERDUE'] }
  });

  if (!hasBorrowed) {
    return next(new AppError('You can only review books you have borrowed', 400));
  }

  const alreadyReviewed = await Review.findOne({
    user: req.user.id,
    book: bookId
  });

  if (alreadyReviewed) {
    return next(new AppError('You have already reviewed this book', 400));
  }

  const review = await Review.create({
    user: req.user.id,
    book: bookId,
    rating: Number(rating),
    comment
  });

  // Calculate new average rating
  const reviews = await Review.find({ book: bookId });
  book.numReviews = reviews.length;
  book.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  await book.save();

  res.status(201).json({
    success: true,
    message: 'Review added'
  });
});

// @desc    Get reviews for a book
// @route   GET /api/books/:id/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ book: req.params.id }).populate('user', 'name');

  res.status(200).json({
    success: true,
    data: reviews
  });
});

// @desc    Get digital file URL for reading
// @route   GET /api/books/:id/read
// @access  Private
exports.getDigitalContent = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  if (book.type === 'physical') {
    return next(new AppError('This is a physical book and cannot be read online', 400));
  }

  // If hybrid, ensure the user has currently borrowed it
  if (book.type === 'hybrid' && req.user.role === 'USER') {
    const activeBorrow = await BorrowTransaction.findOne({
      user: req.user.id,
      book: book._id,
      status: { $in: ['ISSUED', 'OVERDUE'] }
    });

    if (!activeBorrow) {
      return next(new AppError('You must borrow this hybrid book before reading its digital content', 403));
    }
  }

  if (!book.digitalFileUrl) {
    return next(new AppError('No digital content available for this book', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      digitalFileUrl: book.digitalFileUrl
    }
  });
});
