const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const app = express();

// Compress all responses using Gzip
app.use(compression());

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return callback(null, true);
    if (/^http:\/\/localhost:\d{4}$/.test(origin)) return callback(null, true);
    callback(null, false);
  },
}));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', globalLimiter);

// Auth Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

app.use(express.json({ limit: '10mb' }));

// Data sanitization against NoSQL injection (Removed due to Express 5 req.query getter incompatibility)
// app.use(mongoSanitize());

// Data sanitization against XSS (Removed due to Express 5 incompatibility)
// app.use(xss());

// Prevent HTTP Parameter Pollution (Removed due to Express 5 incompatibility)
// app.use(hpp({
//   whitelist: [
//     'sort',
//     'search',
//     'category',
//     'type'
//   ]
// }));

app.use(morgan('dev'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Digital Library API' });
});

// Routes will be mounted here later
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/librarian', require('./routes/librarianRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Error handling middleware
const globalErrorHandler = require('./middleware/errorMiddleware');
app.use(globalErrorHandler);

module.exports = app;
