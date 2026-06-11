const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/me', protect, getUserProfile);
router.put('/update', protect, upload.single('profileImage'), updateUserProfile);

module.exports = router;
