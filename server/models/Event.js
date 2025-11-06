const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalTickets: {
    type: Number,
    required: true,
    min: 1
  },
  availableTickets: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Set availableTickets equal to totalTickets before saving if not provided
eventSchema.pre('save', function(next) {
  if (this.isNew && (!this.availableTickets || this.availableTickets === 0)) {
    this.availableTickets = this.totalTickets;
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);