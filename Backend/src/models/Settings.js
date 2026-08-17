const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  finePerDay: {
    type: Number,
    default: 10,
    min: 0
  },
  maxBorrowDays: {
    type: Number,
    default: 15,
    min: 1
  },
  maxBooksPerStudent: {
    type: Number,
    default: 3,
    min: 1
  }
}, {
  timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
