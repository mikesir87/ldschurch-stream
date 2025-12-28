const bcrypt = require('bcrypt');
const Unit = require('../models/Unit');
const User = require('../models/User');
const logger = require('../utils/logger');

const seedDevelopmentData = async () => {
  try {
    // Check if unit with ID 1 already exists
    const existingUnit = await Unit.findById('000000000000000000000001');
    if (existingUnit) {
      logger.info('Development unit already exists, skipping seed');
      return;
    }

    // Create development unit
    const unit = new Unit({
      _id: '000000000000000000000001',
      name: 'Development Ward',
      subdomain: 'dev-ward',
      leadershipEmails: ['leadership@example.com'],
      isActive: true,
    });
    await unit.save();

    // Create development user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = new User({
      email: 'specialist@example.com',
      name: 'Dev Specialist',
      hashedPassword,
      units: [unit._id],
      role: 'specialist',
      isActive: true,
    });
    await user.save();

    logger.info('Development data seeded successfully', {
      unitId: unit._id,
      unitName: unit.name,
      userEmail: user.email,
    });
  } catch (error) {
    logger.error('Failed to seed development data:', error);
  }
};

module.exports = { seedDevelopmentData };
