const express = require('express');
const router = express.Router();
const { generateCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateCertificate);

module.exports = router;
