const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'faculty', 'superadmin'],
    default: 'student',
  },
  profileImage: {
    type: String,
    default: '',
  },
  oauthProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local',
  },
  oauthId: {
    type: String,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
