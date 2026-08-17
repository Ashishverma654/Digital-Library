const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'REGISTER', 'UPDATE_PROFILE',
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
      'CREATE_BOOK', 'UPDATE_BOOK', 'DELETE_BOOK',
      'ADD_BOOK_COPY', 'UPDATE_BOOK_COPY', 'DELETE_BOOK_COPY',
      'BORROW_REQUEST', 'BORROW_APPROVE', 'BORROW_REJECT',
      'RETURN_BOOK', 'MARK_LOST', 'MARK_DAMAGED',
      'CREATE_DEPARTMENT', 'UPDATE_DEPARTMENT', 'DELETE_DEPARTMENT',
      'CREATE_COURSE', 'UPDATE_COURSE', 'DELETE_COURSE',
      'UPDATE_SETTINGS',
      'CREATE_NOTICE', 'DELETE_NOTICE',
      'OTHER'
    ]
  },
  description: {
    type: String,
    required: true,
  },
  targetResource: {
    resourceType: {
      type: String,
      enum: ['User', 'Book', 'BookCopy', 'BorrowTransaction', 'Department', 'Course', 'Settings', 'Notice', 'System'],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    }
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  }
}, {
  timestamps: true,
});

// Indexes for fast querying by user or action
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
