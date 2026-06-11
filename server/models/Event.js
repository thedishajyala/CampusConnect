const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  maxParticipants: {
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'active',
  },
  category: {
    type: String,
  },
  coverImageUrl: { type: String }
}, {
  timestamps: true,
});

// Indexing for search
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
