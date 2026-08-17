const mongoose = require('mongoose');

const bookCopySchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  accessionNumber: {
    type: String,
    required: true,
    unique: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'ISSUED', 'RESERVED', 'LOST', 'DAMAGED', 'MAINTENANCE'],
    default: 'AVAILABLE'
  },
  condition: {
    type: String,
    enum: ['NEW', 'GOOD', 'FAIR', 'POOR'],
    default: 'GOOD'
  },
  shelfLocation: {
    type: String,
  },
  currentBorrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
});

const BookCopy = mongoose.model('BookCopy', bookCopySchema);
module.exports = BookCopy;
