const Unit = require('../models/Unit');
const StreamEvent = require('../models/StreamEvent');
const AttendanceRecord = require('../models/AttendanceRecord');
const { AppError } = require('../middleware/errorHandler');

const getCurrentStream = async (req, res, next) => {
  try {
    const { subdomain } = req.params;

    const unit = await Unit.findOne({ subdomain, isActive: true });
    if (!unit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentStream = await StreamEvent.findOne({
      unitId: unit._id,
      scheduledDate: { $gte: today },
      status: { $in: ['scheduled', 'live'] }
    }).sort({ scheduledDate: 1 });

    if (!currentStream) {
      return res.json({
        unit: { name: unit.name },
        message: 'No stream scheduled',
        hasStream: false
      });
    }

    if (currentStream.isSpecialEvent) {
      return res.json({
        unit: { name: unit.name },
        message: currentStream.specialEventMessage || 'Special event - no stream today',
        hasStream: false,
        isSpecialEvent: true
      });
    }

    res.json({
      unit: { name: unit.name },
      stream: {
        id: currentStream._id,
        scheduledDate: currentStream.scheduledDate,
        scheduledTime: currentStream.scheduledTime,
        status: currentStream.status,
        youtubeStreamUrl: currentStream.youtubeStreamUrl
      },
      hasStream: true
    });
  } catch (error) {
    next(error);
  }
};

const submitAttendance = async (req, res, next) => {
  try {
    const { subdomain } = req.params;
    const { attendeeName, attendeeCount } = req.body;

    const unit = await Unit.findOne({ subdomain, isActive: true });
    if (!unit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentStream = await StreamEvent.findOne({
      unitId: unit._id,
      scheduledDate: { $gte: today },
      status: { $in: ['scheduled', 'live'] }
    }).sort({ scheduledDate: 1 });

    if (!currentStream || currentStream.isSpecialEvent) {
      throw new AppError('No active stream available', 400, 'NO_ACTIVE_STREAM');
    }

    await AttendanceRecord.create({
      streamEventId: currentStream._id,
      attendeeName: attendeeName.trim(),
      attendeeCount: parseInt(attendeeCount),
      ipAddress: req.ip
    });

    res.status(201).json({
      message: 'Attendance recorded successfully',
      streamUrl: currentStream.youtubeStreamUrl
    });
  } catch (error) {
    next(error);
  }
};

const getUnitInfo = async (req, res, next) => {
  try {
    const { subdomain } = req.params;

    const unit = await Unit.findOne({ subdomain, isActive: true });
    if (!unit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    res.json({
      name: unit.name,
      subdomain: unit.subdomain
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentStream,
  submitAttendance,
  getUnitInfo
};
