const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  category: {
    type: String,
  },
  rankScore: {
    type: Number,
    default: 0,
  },
  bannerUrl: { type: String },
  thumbnailUrl: { type: String }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Club', clubSchema);
