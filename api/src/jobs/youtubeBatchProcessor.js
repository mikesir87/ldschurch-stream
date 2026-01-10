const StreamEvent = require('../models/StreamEvent');
const youtubeService = require('../services/youtubeService');
const logger = require('../utils/logger');

class YouTubeBatchProcessor {
  async processPendingStreams() {
    const correlationId = require('uuid').v4();
    const jobLogger = logger.child({
      correlationId,
      job: 'youtube-batch-processor',
    });

    jobLogger.info('Starting YouTube batch processing');

    try {
      // Find pending streams scheduled within next 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const pendingStreams = await StreamEvent.find({
        status: 'pending',
        isSpecialEvent: false,
        scheduledDateTime: { $lte: sevenDaysFromNow },
      })
        .populate('unitId')
        .sort({ scheduledDateTime: 1 })
        .limit(50); // Process max 50 at a time to manage quota

      if (pendingStreams.length === 0) {
        jobLogger.info('No pending streams to process');
        return;
      }

      jobLogger.info(`Processing ${pendingStreams.length} pending streams`);

      // Pre-validate YouTube authentication to trigger token refresh if needed
      try {
        const youtubeService = require('../services/youtubeService');
        await youtubeService.initialize();
        jobLogger.info('YouTube service authentication validated');
      } catch (error) {
        jobLogger.error('YouTube authentication failed before batch processing', {
          error: error.message,
        });
        throw error;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const stream of pendingStreams) {
        try {
          await this.processStream(stream, jobLogger);
          successCount++;
        } catch (error) {
          errorCount++;
          jobLogger.error('Failed to process stream', {
            streamId: stream._id,
            unitName: stream.unitId.name,
            error: error.message,
          });
        }
      }

      jobLogger.info('YouTube batch processing completed', {
        total: pendingStreams.length,
        success: successCount,
        errors: errorCount,
      });
    } catch (error) {
      jobLogger.error('YouTube batch processing failed', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async processStream(stream, parentLogger) {
    const streamLogger = parentLogger.child({
      streamId: stream._id,
      unitId: stream.unitId._id,
      unitName: stream.unitId.name,
    });

    streamLogger.info('Processing stream for YouTube creation');

    try {
      const title = `${stream.unitId.name} - ${stream.scheduledDateTime.toLocaleDateString()}`;
      const youtubeEvent = await youtubeService.createLiveEvent(title, stream.scheduledDateTime);

      // Update stream with YouTube details
      await StreamEvent.findByIdAndUpdate(stream._id, {
        youtubeEventId: youtubeEvent.eventId,
        youtubeStreamUrl: youtubeEvent.streamUrl,
        streamKey: youtubeEvent.streamKey,
        status: 'scheduled',
      });

      streamLogger.info('Stream processed successfully', {
        youtubeEventId: youtubeEvent.eventId,
      });
    } catch (error) {
      // Mark stream as failed but don't delete it
      await StreamEvent.findByIdAndUpdate(stream._id, {
        status: 'cancelled',
        specialEventMessage: `YouTube creation failed: ${error.message}`,
      });

      streamLogger.error('Failed to create YouTube event for stream', {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new YouTubeBatchProcessor();
