const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Book = require('./models/Book');
const BorrowTransaction = require('./models/BorrowTransaction');
const Review = require('./models/Review');
const Notification = require('./models/Notification');

// Connect to DB
if (!process.env.MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in your .env file!");
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI);

const generateAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

const users = [
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39a1'),
    name: 'Sarah Mitchell (Librarian)',
    email: 'admin@library.com',
    password: 'password123',
    phone: '555-0100',
    role: 'LIBRARIAN',
    avatar: generateAvatar('Sarah Mitchell')
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39a2'),
    name: 'David Chen',
    email: 'david.chen@example.com',
    password: 'password123',
    phone: '555-0101',
    role: 'USER',
    avatar: generateAvatar('David Chen')
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39a3'),
    name: 'Emily Watson',
    email: 'emily.w@example.com',
    password: 'password123',
    phone: '555-0102',
    role: 'USER',
    avatar: generateAvatar('Emily Watson')
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39a4'),
    name: 'Marcus Johnson',
    email: 'marcus.j@example.com',
    password: 'password123',
    phone: '555-0103',
    role: 'USER',
    avatar: generateAvatar('Marcus Johnson')
  }
];

const books = [
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39b1'),
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    isbn: '978-0465050659',
    publisher: 'Basic Books',
    category: 'Design',
    type: 'hybrid',
    totalCopies: 4,
    availableCopies: 2,
    digitalFileUrl: 'https://example.com/design-everyday.pdf',
    coverImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop',
    description: 'A primer on how and why some products satisfy customers while others only frustrate them.',
    averageRating: 4.5,
    numReviews: 2
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39b2'),
    title: 'Clean Architecture',
    author: 'Robert C. Martin',
    isbn: '978-0134494166',
    publisher: 'Prentice Hall',
    category: 'Computer Science',
    type: 'physical',
    totalCopies: 5,
    availableCopies: 5,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    description: 'A comprehensive guide to software architecture and design principles.',
    averageRating: 5.0,
    numReviews: 1
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39b3'),
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '978-0735211292',
    publisher: 'Avery',
    category: 'Self Help',
    type: 'hybrid',
    totalCopies: 10,
    availableCopies: 9,
    digitalFileUrl: 'https://example.com/atomic-habits.pdf',
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day.',
    averageRating: 0,
    numReviews: 0
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39b4'),
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0441172719',
    publisher: 'Ace Books',
    category: 'Fiction',
    type: 'physical',
    totalCopies: 3,
    availableCopies: 2,
    coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=600&auto=format&fit=crop',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.',
    averageRating: 4.0,
    numReviews: 1
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39b5'),
    title: 'Deep Work',
    author: 'Cal Newport',
    isbn: '978-1455586691',
    publisher: 'Grand Central Publishing',
    category: 'Productivity',
    type: 'digital',
    totalCopies: 0,
    availableCopies: 0,
    digitalFileUrl: 'https://example.com/deep-work.pdf',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop',
    description: 'Rules for focused success in a distracted world.',
    averageRating: 0,
    numReviews: 0
  }
];

// Helper to go back X days
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const transactions = [
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39c1'),
    user: users[1]._id,
    book: books[0]._id, // Design of Everyday Things
    status: 'RETURNED',
    issuedAt: daysAgo(20),
    dueDate: daysAgo(6),
    returnedAt: daysAgo(5),
    createdAt: daysAgo(20)
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39c2'),
    user: users[2]._id,
    book: books[0]._id, // Design of Everyday Things
    status: 'ISSUED',
    issuedAt: daysAgo(3),
    dueDate: daysAgo(-11), // Due in 11 days
    createdAt: daysAgo(4)
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39c3'),
    user: users[3]._id,
    book: books[3]._id, // Dune
    status: 'OVERDUE',
    issuedAt: daysAgo(18),
    dueDate: daysAgo(4), // Overdue by 4 days
    createdAt: daysAgo(19)
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ecb8b392d7001f3b39c4'),
    user: users[1]._id,
    book: books[2]._id, // Atomic Habits
    status: 'REQUESTED',
    createdAt: daysAgo(1)
  }
];

const reviews = [
  {
    user: users[1]._id,
    book: books[0]._id, // David reviewed Design of Everyday Things
    rating: 5,
    comment: 'Absolutely transformative. It completely changed how I look at everyday objects and interfaces. Highly recommend to any designer.',
    createdAt: daysAgo(5)
  },
  {
    user: users[2]._id,
    book: books[0]._id, // Emily reviewed Design of Everyday Things
    rating: 4,
    comment: 'Very insightful read. A bit academic in some chapters, but the core concepts are essential.',
    createdAt: daysAgo(2)
  },
  {
    user: users[3]._id,
    book: books[3]._id, // Marcus reviewed Dune (even though still issued)
    rating: 4,
    comment: 'Incredible world-building. The political intrigue is top notch.',
    createdAt: daysAgo(10)
  },
  {
    user: users[1]._id,
    book: books[1]._id, // David reviewed Clean Architecture
    rating: 5,
    comment: 'Uncle Bob does it again. Every developer should have this on their desk.',
    createdAt: daysAgo(30)
  }
];

const notifications = [
  {
    user: users[3]._id, // Marcus
    title: 'Book Overdue',
    message: 'Your borrowed book "Dune" is overdue. Please return it as soon as possible to avoid further fines.',
    isRead: false,
    type: 'WARNING',
    createdAt: daysAgo(4)
  },
  {
    user: users[1]._id, // David
    title: 'Request Received',
    message: 'Your request to borrow "Atomic Habits" has been received and is pending librarian approval.',
    isRead: true,
    type: 'INFO',
    createdAt: daysAgo(1)
  }
];

const importData = async () => {
  try {
    await User.deleteMany();
    await Book.deleteMany();
    await BorrowTransaction.deleteMany();
    await Review.deleteMany();
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
    await BorrowTransaction.insertMany(transactions);
    await Review.insertMany(reviews);
    await Notification.insertMany(notifications);

    console.log('Rich Demo Data Successfully Imported!');
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
    await Review.deleteMany();
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
