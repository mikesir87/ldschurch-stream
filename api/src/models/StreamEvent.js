const mongoose = require('mongoose');

const streamEventSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
      index: true,
    },
    scheduledDateTime: {
      type: Date,
      required: true,
      index: true,
    },
    timezone: {
      type: String,
      required: true,
      default: 'America/New_York',
    },
    youtubeEventId: {
      type: String,
      index: true,
    },
    youtubeStreamUrl: String,
    streamKey: String,
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    isSpecialEvent: {
      type: Boolean,
      default: false,
    },
    specialEventMessage: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

streamEventSchema.index({ unitId: 1, scheduledDateTime: -1 });
streamEventSchema.index({ status: 1, scheduledDateTime: 1 });

module.exports = mongoose.model('StreamEvent', streamEventSchema);
