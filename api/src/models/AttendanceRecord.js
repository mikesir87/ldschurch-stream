const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  streamEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StreamEvent',
    required: true,
    index: true
  },
  attendeeName: {
    type: String,
    required: true,
    trim: true
  },
  attendeeCount: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: String
}, {
  timestamps: true
});

attendanceRecordSchema.index({ streamEventId: 1, attendeeName: 1 });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
