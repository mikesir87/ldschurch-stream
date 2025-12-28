const bcrypt = require('bcrypt');
const User = require('../models/User');
const Unit = require('../models/Unit');
const config = require('../config');
const logger = require('./logger');

const seedDevelopmentData = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    if (existingUser) {
      logger.info('Development seed data already exists');
      return;
    }

    // Create test unit
    const unit = await Unit.create({
      name: 'Test Ward',
      subdomain: 'test-unit',
      leadershipEmails: ['leadership@example.com'],
      isActive: true,
    });

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', config.auth.bcryptRounds);
    await User.create({
      email: 'admin@example.com',
      name: 'Test Admin',
      hashedPassword,
      units: [unit._id],
      role: 'global_admin',
      isActive: true,
    });

    logger.info('Development seed data created successfully');
    logger.info('Test login: admin@example.com / password123');
  } catch (error) {
    logger.error('Failed to seed development data:', error);
  }
};

module.exports = { seedDevelopmentData };
