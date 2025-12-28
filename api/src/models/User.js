const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  units: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    index: true
  }],
  role: {
    type: String,
    enum: ['specialist', 'global_admin'],
    default: 'specialist'
  },
  lastLoginAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.hashedPassword;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('User', userSchema);
