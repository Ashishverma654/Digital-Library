require('dotenv').config({ path: '../.env' }); // or from root
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const User = require('./models/User');
const Department = require('./models/Department');
const Course = require('./models/Course');
const Book = require('./models/Book');
const BookCopy = require('./models/BookCopy');
const BorrowTransaction = require('./models/BorrowTransaction');

// Sample real book data
const realisticBooks = [
  {
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    author: 'David Thomas, Andrew Hunt',
    isbn: '978-0135957059',
    publisher: 'Addison-Wesley Professional',
    edition: '20th Anniversary Edition',
    publicationYear: 2019,
    category: 'Computer Science',
    language: 'English',
    description: 'The Pragmatic Programmer is one of those rare tech books you’ll read, re-read, and read again over the years. Whether you’re new to the field or an experienced practitioner, you’ll come away with fresh insights each and every time.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80',
    type: 'physical',
  },
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    publisher: 'Prentice Hall',
    edition: '1st Edition',
    publicationYear: 2008,
    category: 'Software Engineering',
    language: 'English',
    description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn’t have to be that way.',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80',
    type: 'hybrid',
    digitalFileUrl: 'https://example.com/clean-code.pdf'
  },
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    publisher: 'O\'Reilly Media',
    edition: '1st Edition',
    publicationYear: 2017,
    category: 'Computer Science',
    language: 'English',
    description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. In addition, we have an overwhelming variety of tools...',
    coverImage: 'https://images.unsplash.com/photo-1555662100-6d224b105d15?auto=format&fit=crop&q=80',
    type: 'physical',
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0441172719',
    publisher: 'Ace Books',
    edition: '50th Anniversary Edition',
    publicationYear: 1965,
    category: 'Science Fiction',
    language: 'English',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange, a drug capable of extending life and enhancing consciousness.',
    coverImage: 'https://images.unsplash.com/photo-1614728263694-2c01b17a0210?auto=format&fit=crop&q=80',
    type: 'physical',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    isbn: '978-0374533557',
    publisher: 'Farrar, Straus and Giroux',
    edition: '1st Edition',
    publicationYear: 2011,
    category: 'Psychology',
    language: 'English',
    description: 'The phenomenal New York Times Bestseller by Nobel Prize winner Daniel Kahneman. The engaging, mind-expanding book that explains the two systems that drive the way we think: System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.',
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80',
    type: 'hybrid',
    digitalFileUrl: 'https://example.com/thinking-fast-slow.pdf'
  }
];

