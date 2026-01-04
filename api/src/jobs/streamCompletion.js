const StreamEvent = require('../models/StreamEvent');
const logger = require('../utils/logger');

class StreamCompletion {
  async markCompletedStreams() {
    const correlationId = require('uuid').v4();
    const jobLogger = logger.child({
      correlationId,
      job: 'stream-completion',
    });

    jobLogger.info('Starting stream completion check');

    try {
      // Find streams that should be completed (90 minutes past start time)
      const completionTime = new Date();
      completionTime.setMinutes(completionTime.getMinutes() - 90);

      const result = await StreamEvent.updateMany(
        {
          status: { $in: ['scheduled', 'live'] },
          scheduledDateTime: { $lte: completionTime },
        },
        { status: 'completed' }
      );

      jobLogger.info('Stream completion check completed', {
        streamsMarkedCompleted: result.modifiedCount,
      });
    } catch (error) {
      jobLogger.error('Stream completion check failed', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

module.exports = new StreamCompletion();
