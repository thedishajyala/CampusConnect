const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Club = require('../models/Club');

// @desc    Get student dashboard stats
// @route   GET /api/stats/student
// @access  Private
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    const totalRegistrations = await Registration.countDocuments({ studentId });
    const attendedEvents = await Registration.countDocuments({ studentId, attendanceStatus: 'present' });
    const certificatesEarnt = await Registration.countDocuments({ studentId, certificateIssued: true });
    
    // Find upcoming events registered by student
    const registrations = await Registration.find({ studentId }).populate('eventId');
    const upcomingEvents = registrations.filter(reg => {
      const event = reg.eventId;
      return event && new Date(event.date) > new Date();
    }).length;

    res.json({
      totalRegistrations,
      attendedEvents,
      certificatesEarnt,
      upcomingEvents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/stats/admin
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ createdBy: req.user._id });
    const events = await Event.find({ createdBy: req.user._id }).sort({ date: 1 });
    const eventIds = events.map(e => e._id);
    
    const registrations = await Registration.find({ eventId: { $in: eventIds } });
    
    // 1. Bar Chart: Monthly Events Created
    const monthlyEventsData = [];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    events.forEach(e => {
       const m = new Date(e.createdAt).getMonth();
       const mName = months[m];
       let existing = monthlyEventsData.find(item => item.name === mName);
       if(existing) {
          existing.events += 1;
       } else {
          monthlyEventsData.push({ name: mName, events: 1 });
       }
    });

    // 2. Pie Chart: Registration Distribution
    const regDist = { pending: 0, accepted: 0, rejected: 0 };
    registrations.forEach(r => {
       regDist[r.status] = (regDist[r.status] || 0) + 1;
    });
    const registrationDistData = [
       { name: 'Pending', value: regDist.pending },
       { name: 'Accepted', value: regDist.accepted },
       { name: 'Rejected', value: regDist.rejected }
    ];

    // 3. Line Chart: Attendance Trend
    // Mapping recent 5 events
    const attendanceTrendData = events.slice(-5).map(e => {
       const evRegs = registrations.filter(r => r.eventId.toString() === e._id.toString());
       const present = evRegs.filter(r => r.attendanceStatus === 'present').length;
       const absent = evRegs.filter(r => r.attendanceStatus === 'absent').length;
       return {
          name: e.title.substring(0, 10) + '...',
          Present: present,
          Absent: absent
       };
    });

    res.json({
      totalEvents,
      totalRegistrations: registrations.length,
      totalAttended: registrations.filter(r => r.attendanceStatus === 'present').length,
      monthlyEventsData,
      registrationDistData,
      attendanceTrendData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get faculty dashboard stats
// @route   GET /api/stats/faculty
// @access  Private/Faculty
const getFacultyStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const events = await Event.find();
    
    // Bar Chart: Events by Category
    const catMap = {};
    events.forEach(e => {
       const cat = e.category || 'Other';
       catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const eventsByCategoryData = Object.keys(catMap).map(k => ({ name: k, count: catMap[k] }));

    // Line Chart: Approval Trends (Mocked platform activity for Faculty)
    const months = ['Jan','Feb','Mar','Apr','May','Jun'];
    const approvalTrendsData = months.map((m, i) => ({
       name: m,
       Approvals: Math.floor(Math.random() * 20) + 5
    }));

    res.json({
      totalEvents,
      eventsByCategoryData,
      approvalTrendsData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get superadmin dashboard stats
// @route   GET /api/stats/superadmin
// @access  Private/SuperAdmin
const getSuperadminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClubs = await Club.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    const users = await User.find();
    const clubs = await Club.find().sort({ rankScore: -1 }).limit(5);

    // Area Chart: Platform Growth (Mocked historic for MVP)
    const platformGrowthData = [
       { name: 'Jan', users: 10, clubs: 2, events: 5 },
       { name: 'Feb', users: 25, clubs: 3, events: 12 },
       { name: 'Mar', users: 40, clubs: 5, events: 25 },
       { name: 'Apr', users: totalUsers > 40 ? totalUsers : 50, clubs: totalClubs, events: totalEvents }
    ];

    // Bar Chart: Top Ranked Clubs
    const topClubsData = clubs.map(c => ({
       name: c.name.substring(0,10)+'...',
       score: c.rankScore || 0
    }));

    // Pie Chart: Role Distribution
    const roleDist = { student: 0, admin: 0, faculty: 0, superadmin: 0 };
    users.forEach(u => roleDist[u.role]++);
    const roleDistData = [
       { name: 'Students', value: roleDist.student },
       { name: 'Admins', value: roleDist.admin },
       { name: 'Faculty', value: roleDist.faculty },
       { name: 'Super Admins', value: roleDist.superadmin }
    ];

    res.json({
      totalUsers,
      totalClubs,
      totalEvents,
      platformGrowthData,
      topClubsData,
      roleDistData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getStudentStats,
  getAdminStats,
  getFacultyStats,
  getSuperadminStats,
};
