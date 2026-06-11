const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notificationController.cjs');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all notification routes
router.use(protect);

router.get('/', getNotifications);
router.put('/read', markAsRead);

module.exports = router;
