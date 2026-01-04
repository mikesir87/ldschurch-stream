const cron = require('node-cron');
const logger = require('../utils/logger');
const config = require('../config');
const youtubeBatchProcessor = require('./youtubeBatchProcessor');
const reportGenerator = require('./reportGenerator');
const streamCompletion = require('./streamCompletion');

class JobScheduler {
  constructor() {
    this.jobs = new Map();
  }

  start() {
    // YouTube batch processing - configurable schedule
    this.schedule('youtube-batch', config.cron.youtubeBatchSchedule, () =>
      youtubeBatchProcessor.processPendingStreams()
    );

    // Stream completion check - every 30 minutes
    this.schedule('stream-completion', '*/30 * * * *', () =>
      streamCompletion.markCompletedStreams()
    );

    // Weekly reports - Monday morning
    this.schedule('weekly-reports', config.cron.reportSchedule, () => reportGenerator.run());

    logger.info('Job scheduler started');
  }

  schedule(name, cronExpression, task) {
    const job = cron.schedule(
      cronExpression,
      async () => {
        logger.info(`Starting job: ${name}`);
        try {
          await task();
          logger.info(`Completed job: ${name}`);
        } catch (error) {
          logger.error(`Job failed: ${name}`, { error: error.message });
        }
      },
      { scheduled: false }
    );

    this.jobs.set(name, job);
    job.start();
  }

  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });
  }
}

module.exports = { JobScheduler };
