const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Digital Library API' });
});

// Routes will be mounted here later
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/librarian', require('./routes/librarianRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Error handling middleware
const globalErrorHandler = require('./middleware/errorMiddleware');
app.use(globalErrorHandler);

module.exports = app;
