const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get top 3 ranked clubs with AI simulated summary
// @route   GET /api/rankings/top-clubs
// @access  Public
const getTopClubs = async (req, res) => {
  try {
    const clubs = await Club.find({ status: 'approved' }).populate('createdBy', 'name');
    
    const rankedClubs = [];

    for (let club of clubs) {
      const events = await Event.find({ clubId: club._id });
      const totalEvents = events.length;
      const completedEvents = events.filter(e => e.status === 'completed').length;
      
      const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
      
      let totalRegistrations = 0;
      let presentRegistrations = 0;

      for (let event of events) {
         const registrations = await Registration.find({ eventId: event._id });
         totalRegistrations += registrations.length;
         presentRegistrations += registrations.filter(r => r.attendanceStatus === 'present').length;
      }

      const attendanceRate = totalRegistrations > 0 ? (presentRegistrations / totalRegistrations) * 100 : 0;
      
      // score = (0.5 * completionRate) + (0.3 * totalRegistrations) + (0.2 * attendanceRate)
      const score = (0.5 * completionRate) + (0.3 * totalRegistrations) + (0.2 * attendanceRate);

      // AI Generated summary paragraphs (simulated)
      const aiSummary = `${club.name} has demonstrated outstanding commitment to campus life with ${totalEvents} events and ${totalRegistrations} total student registrations. Their focus on engaging activities resulted in a ${attendanceRate.toFixed(1)}% attendance rate, earning them widespread recognition.`;

      rankedClubs.push({
         ...club.toObject(),
         metrics: {
            totalEvents,
            completedEvents,
            completionRate,
            totalRegistrations,
            attendanceRate,
         },
         aiSummary,
         score
      });
    }

    // Sort by score descending and take top 3
    rankedClubs.sort((a, b) => b.score - a.score);
    const topClubs = rankedClubs.slice(0, 3);
    
    res.json(topClubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTopClubs
};
