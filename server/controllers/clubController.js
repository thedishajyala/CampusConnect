const Club = require('../models/Club');
const User = require('../models/User');
const Notification = require('../models/Notification.cjs');
const notifyRoles = require('../utils/notifyRoles');

// @desc    Register a new club
// @route   POST /api/clubs/register
// @access  Private/Admin
const registerClub = async (req, res) => {
  try {
    const { name, description, category, bannerUrl, thumbnailUrl } = req.body;

    // Check if club already exists
    const clubExists = await Club.findOne({ name });

    if (clubExists) {
      return res.status(400).json({ message: 'A club with this name already exists' });
    }

    const club = await Club.create({
      name,
      description,
      category,
      bannerUrl,
      thumbnailUrl,
      createdBy: req.user._id,
      status: 'pending' // Enforcing pending status initially
    });

    // Notify SuperAdmin of new request, and Faculty of club info
    await notifyRoles(['superadmin', 'faculty'], {
      title: 'New Club Request',
      message: `A new club request "${club.name}" is pending approval.`,
      type: 'warning',
      link: '/superadmin-dashboard',
    });

    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve a pending club
// @route   PUT /api/clubs/approve/:id
// @access  Private/SuperAdmin
const approveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    club.status = 'approved';
    const updatedClub = await club.save();

    // Create Notification for the club creator
    await Notification.create({
      userId: club.createdBy,
      title: 'Club Approved',
      message: `Your club "${club.name}" has been approved!`,
      type: 'approval',
      link: '/student-dashboard', // Or club dashboard if it exists
    });

    // Notify Admins, Faculty, and Students of the new approved club
    await notifyRoles(['admin', 'faculty', 'student'], {
      title: 'New Club Approved',
      message: `The club "${club.name}" has been officially approved and added to CampusConnect!`,
      type: 'success',
      link: '/student-dashboard', // Link to organizations/discover
    });

    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject a pending club
// @route   PUT /api/clubs/reject/:id
// @access  Private/SuperAdmin
const rejectClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    club.status = 'rejected';
    const updatedClub = await club.save();

    // Create Notification for the club creator
    await Notification.create({
      userId: club.createdBy,
      title: 'Club Rejected',
      message: `Your request to register the club "${club.name}" has been rejected.`,
      type: 'rejection',
    });

    // Notify Admins and Faculty of the rejection
    await notifyRoles(['admin', 'faculty'], {
      title: 'Club Request Rejected',
      message: `The club registration request for "${club.name}" has been rejected.`,
      type: 'error',
    });

    res.json(updatedClub);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all clubs (with optional status filtering)
// @route   GET /api/clubs
// @access  Public or Private depending on usage
const getClubs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
        filter.status = req.query.status;
    }
    const clubs = await Club.find(filter).populate('createdBy', 'name email');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a club completely
// @route   DELETE /api/clubs/:id
// @access  Private/SuperAdmin
const deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    await Club.deleteOne({ _id: club._id });

    // Optionally delete all events associated with this club
    // await Event.deleteMany({ clubId: club._id });

    res.json({ message: 'Club successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerClub,
  approveClub,
  rejectClub,
  getClubs,
  deleteClub
};
