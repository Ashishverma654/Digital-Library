const Book = require('../models/Book');
const BorrowTransaction = require('../models/BorrowTransaction');
const BookCopy = require('../models/BookCopy');
const User = require('../models/User');

const tools = {
  // --- Public / Student Tools ---
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
  },

  // --- Librarian & Admin Tools ---
  getLibraryStats: async () => {
    const totalUsers = await User.countDocuments();
    const activeLoans = await BorrowTransaction.countDocuments({ status: { $in: ['ISSUED', 'OVERDUE'] } });
    const totalBooks = await Book.countDocuments();
    return {
      totalUsers,
      totalBooks,
      activeLoans
    };
  },

  searchUsers: async ({ query }) => {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email role status studentId phone').limit(5).lean();
    
    return users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      studentId: u.studentId
    }));
  },

  getStudentBorrowedBooks: async ({ targetUserEmail }) => {
    const user = await User.findOne({ email: targetUserEmail }).lean();
    if (!user) return { error: "User not found" };

    const transactions = await BorrowTransaction.find({ 
      user: user._id, 
      status: { $in: ['ISSUED', 'OVERDUE'] } 
    }).populate('book', 'title').lean();
    
    return {
      studentName: user.name,
      email: user.email,
      borrowedCount: transactions.length,
      books: transactions.map(t => ({ title: t.book?.title, dueDate: t.dueDate, status: t.status }))
    };
  },

  manageAccountStatus: async ({ userEmail, newStatus }) => {
    if (!['ACTIVE', 'SUSPENDED'].includes(newStatus)) {
      return { error: "Invalid status. Must be ACTIVE or SUSPENDED." };
    }
    
    const user = await User.findOne({ email: userEmail });
    if (!user) return { error: "User not found" };
    
    if (user.role === 'ADMIN') {
      return { error: "Cannot modify an ADMIN account via chat." };
    }
    
    user.status = newStatus;
    await user.save();
    
    return { success: true, message: `User ${user.email} status is now ${newStatus}` };
  },

  createUser: async ({ name, email, phone, role = 'STUDENT' }) => {
    try {
      const existing = await User.findOne({ email });
      if (existing) return { error: "User with this email already exists." };

      const newUser = await User.create({
        name,
        email,
        phone,
        role,
        password: "password123", // Default password
        status: 'ACTIVE'
      });
      return { success: true, message: `Created ${role} account for ${name} (${email}). Default password is password123.` };
    } catch (err) {
      return { error: `Failed to create user: ${err.message}` };
    }
  },

  addBooksBulk: async ({ books }) => {
    try {
      let added = 0;
      for (const bookData of books) {
        // Prevent duplicate ISBNs
        const existing = await Book.findOne({ isbn: bookData.isbn });
        if (existing) continue;

        const newBook = await Book.create({
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn,
          category: bookData.category,
          type: bookData.type || 'physical',
          publisher: bookData.publisher || '',
          publicationYear: bookData.publicationYear || new Date().getFullYear(),
        });
        
        // Generate copies
        const copies = parseInt(bookData.totalCopies || 1, 10);
        if (newBook.type === 'physical') {
          for (let i = 0; i < copies; i++) {
            await BookCopy.create({
              book: newBook._id,
              accessionNumber: `ACC-${newBook.isbn}-${Date.now()}-${i}`
            });
          }
        }
        added++;
      }
      return { success: true, message: `Successfully added ${added} new books to the library database.` };
    } catch (err) {
      return { error: `Bulk add failed: ${err.message}` };
    }
  },

  removeBooksBulk: async ({ isbns }) => {
    try {
      let removed = 0;
      for (const isbn of isbns) {
        const book = await Book.findOne({ isbn });
        if (book) {
          // Remove all copies first
          await BookCopy.deleteMany({ book: book._id });
          await Book.deleteOne({ _id: book._id });
          removed++;
        }
      }
      return { success: true, message: `Successfully removed ${removed} books from the database.` };
    } catch (err) {
      return { error: `Bulk remove failed: ${err.message}` };
    }
  }
};

