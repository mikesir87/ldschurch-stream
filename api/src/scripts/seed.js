const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Unit = require('../models/Unit');
const config = require('../config');

const seedData = async () => {
  try {
    await mongoose.connect(config.database.url);
    console.log('Connected to MongoDB');

    // Create a test unit
    let unit = await Unit.findOne({ subdomain: 'test-unit' });
    if (!unit) {
      unit = await Unit.create({
        name: 'Test Ward',
        subdomain: 'test-unit',
        leadershipEmails: ['leadership@example.com'],
        isActive: true,
      });
      console.log('Created test unit:', unit.name);
    }

    // Create a test user
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 12);

      const user = await User.create({
        email: 'admin@example.com',
        name: 'Test Admin',
        hashedPassword,
        units: [unit._id],
        role: 'global_admin',
        isActive: true,
      });

      console.log('Created test user:', user.email);
      console.log('Password: password123');
    } else {
      console.log('Test user already exists:', existingUser.email);
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedData();
