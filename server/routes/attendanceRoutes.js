const express = require('express');
const router = express.Router();
const { generateQR, scanQR } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

// Student route
router.post('/scan', protect, scanQR);

// Admin route
router.post('/generate-qr', protect, admin, generateQR);

module.exports = router;
