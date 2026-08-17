const ActivityLog = require('../models/ActivityLog');

/**
 * Logs an activity to the database.
 * 
 * @param {Object} req - The Express request object (to extract IP and user agent).
 * @param {ObjectId} userId - ID of the user performing the action.
 * @param {String} action - The action type enum (e.g., 'LOGIN', 'CREATE_BOOK').
 * @param {String} description - Human readable description of what happened.
 * @param {Object} [targetResource] - Optional target resource info { resourceType, resourceId }.
 */
const logActivity = async (req, userId, action, description, targetResource = null) => {
  try {
    const ipAddress = req ? (req.ip || req.connection.remoteAddress) : 'Unknown';
    const userAgent = req ? req.headers['user-agent'] : 'Unknown';

    await ActivityLog.create({
      user: userId,
      action,
      description,
      targetResource,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = logActivity;
