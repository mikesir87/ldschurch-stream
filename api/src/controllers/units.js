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

    const streams = await StreamEvent.find(query).sort({ scheduledDate: -1 }).limit(50);

    res.json(streams);
  } catch (error) {
    next(error);
  }
};

const createStream = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { scheduledDate, scheduledTime, isSpecialEvent, specialEventMessage } = req.body;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    const streamData = {
      unitId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
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
      scheduledDate: {
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

const deleteStream = async (req, res, next) => {
  try {
    const { unitId, streamId } = req.params;

    const stream = await StreamEvent.findOne({ _id: streamId, unitId });
    if (!stream) {
      throw new AppError('Stream not found', 404, 'STREAM_NOT_FOUND');
    }

    // Update status to cancelled instead of deleting
    stream.status = 'cancelled';
    await stream.save();

    res.json({ message: 'Stream cancelled successfully' });
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
};
