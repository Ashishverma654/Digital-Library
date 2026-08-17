const User = require('../models/User');
const Book = require('../models/Book');
const BorrowTransaction = require('../models/BorrowTransaction');
const asyncHandler = require('../utils/asyncHandler');
// @desc    Get overall library analytics
// @route   GET /api/admin/reports/analytics
// @access  Private (Admin)
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const totalStudents = await User.countDocuments({ role: 'STUDENT' });
  const totalLibrarians = await User.countDocuments({ role: 'LIBRARIAN' });
  const totalBooks = await Book.countDocuments();
  
  const BookCopy = require('../models/BookCopy');
  const totalBookCopies = await BookCopy.countDocuments();
  
  const transactions = await BorrowTransaction.find();
  
  let activeBorrows = 0;
  let overdueBooks = 0;
  let totalFines = 0;
  
  transactions.forEach(t => {
    if (t.status === 'ISSUED') {
      if (new Date() > new Date(t.dueDate)) {
        overdueBooks++;
      } else {
        activeBorrows++;
      }
    }
    if (t.status === 'OVERDUE') overdueBooks++;
    if (t.fineStatus === 'PAID') totalFines += t.fine;
  });

  res.status(200).json({
    success: true,
    data: {
      users: { students: totalStudents, librarians: totalLibrarians },
      inventory: { totalBooks, totalBookCopies },
      transactions: { activeBorrows, overdueBooks },
      finance: { totalFines }
    }
  });
});

// @desc    Export Overdue Books Report as CSV
// @route   GET /api/admin/reports/export/overdue
// @access  Private (Admin)
exports.exportOverdueReport = asyncHandler(async (req, res, next) => {
  const transactions = await BorrowTransaction.find({ status: { $in: ['ISSUED', 'OVERDUE'] } })
    .populate('user', 'name studentId email')
    .populate('book', 'title author');
  
  const overdue = transactions.filter(t => t.status === 'OVERDUE' || (new Date() > new Date(t.dueDate)));
  
  const data = overdue.map(t => ({
    StudentName: t.user?.name || 'Unknown',
    StudentID: t.user?.studentId || 'N/A',
    Email: t.user?.email || 'N/A',
    BookTitle: t.book?.title || 'Unknown',
    IssuedDate: new Date(t.issuedAt).toLocaleDateString(),
    DueDate: new Date(t.dueDate).toLocaleDateString(),
    Fine: t.fine || 0
  }));

  try {
    if (data.length === 0) return res.send('No overdue records');
    const header = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('overdue_report.csv');
    return res.send(header + rows);
  } catch (err) {
    return next(new AppError('Error generating CSV report', 500));
  }
});
