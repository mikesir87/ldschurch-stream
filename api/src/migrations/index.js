const fs = require('fs');
const path = require('path');
const Migration = require('../models/Migration');
const logger = require('../utils/logger');

class MigrationRunner {
  async runPending() {
    const files = fs
      .readdirSync(__dirname)
      .filter(f => f.match(/^\d{3}-.*\.js$/))
      .sort();

    const completedMigrations = await Migration.find({}).select('name');
    const completedNames = completedMigrations.map(m => m.name);

    let ranCount = 0;

    for (const file of files) {
      if (!completedNames.includes(file)) {
        logger.info(`Running migration: ${file}`);

        try {
          const migration = require(path.join(__dirname, file));
          await migration.up();

          await Migration.create({ name: file });
          ranCount++;

          logger.info(`Completed migration: ${file}`);
        } catch (error) {
          logger.error(`Migration failed: ${file}`, { error: error.message });
          throw error;
        }
      }
    }

    if (files.length === 0) {
      logger.info('No migrations found');
    } else {
      logger.info(
        `Migration check complete. ${ranCount} new migrations applied, ${completedNames.length} already completed.`
      );
    }
  }
}

module.exports = { MigrationRunner };
