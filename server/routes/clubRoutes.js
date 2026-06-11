const express = require('express');
const router = express.Router();
const {
  registerClub,
  approveClub,
  rejectClub,
  getClubs,
  deleteClub
} = require('../controllers/clubController');
const { protect, admin, superadmin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getClubs);

router.route('/register')
    .post(protect, admin, registerClub);

router.route('/approve/:id')
    .put(protect, superadmin, approveClub);

router.route('/reject/:id')
    .put(protect, superadmin, rejectClub);

router.route('/:id')
    .delete(protect, superadmin, deleteClub);

module.exports = router;
