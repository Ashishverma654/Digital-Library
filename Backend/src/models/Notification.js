const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'],
    default: 'INFO',
  },
}, {
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
