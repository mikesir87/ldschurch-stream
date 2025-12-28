const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/,
    minlength: 3,
    maxlength: 50,
    index: true
  },
  leadershipEmails: [{
    type: String,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Unit', unitSchema);
