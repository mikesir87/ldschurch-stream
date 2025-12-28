const mongoose = require('mongoose');

const streamEventSchema = new mongoose.Schema({
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true,
    index: true
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  youtubeEventId: {
    type: String,
    index: true
  },
  youtubeStreamUrl: String,
  streamKey: String,
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  isSpecialEvent: {
    type: Boolean,
    default: false
  },
  specialEventMessage: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

streamEventSchema.index({ unitId: 1, scheduledDate: -1 });
streamEventSchema.index({ status: 1, scheduledDate: 1 });

module.exports = mongoose.model('StreamEvent', streamEventSchema);
