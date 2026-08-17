const BorrowTransaction = require('../models/BorrowTransaction');
const Book = require('../models/Book');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logActivity = require('../utils/activityLogger');

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
  const BookCopy = require('../models/BookCopy');
  const availableCount = await BookCopy.countDocuments({ book: bookId, status: 'AVAILABLE' });
  if (availableCount <= 0) {
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

  // 5. Check if user has any unpaid fines
  const unpaidFines = await BorrowTransaction.findOne({
    user: userId,
    fineStatus: 'UNPAID'
  });
  if (unpaidFines) {
    return next(new AppError('You cannot borrow new books while you have unpaid fines.', 403));
  }

  // 6. Check if user has any overdue books
  const overdueBooks = await BorrowTransaction.findOne({
    user: userId,
    status: 'OVERDUE'
  });
  // Also check dynamically if any 'ISSUED' book is past due
  const dynamicOverdue = await BorrowTransaction.findOne({
    user: userId,
    status: 'ISSUED',
    dueDate: { $lt: new Date() }
  });
  
  if (overdueBooks || dynamicOverdue) {
    return next(new AppError('You cannot borrow new books while you have overdue items.', 403));
  }

  // 7. Check max borrow limit from Settings
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  const activeCount = await BorrowTransaction.countDocuments({
    user: userId,
    status: { $in: ['REQUESTED', 'ISSUED', 'OVERDUE'] }
  });
  if (activeCount >= settings.maxBooksPerStudent) {
    return next(new AppError(`You have reached the maximum limit of ${settings.maxBooksPerStudent} active borrows/requests.`, 403));
  }

  // Create transaction
  const transaction = await BorrowTransaction.create({
    user: userId,
    book: bookId,
    status: 'REQUESTED'
  });

  await logActivity(req, req.user.id, 'BORROW_REQUEST', `Requested to borrow book: ${book.title}`, { resourceType: 'Book', resourceId: book._id });

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
    .populate('book', 'title type')
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
  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  // Find an available physical copy
  const BookCopy = require('../models/BookCopy');
  const availableCopy = await BookCopy.findOne({ book: book._id, status: 'AVAILABLE' });

  if (!availableCopy) {
    return next(new AppError('No physical copies available to issue', 400));
  }

  // Update Book Copy Status
  availableCopy.status = 'ISSUED';
  availableCopy.currentBorrower = transaction.user;
  await availableCopy.save();

  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  // Update Transaction
  const issuedAt = new Date();
  const dueDate = new Date(issuedAt.getTime() + settings.maxBorrowDays * 24 * 60 * 60 * 1000); 

  transaction.status = 'ISSUED';
  transaction.issuedAt = issuedAt;
  transaction.dueDate = dueDate;
  transaction.issuedBy = req.user.id;
  transaction.bookCopy = availableCopy._id;
  await transaction.save();

  await Notification.create({
    user: transaction.user,
    title: 'Borrow Request Approved',
    message: `Your request to borrow "${book.title}" has been approved. Due date is ${dueDate.toLocaleDateString()}.`,
    type: 'SUCCESS'
  });

  await logActivity(req, req.user.id, 'BORROW_APPROVE', `Approved borrow request for book ${book.title}`, { resourceType: 'BorrowTransaction', resourceId: transaction._id });

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

  await logActivity(req, req.user.id, 'BORROW_REJECT', `Rejected borrow request. Reason: ${transaction.rejectionReason}`, { resourceType: 'BorrowTransaction', resourceId: transaction._id });

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
  let lateDays = 0;

  // Calculate fine if overdue
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  if (returnedAt > transaction.dueDate) {
    const diffTime = Math.abs(returnedAt - transaction.dueDate);
    lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    fine = lateDays * settings.finePerDay;
    fineStatus = 'UNPAID';
  }

  transaction.returnedAt = returnedAt;
  transaction.status = 'RETURNED';
  transaction.fine = fine;
  transaction.lateDays = lateDays;
  transaction.fineRatePerDay = settings.finePerDay;
  transaction.fineStatus = fineStatus;

  await transaction.save();

  // Free up the BookCopy
  const BookCopy = require('../models/BookCopy');
  if (transaction.bookCopy) {
    const copy = await BookCopy.findById(transaction.bookCopy);
    if (copy) {
      copy.status = 'AVAILABLE';
      copy.currentBorrower = null;
      await copy.save();
    }
  }

  const book = await Book.findById(transaction.book);
  if (book) {
    // Check waitlist
    if (book.waitlist && book.waitlist.length > 0) {
      const notifications = book.waitlist.map(userId => ({
        user: userId,
        title: 'Waitlist Book Available',
        message: `The book "${book.title}" you waitlisted is now available! First come, first served.`,
        type: 'INFO'
      }));
      
      await Notification.insertMany(notifications);
      
      // Clear waitlist
      book.waitlist = [];
    }

    await book.save();
    
    await Notification.create({
      user: transaction.user,
      title: 'Book Returned',
      message: `You successfully returned "${book.title}".${fine > 0 ? ` A fine of ₹${fine} was added.` : ''}`,
      type: fine > 0 ? 'WARNING' : 'INFO'
    });
  }

  await logActivity(req, req.user.id, 'RETURN_BOOK', `Returned book ${book ? book.title : ''}`, { resourceType: 'BorrowTransaction', resourceId: transaction._id });

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

// @desc    Renew a book
// @route   PUT /api/transactions/:id/renew
// @access  Private (User)
exports.renewBook = asyncHandler(async (req, res, next) => {
  const transaction = await BorrowTransaction.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  if (transaction.status !== 'ISSUED') {
    return next(new AppError('Only active issued books can be renewed.', 400));
  }

  if (new Date() > new Date(transaction.dueDate)) {
    return next(new AppError('Cannot renew an overdue book. Please return it and pay any fines.', 400));
  }

  if (transaction.renewalsCount >= 1) {
    return next(new AppError('You have already reached the maximum number of renewals (1) for this book.', 400));
  }

  // Check if book has a waitlist
  const book = await Book.findById(transaction.book);
  if (book && book.waitlist && book.waitlist.length > 0) {
    return next(new AppError('Cannot renew book because there is a waitlist for it.', 400));
  }

  // Extend due date by 7 days
  const currentDueDate = new Date(transaction.dueDate);
  const newDueDate = new Date(currentDueDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  transaction.dueDate = newDueDate;
  transaction.renewalsCount += 1;
  await transaction.save();

  await Notification.create({
    user: req.user.id,
    title: 'Book Renewed',
    message: `You have successfully renewed "${book.title}". New due date is ${newDueDate.toLocaleDateString()}.`,
    type: 'SUCCESS'
  });

  res.status(200).json({
    success: true,
    message: 'Book renewed successfully',
    data: transaction
  });
});

// @desc    Return a book (Student)
// @route   PUT /api/transactions/:id/return
// @access  Private (User)
exports.studentReturnBook = asyncHandler(async (req, res, next) => {
  const transaction = await BorrowTransaction.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  if (transaction.status !== 'ISSUED' && transaction.status !== 'OVERDUE') {
    return next(new AppError(`Cannot return a book with status ${transaction.status}`, 400));
  }

  const book = await Book.findById(transaction.book);
  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  const returnedAt = new Date();
  let fine = 0;
  let fineStatus = 'NONE';
  let lateDays = 0;

  // Calculate fine if overdue
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  if (returnedAt > transaction.dueDate) {
    const diffTime = Math.abs(returnedAt - transaction.dueDate);
    lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    fine = lateDays * settings.finePerDay;
    fineStatus = 'UNPAID';
  }

  transaction.returnedAt = returnedAt;
  transaction.status = 'RETURNED';
  transaction.fine = fine;
  transaction.lateDays = lateDays;
  transaction.fineRatePerDay = settings.finePerDay;
  transaction.fineStatus = fineStatus;

  await transaction.save();

  // Free up the BookCopy
  const BookCopy = require('../models/BookCopy');
  if (transaction.bookCopy) {
    const copy = await BookCopy.findById(transaction.bookCopy);
    if (copy) {
      copy.status = 'AVAILABLE';
      copy.currentBorrower = null;
      await copy.save();
    }
  }

  // Check waitlist
  if (book.waitlist && book.waitlist.length > 0) {
    const notifications = book.waitlist.map(userId => ({
      user: userId,
      title: 'Waitlist Book Available',
      message: `The book "${book.title}" you waitlisted is now available! First come, first served.`,
      type: 'INFO'
    }));
    await Notification.insertMany(notifications);
    book.waitlist = [];
    await book.save();
  }
  
  await Notification.create({
    user: transaction.user,
    title: 'Book Returned',
    message: `You successfully returned "${book.title}".${fine > 0 ? ` A fine of ₹${fine} was added.` : ''}`,
    type: fine > 0 ? 'WARNING' : 'INFO'
  });

  await logActivity(req, req.user.id, 'RETURN_BOOK_STUDENT', `Student returned book ${book.title}`, { resourceType: 'BorrowTransaction', resourceId: transaction._id });

  res.status(200).json({
    success: true,
    message: 'Book returned successfully',
    data: transaction
  });
});

// @desc    Simulate paying a fine (Student)
// @route   PUT /api/transactions/:id/pay-fine
// @access  Private (User)
exports.payFineStudent = asyncHandler(async (req, res, next) => {
  const transaction = await BorrowTransaction.findOne({
    _id: req.params.id,
    user: req.user.id
  });

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
    title: 'Fine Paid Successfully',
    message: `Your payment of ₹${transaction.fine} was successful. Thank you!`,
    type: 'SUCCESS'
  });
  
  await logActivity(req, req.user.id, 'FINE_PAID_STUDENT', `Paid fine for transaction ${transaction._id}`, { resourceType: 'BorrowTransaction', resourceId: transaction._id });

  res.status(200).json({
    success: true,
    message: 'Fine paid successfully',
    data: transaction
  });
});

// @desc    Cancel requests older than 24 hours
// @route   POST /api/transactions/cancel-expired
// @access  Private (Admin, Librarian)
exports.cancelExpiredRequests = asyncHandler(async (req, res, next) => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const expiredTransactions = await BorrowTransaction.find({
    status: 'REQUESTED',
    requestedAt: { $lt: twentyFourHoursAgo }
  });

  const count = expiredTransactions.length;

  for (const transaction of expiredTransactions) {
    transaction.status = 'REJECTED';
    transaction.rejectionReason = 'Auto-cancelled: Not picked up within 24 hours';
    await transaction.save();

    await Notification.create({
      user: transaction.user,
      title: 'Borrow Request Cancelled',
      message: `Your request for a book has been cancelled because it was not picked up within 24 hours.`,
      type: 'WARNING'
    });
  }

  res.status(200).json({
    success: true,
    message: `Cancelled ${count} expired requests`,
    count
  });
});
