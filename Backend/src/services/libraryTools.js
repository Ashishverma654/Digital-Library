const Book = require('../models/Book');
const BorrowTransaction = require('../models/BorrowTransaction');
const BookCopy = require('../models/BookCopy');

const tools = {
  searchBooks: async ({ query, category }) => {
    let filter = {};
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ];
    }
    if (category) filter.category = { $regex: category, $options: 'i' };
    
    const books = await Book.find(filter).limit(5).lean();
    return books.map(b => ({ id: b._id, title: b.title, author: b.author, category: b.category }));
  },
  
  checkBookAvailability: async ({ bookId }) => {
    const book = await Book.findById(bookId).lean();
    if (!book) return { error: "Book not found" };
    
    const availableCopies = await BookCopy.countDocuments({ book: bookId, status: 'AVAILABLE' });
    return { title: book.title, availableCopies };
  },
  
  getMyBorrowedBooks: async ({ userId }) => {
    const transactions = await BorrowTransaction.find({ 
      user: userId, 
      status: { $in: ['ISSUED', 'OVERDUE'] } 
    }).populate('book', 'title author').lean();
    
    return transactions.map(t => ({
      title: t.book?.title,
      dueDate: t.dueDate,
      status: t.status,
      fine: t.fine
    }));
  },
  
  getMyFines: async ({ userId }) => {
    const transactions = await BorrowTransaction.find({ 
      user: userId, 
      fineStatus: 'UNPAID' 
    }).populate('book', 'title').lean();
    
    const totalFine = transactions.reduce((acc, t) => acc + t.fine, 0);
    return {
      totalFine,
      fines: transactions.map(t => ({ title: t.book?.title, amount: t.fine }))
    };
  }
};

const toolDeclarations = [
  {
    name: "searchBooks",
    description: "Search for books in the library by title, author, or category.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Search query for title or author" },
        category: { type: "STRING", description: "Book category/subject" }
      }
    }
  },
  {
    name: "checkBookAvailability",
    description: "Check how many copies of a specific book are currently available to borrow.",
    parameters: {
      type: "OBJECT",
      properties: {
        bookId: { type: "STRING", description: "The ID of the book" }
      },
      required: ["bookId"]
    }
  },
  {
    name: "getMyBorrowedBooks",
    description: "Get a list of books currently borrowed by the user, including due dates.",
    parameters: {
      type: "OBJECT",
      properties: {} // userId is injected automatically by the server
    }
  },
  {
    name: "getMyFines",
    description: "Get a summary of unpaid fines for the user.",
    parameters: {
      type: "OBJECT",
      properties: {} 
    }
  }
];

module.exports = { tools, toolDeclarations };
