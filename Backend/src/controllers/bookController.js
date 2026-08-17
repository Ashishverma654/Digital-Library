const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all books (with search & filter)
// @route   GET /api/books
// @access  Public
exports.getBooks = asyncHandler(async (req, res, next) => {
  const { search, category, type, availability } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (type) {
    query.type = type;
  }

  let sortOption = { createdAt: -1 }; 
  if (req.query.sort === 'popular') {
    sortOption = { title: 1 };
  }

  let books = await Book.find(query).sort(sortOption).lean();

  const BookCopy = require('../models/BookCopy');
  
  // Attach totalCopies and availableCopies dynamically
  for (let book of books) {
    if (book.type === 'physical' || book.type === 'hybrid') {
      const copies = await BookCopy.find({ book: book._id });
      book.totalCopies = copies.length;
      book.availableCopies = copies.filter(c => c.status === 'AVAILABLE').length;
    } else {
      book.totalCopies = 1;
      book.availableCopies = 1;
    }
  }

  // Filter by availability post-query
  if (availability === 'available') {
    books = books.filter(b => b.type === 'digital' || b.availableCopies > 0);
  } else if (availability === 'unavailable') {
    books = books.filter(b => b.type !== 'digital' && b.availableCopies <= 0);
  }

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
  let book = await Book.findById(req.params.id).lean();

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  const BookCopy = require('../models/BookCopy');
  
  if (book.type === 'physical' || book.type === 'hybrid') {
    const copies = await BookCopy.find({ book: book._id });
    book.totalCopies = copies.length;
    book.availableCopies = copies.filter(c => c.status === 'AVAILABLE').length;
  } else {
    book.totalCopies = 1;
    book.availableCopies = 1;
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
  const { title, author, isbn, publisher, category, description, type, coverImage, digitalFileUrl, edition, publicationYear, language } = req.body;

  const book = await Book.create({
    title, author, isbn, publisher, category, description, type, coverImage, digitalFileUrl, edition, publicationYear, language
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
  const BookCopy = require('../models/BookCopy');
  const issuedCopiesCount = await BookCopy.countDocuments({ book: book._id, status: 'ISSUED' });
  if (issuedCopiesCount > 0) {
    return next(new AppError('This book cannot be deleted because copies are currently issued.', 400));
  }

  // Delete associated copies
  await BookCopy.deleteMany({ book: book._id });

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
  if (book.type === 'hybrid' && req.user.role === 'STUDENT') {
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

// @desc    Join waitlist for a book
// @route   POST /api/books/:id/waitlist
// @access  Private (User)
exports.joinWaitlist = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  const BookCopy = require('../models/BookCopy');
  const availableCopiesCount = await BookCopy.countDocuments({ book: book._id, status: 'AVAILABLE' });

  if (book.type === 'digital' || availableCopiesCount > 0) {
    return next(new AppError('You can only waitlist physical/hybrid books that are currently out of stock.', 400));
  }

  if (book.waitlist.includes(req.user.id)) {
    return next(new AppError('You are already on the waitlist for this book.', 400));
  }

  book.waitlist.push(req.user.id);
  await book.save();

  res.status(200).json({
    success: true,
    message: 'Successfully joined the waitlist. You will be notified when a copy becomes available.'
  });
});

// @desc    Get recommended books for a user
// @route   GET /api/books/recommended
// @access  Private
exports.getRecommendedBooks = asyncHandler(async (req, res, next) => {
  const transactions = await BorrowTransaction.find({ user: req.user.id }).populate('book');
  
  let recommendedBooks = [];

  if (transactions.length > 0) {
    // Find favorite category
    const categoryCounts = {};
    transactions.forEach(t => {
      if (t.book && t.book.category) {
        categoryCounts[t.book.category] = (categoryCounts[t.book.category] || 0) + 1;
      }
    });

    let favoriteCategory = null;
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = cat;
      }
    }

    if (favoriteCategory) {
      recommendedBooks = await Book.find({ category: favoriteCategory })
        .sort({ averageRating: -1 })
        .limit(4)
        .lean();
    }
  }

  // Fallback to popular books if no recommendations found
  if (recommendedBooks.length === 0) {
    recommendedBooks = await Book.find()
      .sort({ averageRating: -1, numReviews: -1 })
      .limit(4)
      .lean();
  }

  res.status(200).json({
    success: true,
    data: recommendedBooks
  });
});