const seedDatabase = async () => {
  try {
    // 1. Connect
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/digital_library';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for Seeding...');

    // 2. Ensure Departments exist
    const departments = ['Computer Science', 'Engineering', 'Psychology', 'Literature'];
    const deptIds = [];
    for (const name of departments) {
      let dept = await Department.findOne({ name });
      if (!dept) {
        dept = await Department.create({
          name,
          code: name.substring(0, 3).toUpperCase(),
          description: `Department of ${name} Sciences`
        });
        console.log(`Created Department: ${name}`);
      }
      deptIds.push(dept._id);
    }

    // 3. Ensure Courses exist
    const courses = ['B.Tech CS', 'B.Tech IT', 'B.A Psychology', 'M.A English'];
    const courseIds = [];
    for (let i = 0; i < courses.length; i++) {
      let course = await Course.findOne({ name: courses[i] });
      if (!course) {
        course = await Course.create({
          name: courses[i],
          code: courses[i].replace(/\s+/g, '').toUpperCase(),
          department: deptIds[i % deptIds.length],
          durationYears: 4
        });
        console.log(`Created Course: ${courses[i]}`);
      }
      courseIds.push(course._id);
    }

    // 4. Update existing Users (Admins, Librarians, Students)
    const users = await User.find({});
    console.log(`Found ${users.length} users to update.`);
    for (let user of users) {
      if (user.role === 'USER') user.role = 'STUDENT';
      
      user.phone = user.phone || faker.phone.number({ style: 'national' });
      user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
      
      if (user.role === 'STUDENT') {
        user.studentId = user.studentId || `STU${faker.string.numeric(6)}`;
        if (!user.department) user.department = faker.helpers.arrayElement(deptIds);
        if (!user.course) user.course = faker.helpers.arrayElement(courseIds);
        if (!user.yearEnrolled) user.yearEnrolled = faker.helpers.arrayElement([2020, 2021, 2022, 2023, 2024]);
        if (!user.section) user.section = faker.helpers.arrayElement(['A', 'B', 'C']);
      }
      await user.save();
    }
    console.log('All existing users have been enriched with full realistic data.');

    // 5. Insert Books & Copies
    const insertedBooks = [];
    for (const bookData of realisticBooks) {
      let book = await Book.findOne({ isbn: bookData.isbn });
      if (!book) {
        book = await Book.create({
          ...bookData,
          totalCopies: 0,
          availableCopies: 0
        });
        console.log(`Created Book: ${book.title}`);
      }
      insertedBooks.push(book);

      // Create copies for physical/hybrid books
      if (book.type !== 'digital') {
        const copyCount = faker.number.int({ min: 3, max: 7 });
        let availableCount = 0;

        for (let i = 0; i < copyCount; i++) {
          const barcode = faker.string.uuid();
          // Mix of statuses
          const status = faker.helpers.weightedArrayElement([
            { weight: 5, value: 'AVAILABLE' },
            { weight: 3, value: 'ISSUED' },
            { weight: 1, value: 'LOST' },
            { weight: 1, value: 'DAMAGED' }
          ]);

          const copy = await BookCopy.findOne({ barcode });
          if (!copy) {
            await BookCopy.create({
              book: book._id,
              accessionNumber: `ACC-${faker.string.numeric(8)}`,
              barcode,
              status,
              condition: faker.helpers.arrayElement(['NEW', 'GOOD', 'FAIR']),
              shelfLocation: `A${faker.number.int({ min: 1, max: 10 })}-S${faker.number.int({ min: 1, max: 5 })}`
            });
            if (status === 'AVAILABLE') availableCount++;
          } else {
             if (copy.status === 'AVAILABLE') availableCount++;
          }
        }
        
        // Count actual copies in DB to update Book correctly
        const allCopies = await BookCopy.find({ book: book._id });
        const availCopies = allCopies.filter(c => c.status === 'AVAILABLE').length;
        book.totalCopies = allCopies.length;
        book.availableCopies = availCopies;
        await book.save();
      }
    }
    console.log('Realistic Books and Copies inserted.');

    // 6. Generate Borrowing Transactions for Students
    const students = users.filter(u => u.role === 'STUDENT');
    const librarians = users.filter(u => u.role === 'LIBRARIAN' || u.role === 'ADMIN');
    const librarianId = librarians.length > 0 ? librarians[0]._id : null;

    if (students.length > 0 && librarianId) {
      console.log('Generating realistic historical borrowing transactions...');
      for (const student of students) {
        // Find some random copies
        const copies = await BookCopy.find({ status: 'ISSUED' }).limit(3);
        
        for (const copy of copies) {
          // Check if transaction exists
          const existingTrans = await BorrowTransaction.findOne({ bookCopy: copy._id, user: student._id });
          if (!existingTrans) {
            const isReturned = faker.datatype.boolean();
            const requestedAt = faker.date.recent({ days: 60 });
            const issuedAt = new Date(requestedAt.getTime() + 86400000); // +1 day
            const dueDate = new Date(issuedAt.getTime() + 14 * 86400000); // +14 days
            
            let status = 'ISSUED';
            let returnedAt = null;
            let fine = 0;
            let fineStatus = 'NONE';
            
            if (isReturned) {
              status = 'RETURNED';
              returnedAt = faker.date.between({ from: issuedAt, to: new Date() });
              if (returnedAt > dueDate) {
                const diffTime = Math.abs(returnedAt - dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                fine = diffDays * 5; // $5 per day
                fineStatus = faker.helpers.arrayElement(['PAID', 'UNPAID']);
              }
            } else {
              if (new Date() > dueDate) {
                status = 'OVERDUE';
                const diffTime = Math.abs(new Date() - dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                fine = diffDays * 5;
                fineStatus = 'UNPAID';
              }
            }

            await BorrowTransaction.create({
              user: student._id,
              book: copy.book,
              bookCopy: copy._id,
              issuedBy: librarianId,
              requestedAt,
              issuedAt,
              dueDate,
              returnedAt,
              status,
              fine,
              lateDays: fine > 0 ? fine / 5 : 0,
              fineRatePerDay: 5,
              fineStatus
            });
            
            // Assign currentBorrower
            if (!isReturned) {
              copy.currentBorrower = student._id;
              await copy.save();
            }
          }
        }
      }
      console.log('Borrowing transactions generated.');
    }

    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
