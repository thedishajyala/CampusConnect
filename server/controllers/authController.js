const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcrypt');
const Notification = require('../models/Notification.cjs');

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Security Hard Block: Only manual DB insertions can create a superadmin
    if (role === 'superadmin') {
      return res.status(403).json({ message: 'Superadmin registration is officially disabled. Please contact the system administrator.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student', // default student if not provided
      oauthProvider: 'local',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });

      // Send Welcome Notification asynchronously
      try {
        await Notification.create({
          userId: user._id,
          title: 'Welcome to CampusConnect!',
          message: 'Your account has been successfully created. Explore events, join clubs, and connect with your campus!',
          type: 'success',
          link: `/${user.role}-dashboard`,
        });
      } catch (err) {
        console.error('Failed to create welcome notification:', err);
      }

    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && user.oauthProvider === 'local') {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
         return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          token: generateToken(user._id),
        });
      }
    }
    
    // If it's an OAuth user trying to login with password incorrectly, handle smoothly
    if (user && user.oauthProvider !== 'local') {
       return res.status(400).json({ message: `Please log in using your ${user.oauthProvider} account` });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const oauthCallback = (req, res) => {
  // Successful authentication
  const token = generateToken(req.user._id);
  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
};

module.exports = {
  registerUser,
  loginUser,
  oauthCallback,
};
