const Event = require('../models/Event');
const Registration = require('../models/Registration');
const jwt = require('jsonwebtoken');

// @desc Generate QR code token for an event
// @route POST /api/attendance/generate-qr
// @access Private/Admin
const generateQR = async (req, res) => {
  try {
    const { eventId } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Generate a JWT containing the eventId, with an expiration (e.g., 24h)
    const token = jwt.sign(
      { eventId, type: 'attendance' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ token, eventId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Scan QR code token to mark attendance
// @route POST /api/attendance/scan
// @access Private/Student
const scanQR = async (req, res) => {
  try {
    const { token } = req.body;
    const studentId = req.user._id;

    if (!token) {
      return res.status(400).json({ message: 'No QR token provided' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired QR code' });
    }

    if (decoded.type !== 'attendance') {
      return res.status(400).json({ message: 'Invalid QR code type' });
    }

    const { eventId } = decoded;

    // Find the registration
    const registration = await Registration.findOne({ eventId, studentId });
    if (!registration) {
      return res.status(404).json({ message: 'You are not registered for this event' });
    }

    if (registration.status !== 'accepted') {
       return res.status(400).json({ message: 'Your registration is not approved yet' });
    }

    if (registration.attendanceStatus === 'present') {
      return res.status(400).json({ message: 'Attendance already marked' });
    }

    registration.attendanceStatus = 'present';
    registration.attendanceTimestamp = new Date();
    await registration.save();

    res.json({ message: 'Attendance marked successfully', eventId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateQR,
  scanQR
};
