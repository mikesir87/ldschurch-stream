const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.database.url, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { connectDatabase };
