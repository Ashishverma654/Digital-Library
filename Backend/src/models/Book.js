const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
  },
  publisher: {
    type: String,
    trim: true,
  },
  edition: {
    type: String,
    trim: true,
  },
  publicationYear: {
    type: Number,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  language: {
    type: String,
    default: 'English',
    trim: true,
  },
  description: {
    type: String,
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg',
  },
  type: {
    type: String,
    enum: ['physical', 'digital', 'hybrid'],
    required: [true, 'Book type is required'],
  },
  digitalFileUrl: {
    type: String,
    required: function() { return this.type === 'digital' || this.type === 'hybrid'; }
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  waitlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
