const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  getEventsByClub,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, admin, adminOrFaculty } = require('../middleware/authMiddleware');

router.route('/').get(getEvents).post(protect, admin, createEvent);
router.route('/club/:id').get(getEventsByClub);
router
  .route('/:id')
  .get(getEventById)
  .put(protect, admin, updateEvent)
  .delete(protect, adminOrFaculty, deleteEvent);

module.exports = router;
