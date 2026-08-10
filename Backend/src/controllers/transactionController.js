const BorrowTransaction = require('../models/BorrowTransaction');
const Book = require('../models/Book');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Request a book
// @route   POST /api/transactions/request
// @access  Private
exports.requestBook = asyncHandler(async (req, res, next) => {
  const { bookId } = req.body;
    const userId = req.user.id;

  // 1. Verify book exists
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // 2. Verify book is borrowable (not digital only for now, per simple V1 logic)
  if (book.type === 'digital') {
    return next(new AppError('Digital books do not require borrowing requests.', 400));
  }

  // 3. Verify book has available copies
  if (book.availableCopies <= 0) {
    return next(new AppError('Book is currently unavailable', 400));
  }

  // 4. Verify user doesn't already have an active transaction or pending request for this book
  const existingTransaction = await BorrowTransaction.findOne({
    user: userId,
    book: bookId,
    status: { $in: ['REQUESTED', 'ISSUED', 'OVERDUE'] }
  });

  if (existingTransaction) {
    return next(new AppError('You already have an active request or have borrowed this book.', 400));
  }

  // Create transaction
  const transaction = await BorrowTransaction.create({
    user: userId,
    book: bookId,
    status: 'REQUESTED'
  });

  res.status(201).json({
    success: true,
    message: 'Borrow request created successfully',
    data: transaction,
  });
});

// @desc    Get user's transactions
// @route   GET /api/transactions/my
// @access  Private
exports.getMyTransactions = asyncHandler(async (req, res, next) => {
  const transactions = await BorrowTransaction.find({ user: req.user.id })
    .populate('book', 'title author coverImage type')
    .sort({ requestedAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions,
  });
});

// @desc    Get all transactions for librarian
// @route   GET /api/librarian/transactions
// @access  Private (Librarian)
exports.getAllTransactions = asyncHandler(async (req, res, next) => {
  const transactions = await BorrowTransaction.find()
    .populate('user', 'name email')
    .populate('book', 'title availableCopies type')
    .sort({ requestedAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions,
  });
});

// @desc    Approve a request
// @route   PUT /api/librarian/transactions/:id/approve
// @access  Private (Librarian)
exports.approveRequest = asyncHandler(async (req, res, next) => {
  const transactionId = req.params.id;
    
  // Use session for transaction atomicity (ideal), but for V1 simple approach:
  const transaction = await BorrowTransaction.findById(transactionId);

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  if (transaction.status !== 'REQUESTED') {
    return next(new AppError(`Cannot approve a transaction with status ${transaction.status}`, 400));
  }

  const book = await Book.findById(transaction.book);
  
  if (book.availableCopies <= 0) {
    return next(new AppError('No copies available to issue', 400));
  }

  // Update Book
  book.availableCopies -= 1;
  await book.save();

  // Update Transaction
  const issuedAt = new Date();
  // 14 days borrowing period
  const dueDate = new Date(issuedAt.getTime() + 14 * 24 * 60 * 60 * 1000); 

  transaction.status = 'ISSUED';
  transaction.issuedAt = issuedAt;
  transaction.dueDate = dueDate;
  transaction.issuedBy = req.user.id;
  await transaction.save();

  await Notification.create({
    user: transaction.user,
    title: 'Borrow Request Approved',
    message: `Your request to borrow "${book.title}" has been approved. Due date is ${dueDate.toLocaleDateString()}.`,
    type: 'SUCCESS'
  });

  res.status(200).json({
    success: true,
    message: 'Request approved and book issued successfully',
    data: transaction
  });
});

// @desc    Reject a request
// @route   PUT /api/librarian/transactions/:id/reject
// @access  Private (Librarian)
exports.rejectRequest = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const transaction = await BorrowTransaction.findById(req.params.id);

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  if (transaction.status !== 'REQUESTED') {
    return next(new AppError(`Cannot reject a transaction with status ${transaction.status}`, 400));
  }

  transaction.status = 'REJECTED';
  transaction.rejectionReason = reason || 'No reason provided';
  await transaction.save();

  await Notification.create({
    user: transaction.user,
    title: 'Borrow Request Rejected',
    message: `Your request for a book has been rejected. Reason: ${transaction.rejectionReason}`,
    type: 'ERROR'
  });

  res.status(200).json({
    success: true,
    message: 'Request rejected successfully',
    data: transaction
  });
});

// @desc    Confirm return of a book
// @route   PUT /api/librarian/transactions/:id/return
// @access  Private (Librarian)
exports.returnBook = asyncHandler(async (req, res, next) => {
  const transaction = await BorrowTransaction.findById(req.params.id);

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  if (transaction.status !== 'ISSUED' && transaction.status !== 'OVERDUE') {
    return next(new AppError(`Cannot return a book with status ${transaction.status}`, 400));
  }

  const returnedAt = new Date();
  let fine = 0;
  let fineStatus = 'NONE';

  // Calculate fine if overdue
  if (returnedAt > transaction.dueDate) {
    const diffTime = Math.abs(returnedAt - transaction.dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const finePerDay = process.env.FINE_PER_DAY || 10;
    fine = diffDays * finePerDay;
    fineStatus = 'UNPAID';
  }

  transaction.returnedAt = returnedAt;
  transaction.status = 'RETURNED';
  transaction.fine = fine;
  transaction.fineStatus = fineStatus;

  await transaction.save();

  // Increase available copies
  const book = await Book.findById(transaction.book);
  if (book) {
    book.availableCopies += 1;
    await book.save();
    
    await Notification.create({
      user: transaction.user,
      title: 'Book Returned',
      message: `You successfully returned "${book.title}".${fine > 0 ? ` A fine of ₹${fine} was added.` : ''}`,
      type: fine > 0 ? 'WARNING' : 'INFO'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Book returned successfully',
    data: transaction
  });
});

// @desc    Mark a fine as paid
// @route   PUT /api/librarian/transactions/:id/fine-paid
// @access  Private (Librarian)
exports.markFinePaid = asyncHandler(async (req, res, next) => {
  const transaction = await BorrowTransaction.findById(req.params.id);

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  if (transaction.fineStatus !== 'UNPAID') {
    return next(new AppError('This transaction does not have an unpaid fine.', 400));
  }

  transaction.fineStatus = 'PAID';
  await transaction.save();

  await Notification.create({
    user: transaction.user,
    title: 'Fine Paid',
    message: `Your fine of ₹${transaction.fine} has been successfully marked as paid.`,
    type: 'SUCCESS'
  });

  res.status(200).json({
    success: true,
    message: 'Fine marked as paid successfully',
    data: transaction
  });
});
