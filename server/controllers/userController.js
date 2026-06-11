const User = require('../models/User');
const Notification = require('../models/Notification.cjs');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      if (req.file) {
         user.profileImage = req.file.path;
      }

      const updatedUser = await user.save();

      try {
         await Notification.create({
            userId: user._id,
            title: 'Profile Updated',
            message: 'Your profile information has been successfully updated.',
            type: 'info',
            link: `/${user.role}-dashboard`,
         });
      } catch (err) {
         console.error('Error notifying user of profile update', err);
      }

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
