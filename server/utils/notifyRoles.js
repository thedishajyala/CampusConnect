const User = require('../models/User');
const Notification = require('../models/Notification.cjs');

/**
 * Broadcasts a notification to all users matching the given roles.
 * @param {Array<String>} roles - Array of user roles (e.g., ['admin', 'faculty', 'student'])
 * @param {Object} notificationData - Object containing title, message, type, and link
 */
const notifyRoles = async (roles, notificationData) => {
  try {
     const users = await User.find({ role: { $in: roles } }).select('_id');
     
     if (users.length === 0) return;

     const notifications = users.map(user => ({
        userId: user._id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        link: notificationData.link || null,
     }));

     await Notification.insertMany(notifications);
  } catch (err) {
     console.error(`Failed to notify roles ${roles.join(', ')}:`, err);
  }
};

module.exports = notifyRoles;
