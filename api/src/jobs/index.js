const cron = require('node-cron');
const logger = require('../utils/logger');
const youtubeBatchProcessor = require('./youtubeBatchProcessor');

class JobScheduler {
  constructor() {
    this.jobs = new Map();
  }

  start() {
    // YouTube batch processing - every 4 hours
    this.schedule('youtube-batch', '0 */4 * * *', () =>
      youtubeBatchProcessor.processPendingStreams()
    );

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
