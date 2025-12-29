const StreamEvent = require('../models/StreamEvent');
const AttendanceRecord = require('../models/AttendanceRecord');
const Unit = require('../models/Unit');
const { AppError } = require('../middleware/errorHandler');

const getStreams = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { status } = req.query;

    const query = { unitId };
    if (status) {
      query.status = status;
    }

    const streams = await StreamEvent.find(query).sort({ scheduledDateTime: 1 }).limit(50);

    res.json(streams);
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
      streamData.status = 'scheduled';
    } else {
      // TODO: Integrate with YouTube API to create live event
      streamData.youtubeEventId = `mock-event-${Date.now()}`;
      streamData.youtubeStreamUrl = `https://youtube.com/watch?v=mock-${Date.now()}`;
      streamData.streamKey = `${unit.subdomain}-${Date.now()}`;
    }

    const streamEvent = await StreamEvent.create(streamData);
    res.status(201).json(streamEvent);
  } catch (error) {
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
        $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Include next year
      },
    });

    const streamIds = streams.map(s => s._id);

    const attendanceQuery = { streamEventId: { $in: streamIds } };
    if (search) {
      attendanceQuery.attendeeName = { $regex: search, $options: 'i' };
    }

    const attendance = await AttendanceRecord.find(attendanceQuery)
      .populate('streamEventId', 'scheduledDate scheduledTime')
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

    // Delete associated attendance records
    await AttendanceRecord.deleteMany({ streamEventId: streamId });

    // Delete the stream event
    await StreamEvent.findByIdAndDelete(streamId);

    res.json({ message: 'Stream deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStreams,
  createStream,
  updateStream,
  deleteStream,
  getAttendance,
  getAttendanceTrends,
};
