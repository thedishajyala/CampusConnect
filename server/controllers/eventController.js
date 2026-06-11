const Event = require('../models/Event');
const Club = require('../models/Club');
const notifyRoles = require('../utils/notifyRoles');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('clubId', 'name category').sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get events by Club
// @route   GET /api/events/club/:id
// @access  Public
const getEventsByClub = async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.params.id }).populate('clubId', 'name category').sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('clubId', 'name');
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, clubId, maxParticipants, category, coverImageUrl } = req.body;

    const event = new Event({
      title,
      description,
      date,
      venue,
      category,
      coverImageUrl,
      capacity: maxParticipants,
      clubId: clubId || null,
      createdBy: req.user._id,
      maxParticipants,
    });

    const createdEvent = await event.save();

    // Broadcast Notifications
    // Student: notified of all new events
    // Faculty: notified of all event-related info
    // Superadmin: notified of events creation by clubs/admins
    await notifyRoles(['student', 'faculty', 'superadmin'], {
      title: 'New Event Created',
      message: `A new event "${createdEvent.title}" has been scheduled for ${new Date(createdEvent.date).toLocaleDateString()}.`,
      type: 'success',
      link: `/events/${createdEvent._id}`,
    });

    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = req.body.title || event.title;
      event.description = req.body.description || event.description;
      event.date = req.body.date || event.date;
      event.venue = req.body.venue || event.venue;
      event.clubId = req.body.clubId || event.clubId;
      event.maxParticipants = req.body.maxParticipants || event.maxParticipants;

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await Event.deleteOne({ _id: event._id });
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  getEventsByClub,
  createEvent,
  updateEvent,
  deleteEvent,
};
