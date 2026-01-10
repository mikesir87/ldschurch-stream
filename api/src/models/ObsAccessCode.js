const mongoose = require('mongoose');

const obsAccessCodeSchema = new mongoose.Schema(
  {
    accessCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
      index: true,
    },
    streamEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StreamEvent',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ObsAccessCode', obsAccessCodeSchema);
