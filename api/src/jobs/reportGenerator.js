const StreamEvent = require('../models/StreamEvent');
const AttendanceRecord = require('../models/AttendanceRecord');
const emailService = require('../services/emailService');
const youtubeService = require('../services/youtubeService');
const logger = require('../utils/logger');

class ReportGenerator {
  async run() {
    logger.info('Starting weekly report generation');

    // Find completed streams from previous day (Sunday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const completedStreams = await StreamEvent.find({
      status: 'completed',
      reportSent: false, // Only process streams that haven't had reports sent
      scheduledDateTime: {
        $gte: yesterday,
        $lte: endOfYesterday,
      },
    }).populate('unitId');

    for (const stream of completedStreams) {
      await this.generateUnitReport(stream);
      await this.cleanupYouTubeEvent(stream);
    }

    logger.info(`Generated reports for ${completedStreams.length} units`);
  }

  async generateUnitReport(streamEvent) {
    const unit = streamEvent.unitId;

    if (!unit.leadershipEmails || unit.leadershipEmails.length === 0) {
      logger.warn(`No leadership emails configured for unit: ${unit.name}`);
      // Mark as sent even if no emails configured to avoid reprocessing
      streamEvent.reportSent = true;
      await streamEvent.save();
      return;
    }

    // Get attendance for this stream
    const attendance = await AttendanceRecord.find({
      streamEventId: streamEvent._id,
    }).sort({ attendeeName: 1 });

    // Generate attendance analysis
    const report = await this.buildAttendanceReport(unit, streamEvent, attendance);

    // Send email to leadership
    await emailService.sendAttendanceReport(unit.leadershipEmails, report);

    // Mark report as sent
    streamEvent.reportSent = true;
    await streamEvent.save();

    logger.info(`Sent report for ${unit.name} to ${unit.leadershipEmails.length} recipients`);
  }

  async buildAttendanceReport(unit, streamEvent, attendance) {
    // Get historical data for pattern analysis (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentStreams = await StreamEvent.find({
      unitId: unit._id,
      status: 'completed',
      scheduledDateTime: { $gte: fourWeeksAgo },
    });

    const recentAttendance = await AttendanceRecord.find({
      streamEventId: { $in: recentStreams.map(s => s._id) },
    });

    // Analyze attendance patterns
    const analysis = this.analyzeAttendancePatterns(attendance, recentAttendance);

    return {
      unit: unit.name,
      streamDate: streamEvent.scheduledDateTime.toDateString(),
      totalAttendees: attendance.reduce((sum, record) => sum + record.attendeeCount, 0),
      uniqueNames: attendance.length,
      attendeeList: attendance.map(record => ({
        name: record.attendeeName,
        count: record.attendeeCount,
      })),
      analysis,
    };
  }

  analyzeAttendancePatterns(currentAttendance, historicalAttendance) {
    const currentNames = new Set(currentAttendance.map(a => a.attendeeName));
    const historicalNames = historicalAttendance.map(a => a.attendeeName);

    // Count historical appearances
    const nameFrequency = {};
    historicalNames.forEach(name => {
      nameFrequency[name] = (nameFrequency[name] || 0) + 1;
    });

    // Find patterns
    const newThisWeek = Array.from(currentNames).filter(name => !nameFrequency[name]);
    const regularStreamers = Array.from(currentNames).filter(name => nameFrequency[name] >= 3);
    const historicalRegulars = Object.keys(nameFrequency).filter(name => nameFrequency[name] >= 3);
    const missingRegulars = historicalRegulars.filter(name => !currentNames.has(name));

    return {
      newThisWeek,
      regularStreamers,
      missingRegulars,
      returnedAfterAbsence: [], // Could be enhanced with more complex logic
    };
  }

  async cleanupYouTubeEvent(streamEvent) {
    if (!streamEvent.youtubeEventId) return;

    try {
      await youtubeService.deleteEvent(streamEvent.youtubeEventId);

      // Clear YouTube data from database
      streamEvent.youtubeEventId = null;
      streamEvent.youtubeStreamUrl = null;
      await streamEvent.save();

      logger.info(`Cleaned up YouTube event for stream: ${streamEvent._id}`);
    } catch (error) {
      logger.error(`Failed to cleanup YouTube event: ${streamEvent.youtubeEventId}`, {
        error: error.message,
        streamId: streamEvent._id,
      });
    }
  }
}

module.exports = new ReportGenerator();
