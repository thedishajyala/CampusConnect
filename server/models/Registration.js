const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendanceStatus: {
    type: String,
    enum: ['present', 'absent', 'pending'],
    default: 'pending',
  },
  certificateIssued: {
    type: Boolean,
    default: false,
  },
  certificateDescription: {
    type: String,
  },
  certificateIssuedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  githubProfile: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  attendanceTimestamp: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Prevent duplicate registrations
registrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
