const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification.cjs');
const notifyRoles = require('../utils/notifyRoles');

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private/Student
const registerForEvent = async (req, res) => {
  try {
    const { event, githubProfile, message } = req.body;
    const studentId = req.user._id;
    const eventId = event || req.body.eventId; // Map frontend key 'event' to 'eventId'

    // Check if event exists
    const targetEvent = await Event.findById(eventId);
    if (!targetEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if max participants reached
    const registrationCount = await Registration.countDocuments({ eventId });
    if (registrationCount >= targetEvent.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Attempt to register (Status is pending by default in Schema)
    const registration = await Registration.create({
      eventId,
      studentId,
      githubProfile,
      message,
    });

    // Notify Event Owner (Club or Admin)
    try {
       await Notification.create({
          userId: targetEvent.clubId || targetEvent.createdBy,
          title: 'New Registration',
          message: `${req.user.name} has registered for your event: ${targetEvent.title}`,
          type: 'info',
          link: '/admin-dashboard'
       });
    } catch (notifErr) {
       console.error("Failed to notify event owner:", notifErr);
    }

    // Role-based notification broadcast
    // Admin gets notified of student registration
    // Faculty gets notified of all student related information
    try {
       await notifyRoles(['admin', 'faculty'], {
         title: 'Student Registration',
         message: `${req.user.name} has registered for the event: ${targetEvent.title}`,
         type: 'info',
         link: `/admin-dashboard`, // Registration review pane
       });
    } catch (notifErr) {
       console.error("Failed to notify admins/faculty of registration:", notifErr);
    }

    // Notify the student
    try {
       await Notification.create({
          userId: studentId,
          title: 'Registration Successful',
          message: `You have successfully requested registration for: ${targetEvent.title}`,
          type: 'success',
          link: '/student-dashboard',
       });
    } catch (notifErr) {
       console.error("Failed to notify student of registration:", notifErr);
    }

    res.status(201).json(registration);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'You are already registered for this event' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get all registrations for an event
// @route   GET /api/registrations/event/:eventId
// @access  Private/Admin
const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId })
      .populate('studentId', 'name email profileImage');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ studentId: req.user._id })
      .populate({
        path: 'eventId',
        select: 'title date venue clubId',
        populate: { path: 'clubId', select: 'name' }
      });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark attendance
// @route   PUT /api/registrations/attendance/:id
// @access  Private/Admin
const markAttendance = async (req, res) => {
  try {
    const { status } = req.body; // 'present' or 'absent'
    
    if (!['present', 'absent'].includes(status)) {
       return res.status(400).json({ message: 'Invalid attendance status' });
    }

    const registration = await Registration.findById(req.params.id);

    if (registration) {
      registration.attendanceStatus = status;
      const updatedRegistration = await registration.save();
      
      // Notify Student
      try {
         // Populate event to get the title cleanly
         const regWithEvent = await Registration.findById(registration._id).populate('eventId', 'title');
         await Notification.create({
            userId: registration.studentId,
            title: 'Attendance Marked',
            message: `Your attendance for ${regWithEvent.eventId?.title || 'an event'} has been marked as ${status}.`,
            type: 'info',
            link: '/student-dashboard'
         });
      } catch (notifErr) {
         console.error("Failed to notify student of attendance:", notifErr);
      }

      res.json(updatedRegistration);
    } else {
      res.status(404).json({ message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve registration
// @route   PUT /api/registrations/:id/approve
// @access  Private/Admin
const approveRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('eventId', 'title');
    if (registration) {
      registration.status = 'accepted';
      const updatedRegistration = await registration.save();
      
      // Notify Student
      try {
         await Notification.create({
            userId: registration.studentId,
            title: 'Registration Approved',
            message: `Your registration for ${registration.eventId?.title} has been APPROVED.`,
            type: 'success',
            link: '/student-dashboard'
         });
      } catch (notifErr) {
         console.error("Failed to notify student:", notifErr);
      }
      
      res.json(updatedRegistration);
    } else {
      res.status(404).json({ message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject registration
// @route   PUT /api/registrations/:id/reject
// @access  Private/Admin
const rejectRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('eventId', 'title');
    if (registration) {
      registration.status = 'rejected';
      const updatedRegistration = await registration.save();
      
      // Notify Student
      try {
         await Notification.create({
            userId: registration.studentId,
            title: 'Registration Rejected',
            message: `Your registration for ${registration.eventId?.title} has been rejected.`,
            type: 'error',
            link: '/student-dashboard'
         });
      } catch (notifErr) {
         console.error("Failed to notify student:", notifErr);
      }
      
      res.json(updatedRegistration);
    } else {
      res.status(404).json({ message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerForEvent,
  getEventRegistrations,
  getMyRegistrations,
  markAttendance,
  approveRegistration,
  rejectRegistration,
};
