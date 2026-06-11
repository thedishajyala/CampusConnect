const express = require('express');
const router = express.Router();
const { getTopClubs } = require('../controllers/rankingsController');

router.get('/top-clubs', getTopClubs);

module.exports = router;
