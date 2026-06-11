const Notification = require('../models/Notification.cjs');

// @desc    Get top 10 recent unread and read notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ 
        userId: req.user._id, 
        read: false 
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications', error: error.message });
  }
};

// @desc    Mark multiple or single notification as read
// @route   PUT /api/notifications/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (notificationId) {
       // Mark single
       const notification = await Notification.findOneAndUpdate(
          { _id: notificationId, userId: req.user._id },
          { read: true },
          { new: true }
       );
       if (!notification) return res.status(404).json({ message: 'Notification not found' });
    } else {
       // Mark all bulk
       await Notification.updateMany(
          { userId: req.user._id, read: false },
          { read: true }
       );
    }

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error marking notifications', error: error.message });
  }
};
