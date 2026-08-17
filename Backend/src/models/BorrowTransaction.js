const mongoose = require('mongoose');

const borrowTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  bookCopy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookCopy',
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  issuedAt: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  returnedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['REQUESTED', 'ISSUED', 'OVERDUE', 'RETURNED', 'REJECTED'],
    default: 'REQUESTED',
  },
  rejectionReason: {
    type: String,
  },
  fine: {
    type: Number,
    default: 0,
  },
  lateDays: {
    type: Number,
    default: 0,
  },
  fineRatePerDay: {
    type: Number,
    default: 0,
  },
  fineStatus: {
    type: String,
    enum: ['NONE', 'UNPAID', 'PAID'],
    default: 'NONE',
  },
  renewalsCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

const BorrowTransaction = mongoose.model('BorrowTransaction', borrowTransactionSchema);
module.exports = BorrowTransaction;
