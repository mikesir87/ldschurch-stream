const StreamEvent = require('../models/StreamEvent');
const AttendanceRecord = require('../models/AttendanceRecord');
const Unit = require('../models/Unit');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const youtubeService = require('../services/youtubeService');
const { recordStreamCreation } = require('../utils/metrics');
const logger = require('../utils/logger');

const getUserUnits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    let units;
    if (user.role === 'global_admin') {
      units = await Unit.find({ isActive: true }).sort({ name: 1 });
    } else {
      units = await Unit.find({ _id: { $in: user.units }, isActive: true }).sort({ name: 1 });
    }

    res.json(units);
  } catch (error) {
    next(error);
  }
};

const getStreams = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { status } = req.query;

    const query = { unitId };
    if (status) {
      query.status = status;
    }

    const streams = await StreamEvent.find(query).sort({ scheduledDateTime: 1 }).limit(50);

    // Get attendance counts for completed streams
    const streamIds = streams.map(s => s._id);
    const attendance = await AttendanceRecord.find({
      streamEventId: { $in: streamIds },
    });

    // Add attendance counts to streams
    const streamsWithAttendance = streams.map(stream => {
      const streamAttendance = attendance.filter(
        record => record.streamEventId.toString() === stream._id.toString()
      );
      const totalAttendees = streamAttendance.reduce(
        (sum, record) => sum + record.attendeeCount,
        0
      );

      return {
        ...stream.toObject(),
        totalAttendees: stream.status === 'completed' ? totalAttendees : undefined,
      };
    });

    res.json(streamsWithAttendance);
  } catch (error) {
    next(error);
  }
};

const createStream = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const {
      scheduledDate,
      scheduledTime,
      timezone = 'America/New_York',
      isSpecialEvent,
      specialEventMessage,
    } = req.body;

    // Get unit for stream key generation
    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    // Parse time from 12-hour format to 24-hour format
    const parseTime = timeStr => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);

      if (period === 'PM' && hour24 !== 12) hour24 += 12;
      if (period === 'AM' && hour24 === 12) hour24 = 0;

      return `${hour24.toString().padStart(2, '0')}:${minutes}`;
    };

    const time24 = parseTime(scheduledTime);
    // Create date in the specified timezone and convert to UTC
    const localDateStr = `${scheduledDate}T${time24}:00`;
    // Use a temporary date to get the offset for the target timezone
    const tempDate = new Date(localDateStr);
    const utcTime = new Date(tempDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const targetTime = new Date(tempDate.toLocaleString('en-US', { timeZone: timezone }));
    const offset = utcTime.getTime() - targetTime.getTime();
    const scheduledDateTime = new Date(tempDate.getTime() + offset);

    const streamData = {
      unitId,
      scheduledDateTime,
      timezone,
      isSpecialEvent: isSpecialEvent || false,
    };

    if (isSpecialEvent) {
      streamData.specialEventMessage = specialEventMessage;
      streamData.status = 'scheduled'; // Special events don't need YouTube creation
    } else {
      streamData.status = 'pending'; // Will be processed by batch job
    }

    const streamEvent = await StreamEvent.create(streamData);

    // Record metrics
    recordStreamCreation(unitId, true);

    res.status(201).json(streamEvent);
  } catch (error) {
    // Record failed stream creation
    recordStreamCreation(req.params.unitId, false);
    next(error);
  }
};

const updateStream = async (req, res, next) => {
  try {
    const { unitId, streamId } = req.params;
    const updates = req.body;

    const stream = await StreamEvent.findOne({ _id: streamId, unitId });
    if (!stream) {
      throw new AppError('Stream not found', 404, 'STREAM_NOT_FOUND');
    }

    Object.assign(stream, updates);
    await stream.save();

    res.json(stream);
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { startDate, endDate, search } = req.query;

    const streams = await StreamEvent.find({
      unitId,
      scheduledDateTime: {
        $gte: startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        $lte: endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Include next year
      },
    });

    const streamIds = streams.map(s => s._id);

    const attendanceQuery = { streamEventId: { $in: streamIds } };
    if (search) {
      attendanceQuery.attendeeName = { $regex: search, $options: 'i' };
    }

    const attendance = await AttendanceRecord.find(attendanceQuery)
      .populate('streamEventId', 'scheduledDateTime')
      .sort({ submittedAt: -1 });

    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

const getAttendanceTrends = async (req, res, next) => {
  try {
    const { unitId } = req.params;

    // Get last 10 completed stream events
    const streams = await StreamEvent.find({
      unitId,
      status: 'completed',
    })
      .sort({ scheduledDateTime: -1 })
      .limit(10);

    const streamIds = streams.map(s => s._id);

    // Get attendance for these streams
    const attendance = await AttendanceRecord.find({
      streamEventId: { $in: streamIds },
    });

    // Calculate total attendance per stream
    const trends = streams.reverse().map(stream => {
      const streamAttendance = attendance.filter(
        record => record.streamEventId.toString() === stream._id.toString()
      );
      const totalAttendees = streamAttendance.reduce(
        (sum, record) => sum + record.attendeeCount,
        0
      );

      return {
        date: stream.scheduledDateTime,
        totalAttendees,
      };
    });

    res.json(trends);
  } catch (error) {
    next(error);
  }
};

const deleteStream = async (req, res, next) => {
  try {
    const { unitId, streamId } = req.params;

    const stream = await StreamEvent.findOne({ _id: streamId, unitId });
    if (!stream) {
      throw new AppError('Stream not found', 404, 'STREAM_NOT_FOUND');
    }

    // Delete YouTube event if it exists
    if (stream.youtubeEventId) {
      try {
        await youtubeService.deleteEvent(stream.youtubeEventId);
      } catch (error) {
        // Log but don't fail the deletion if YouTube cleanup fails
        logger.warn('Failed to delete YouTube event:', error.message);
      }
    }

    // Delete associated attendance records
    await AttendanceRecord.deleteMany({ streamEventId: streamId });

    // Delete the stream event
    await StreamEvent.findByIdAndDelete(streamId);

    res.json({ message: 'Stream deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getUnitSettings = async (req, res, next) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    res.json({
      leadershipEmails: unit.leadershipEmails || [],
    });
  } catch (error) {
    next(error);
  }
};

const updateUnitSettings = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { leadershipEmails } = req.body;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    unit.leadershipEmails = leadershipEmails;
    await unit.save();

    res.json({
      leadershipEmails: unit.leadershipEmails,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserUnits,
  getStreams,
  createStream,
  updateStream,
  deleteStream,
  getAttendance,
  getAttendanceTrends,
  getUnitSettings,
  updateUnitSettings,
};
