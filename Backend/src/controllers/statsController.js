const User = require('../models/User');
const Book = require('../models/Book');
const BorrowTransaction = require('../models/BorrowTransaction');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get system statistics for librarian dashboard
// @route   GET /api/librarian/stats
// @access  Private (Librarian)
exports.getSystemStats = asyncHandler(async (req, res, next) => {
  // Basic counts
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalBooks = await Book.countDocuments();
    
    // Transaction stats
    const transactions = await BorrowTransaction.find();
    
    let pendingRequests = 0;
    let activeIssued = 0;
    let overdueCount = 0;
    let totalFinesCollected = 0;
    let totalUnpaidFines = 0;

    transactions.forEach(t => {
      if (t.status === 'REQUESTED') pendingRequests++;
      if (t.status === 'ISSUED') {
        if (new Date() > new Date(t.dueDate)) {
          overdueCount++;
        } else {
          activeIssued++;
        }
      }
      if (t.status === 'OVERDUE') overdueCount++;
      
      if (t.fine > 0) {
        if (t.fineStatus === 'PAID') totalFinesCollected += t.fine;
        if (t.fineStatus === 'UNPAID') totalUnpaidFines += t.fine;
      }
    });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalBooks,
      pendingRequests,
      activeIssued,
      overdueCount,
      totalFinesCollected,
      totalUnpaidFines
    },
  });
});
