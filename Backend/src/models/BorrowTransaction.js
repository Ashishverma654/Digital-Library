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
  fineStatus: {
    type: String,
    enum: ['NONE', 'UNPAID', 'PAID'],
    default: 'NONE',
  }
}, {
  timestamps: true,
});

const BorrowTransaction = mongoose.model('BorrowTransaction', borrowTransactionSchema);
module.exports = BorrowTransaction;
