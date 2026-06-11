const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getEventRegistrations,
  getMyRegistrations,
  markAttendance,
  approveRegistration,
  rejectRegistration,
} = require('../controllers/registrationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/event/:eventId', protect, admin, getEventRegistrations);
router.put('/attendance/:id', protect, admin, markAttendance);
router.put('/:id/approve', protect, admin, approveRegistration);
router.put('/:id/reject', protect, admin, rejectRegistration);

module.exports = router;
