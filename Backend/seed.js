const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./src/models/User');
const Book = require('./src/models/Book');
const BorrowTransaction = require('./src/models/BorrowTransaction');

// Dummy Data
const users = [
  {
    name: 'Admin Librarian',
    email: 'admin@library.com',
    password: 'password123',
    phone: '1234567890',
    role: 'LIBRARIAN',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '0987654321',
    role: 'USER',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '1122334455',
    role: 'USER',
  }
];

const books = [
  {
    title: 'The Philosophy of Glass',
    author: 'Elena Rostova',
    isbn: '978-3-16-148410-0',
    publisher: 'TechPress',
    category: 'Design',
    description: 'A deep dive into transparent UI patterns and structural clarity in modern digital architecture.',
    type: 'hybrid',
    totalCopies: 5,
    availableCopies: 3,
    digitalFileUrl: 'https://example.com/philosophy-of-glass.pdf'
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0-13-235088-4',
    publisher: 'Prentice Hall',
    category: 'Technology',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
    type: 'physical',
    totalCopies: 10,
    availableCopies: 8
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt, David Thomas',
    isbn: '978-0-201-61622-4',
    publisher: 'Addison-Wesley Professional',
    category: 'Technology',
    description: 'Straight from the programming trenches, The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development.',
    type: 'hybrid',
    totalCopies: 3,
    availableCopies: 1,
    digitalFileUrl: 'https://example.com/pragmatic-programmer.pdf'
  },
  {
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '978-0-201-63361-0',
    publisher: 'Addison-Wesley',
    category: 'Technology',
    description: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions.',
    type: 'physical',
    totalCopies: 2,
    availableCopies: 0 // Fully checked out
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0-441-17271-9',
    publisher: 'Chilton Books',
    category: 'Science Fiction',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
    type: 'physical',
    totalCopies: 7,
    availableCopies: 6
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    publisher: 'Scribner',
    category: 'Fiction',
    description: 'A novel about the American dream, following a cast of characters living in the fictional towns of West Egg and East Egg on prosperous Long Island in the summer of 1922.',
    type: 'digital',
    totalCopies: 0,
    availableCopies: 0,
    digitalFileUrl: 'https://example.com/great-gatsby.pdf'
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Clear existing data
    await User.deleteMany();
    await Book.deleteMany();
    await BorrowTransaction.deleteMany();
    console.log('Data Cleared!');

    // Insert Users
    const createdUsers = [];
    for (const u of users) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log('Users added');

    const librarian = createdUsers[0];
    const user1 = createdUsers[1];
    const user2 = createdUsers[2];

    // Insert Books
    const createdBooks = await Book.insertMany(books);
    console.log('Books added');

    // Create Transactions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const transactions = [
      {
        user: user1._id,
        book: createdBooks[0]._id, 
        status: 'REQUESTED',
        requestedAt: new Date()
      },
      {
        user: user1._id,
        book: createdBooks[1]._id, 
        status: 'ISSUED',
        issuedBy: librarian._id,
        requestedAt: threeDaysAgo,
        issuedAt: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) 
      },
      {
        user: user2._id,
        book: createdBooks[3]._id, 
        status: 'OVERDUE',
        issuedBy: librarian._id,
        requestedAt: twoWeeksAgo,
        issuedAt: twoWeeksAgo,
        dueDate: oneWeekAgo, 
        fine: 50,
        fineStatus: 'UNPAID'
      },
      {
        user: user2._id,
        book: createdBooks[4]._id, 
        status: 'RETURNED',
        issuedBy: librarian._id,
        requestedAt: twoWeeksAgo,
        issuedAt: twoWeeksAgo,
        dueDate: oneWeekAgo,
        returnedAt: threeDaysAgo
      },
      {
        user: user2._id,
        book: createdBooks[2]._id, 
        status: 'REQUESTED',
        requestedAt: new Date()
      }
    ];

    await BorrowTransaction.insertMany(transactions);
    console.log('Transactions added');

    console.log('Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
