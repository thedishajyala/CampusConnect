const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// @desc    Upload an image to Cloudinary and return the URL
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  
  // multer-storage-cloudinary attaches 'path' holding the Cloudinary secure URL
  res.json({ imageUrl: req.file.path });
});

module.exports = router;