const toolDeclarations = [
  {
    name: "searchBooks",
    description: "Search for books in the library by title, author, or category.",
    allowedRoles: ['STUDENT', 'LIBRARIAN', 'ADMIN'],
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
    allowedRoles: ['STUDENT', 'LIBRARIAN', 'ADMIN'],
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
    allowedRoles: ['STUDENT', 'LIBRARIAN', 'ADMIN'],
    parameters: {
      type: "OBJECT",
      properties: {} 
    }
  },
  {
    name: "getMyFines",
    description: "Get a summary of unpaid fines for the user.",
    allowedRoles: ['STUDENT', 'LIBRARIAN', 'ADMIN'],
    parameters: {
      type: "OBJECT",
      properties: {} 
    }
  },
  // --- Librarian & Admin Tools ---
  {
    name: "getLibraryStats",
    description: "Get general library statistics like total users, total books, and active loans.",
    allowedRoles: ['LIBRARIAN', 'ADMIN'],
    parameters: {
      type: "OBJECT",
      properties: {} 
    }
  },
  {
    name: "searchUsers",
    description: "Search for users (students) in the system by name or email.",
    allowedRoles: ['LIBRARIAN', 'ADMIN'],
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Name or email to search for" }
      },
      required: ["query"]
    }
  },
  {
    name: "getStudentBorrowedBooks",
    description: "View the list of books currently borrowed by a specific student.",
    allowedRoles: ['LIBRARIAN', 'ADMIN'],
    parameters: {
      type: "OBJECT",
      properties: {
        targetUserEmail: { type: "STRING", description: "Email address of the student" }
      },
      required: ["targetUserEmail"]
    }
  },
  {
    name: "manageAccountStatus",
    description: "Suspend or reactivate a user account.",
    allowedRoles: ['LIBRARIAN', 'ADMIN'],
    parameters: {
      type: "OBJECT",
      properties: {
        userEmail: { type: "STRING", description: "Email address of the user to modify" },
        newStatus: { type: "STRING", description: "The new status, either 'ACTIVE' or 'SUSPENDED'" }
      },
      required: ["userEmail", "newStatus"]
    }
  },
  {
    name: "createUser",
    description: "Create a new user account in the system.",
    allowedRoles: ['LIBRARIAN', 'ADMIN'],
    parameters: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Full name of the user" },
        email: { type: "STRING", description: "Email address" },
        phone: { type: "STRING", description: "Phone number" },
        role: { type: "STRING", description: "Role of the user, typically 'STUDENT' or 'LIBRARIAN'" }
      },
      required: ["name", "email", "phone"]
    }
  },
  {
    name: "addBooksBulk",
    description: "Add multiple books to the database, usually parsed from an uploaded Excel file.",
    allowedRoles: ['LIBRARIAN', 'ADMIN'],
    parameters: {
      type: "OBJECT",
      properties: {
        books: {
          type: "ARRAY",
          description: "List of books to add",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              author: { type: "STRING" },
              isbn: { type: "STRING" },
              category: { type: "STRING" },
              type: { type: "STRING", description: "physical, digital, or hybrid" },
              totalCopies: { type: "NUMBER" }
            }
          }
        }
      },
      required: ["books"]
    }
  },
  {
    name: "removeBooksBulk",
    description: "Remove multiple books from the database using their ISBNs, usually parsed from an uploaded Excel file.",
    allowedRoles: ['LIBRARIAN', 'ADMIN'],
    parameters: {
      type: "OBJECT",
      properties: {
        isbns: {
          type: "ARRAY",
          description: "List of ISBNs to remove",
          items: { type: "STRING" }
        }
      },
      required: ["isbns"]
    }
  }
];

module.exports = { tools, toolDeclarations };
