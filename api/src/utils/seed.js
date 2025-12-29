const bcrypt = require('bcrypt');
const User = require('../models/User');
const Unit = require('../models/Unit');
const StreamEvent = require('../models/StreamEvent');
const AttendanceRecord = require('../models/AttendanceRecord');
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

    // Create past stream events with attendance
    const now = new Date();
    const pastEvents = [];

    // Create 4 past Sunday events
    for (let i = 1; i <= 4; i++) {
      const eventDate = new Date(now);
      eventDate.setDate(now.getDate() - i * 7); // Go back i weeks
      eventDate.setHours(10, 0, 0, 0); // 10 AM

      const streamEvent = await StreamEvent.create({
        unitId: unit._id,
        scheduledDateTime: eventDate,
        timezone: 'America/New_York',
        youtubeEventId: `mock-event-${i}`,
        youtubeStreamUrl: `https://youtube.com/watch?v=mock-${i}`,
        streamKey: `mock-key-${i}`,
        status: 'completed',
        isSpecialEvent: false,
      });

      pastEvents.push(streamEvent);
    }

    // Sample attendee names
    const attendeeNames = [
      'John Smith',
      'Mary Johnson',
      'David Wilson',
      'Sarah Brown',
      'Michael Davis',
      'Jennifer Miller',
      'Robert Garcia',
      'Lisa Rodriguez',
      'William Martinez',
      'Elizabeth Anderson',
      'James Taylor',
      'Patricia Thomas',
    ];

    // Create attendance records for each event
    for (const event of pastEvents) {
      // Random number of attendees (5-10 per event)
      const numAttendees = Math.floor(Math.random() * 6) + 5;
      const selectedNames = attendeeNames.sort(() => 0.5 - Math.random()).slice(0, numAttendees);

      for (const name of selectedNames) {
        await AttendanceRecord.create({
          streamEventId: event._id,
          attendeeName: name,
          attendeeCount: Math.floor(Math.random() * 4) + 1, // 1-4 people per family
          submittedAt: new Date(event.scheduledDateTime.getTime() + Math.random() * 3600000), // Random time during the hour
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        });
      }
    }

    logger.info('Development seed data created successfully');
    logger.info('Test login: admin@example.com / password123');
    logger.info(`Created ${pastEvents.length} past events with attendance data`);
  } catch (error) {
    logger.error('Failed to seed development data:', error);
  }
};

module.exports = { seedDevelopmentData };
