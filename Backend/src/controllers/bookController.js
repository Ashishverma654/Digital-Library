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

  const books = await Book.find(query).sort({ createdAt: -1 });

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
