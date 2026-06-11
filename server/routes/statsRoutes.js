const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getStudentStats,
  getAdminStats,
  getFacultyStats,
  getSuperadminStats,
} = require('../controllers/statsController');

// All stats require basic authentication
router.get('/student', protect, getStudentStats);
// Assuming admin role is checked on the frontend or we can add admin middleware
router.get('/admin', protect, getAdminStats);
router.get('/faculty', protect, getFacultyStats);
router.get('/superadmin', protect, getSuperadminStats);

module.exports = router;
