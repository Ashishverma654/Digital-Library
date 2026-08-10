const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Book = require('./models/Book');
const BorrowTransaction = require('./models/BorrowTransaction');
const Notification = require('./models/Notification');

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/digital_library');

const users = [
  {
    name: 'Librarian Admin',
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
  }
];

const books = [
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    publisher: 'Prentice Hall',
    category: 'Computer Science',
    type: 'physical',
    totalCopies: 5,
    availableCopies: 5,
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
  },
  {
    title: 'The Pragmatic Programmer: Your Journey To Mastery',
    author: 'David Thomas, Andrew Hunt',
    isbn: '978-0135957059',
    publisher: 'Addison-Wesley Professional',
    category: 'Computer Science',
    type: 'physical',
    totalCopies: 3,
    availableCopies: 3,
    description: 'The Pragmatic Programmer is one of those rare tech books you\'ll read, re-read, and read again over the years.',
  },
  {
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    author: 'James Clear',
    isbn: '978-0735211292',
    publisher: 'Avery',
    category: 'Self Help',
    type: 'physical',
    totalCopies: 10,
    availableCopies: 10,
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day.',
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0441172719',
    publisher: 'Ace Books',
    category: 'Fiction',
    type: 'physical',
    totalCopies: 7,
    availableCopies: 7,
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.',
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0262033848',
    publisher: 'MIT Press',
    category: 'Computer Science',
    type: 'digital',
    totalCopies: 0,
    availableCopies: 0,
    digitalFileUrl: 'https://example.com/algorithms.pdf',
    description: 'A comprehensive update of the leading algorithms text, with new material on matchings in bipartite graphs, online algorithms, machine learning, and other topics.',
  }
];

const importData = async () => {
  try {
    await User.deleteMany();
    await Book.deleteMany();
    await BorrowTransaction.deleteMany();
    await Notification.deleteMany();

    console.log('Old data cleared...');

    // Hash passwords before seeding
    const hashedUsers = await Promise.all(users.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      return user;
    }));

    await User.insertMany(hashedUsers);
    await Book.insertMany(books);

    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(`Error with data import: ${err}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Book.deleteMany();
    await BorrowTransaction.deleteMany();
    await Notification.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(`Error with data destruction: ${err}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
