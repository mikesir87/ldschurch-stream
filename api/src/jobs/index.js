const cron = require('node-cron');
const logger = require('../utils/logger');
const config = require('../config');
const youtubeBatchProcessor = require('./youtubeBatchProcessor');

class JobScheduler {
  constructor() {
    this.jobs = new Map();
  }

  start() {
    // YouTube batch processing - configurable schedule
    this.schedule('youtube-batch', config.cron.youtubeBatchSchedule, () =>
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
