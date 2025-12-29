const mongoose = require('mongoose');
const StreamEvent = require('../models/StreamEvent');
const AttendanceRecord = require('../models/AttendanceRecord');
const Unit = require('../models/Unit');

async function setupTestData() {
  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0); // 10 AM yesterday

    // Find a unit to use for testing
    const unit = await Unit.findOne();
    if (!unit) {
      // eslint-disable-next-line no-console
      console.log('No units found. Create a unit first.');
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`Using unit: ${unit.name}`);

    // Ensure unit has leadership emails
    if (!unit.leadershipEmails || unit.leadershipEmails.length === 0) {
      unit.leadershipEmails = ['test@example.com'];
      await unit.save();
      // eslint-disable-next-line no-console
      console.log('Added test leadership email');
    }

    // Create a completed stream event for yesterday
    const streamEvent = await StreamEvent.create({
      unitId: unit._id,
      scheduledDateTime: yesterday,
      status: 'completed',
      reportSent: false,
      youtubeEventId: 'test-youtube-id',
    });

    // eslint-disable-next-line no-console
    console.log(`Created stream event: ${streamEvent._id}`);

    // Add some test attendance records
    const attendanceRecords = [
      { streamEventId: streamEvent._id, attendeeName: 'John Smith', attendeeCount: 2 },
      { streamEventId: streamEvent._id, attendeeName: 'Jane Doe', attendeeCount: 1 },
      { streamEventId: streamEvent._id, attendeeName: 'Bob Johnson', attendeeCount: 3 },
    ];

    await AttendanceRecord.insertMany(attendanceRecords);
    // eslint-disable-next-line no-console
    console.log('Added test attendance records');

    // eslint-disable-next-line no-console
    console.log('\nTest data setup complete!');
    // eslint-disable-next-line no-console
    console.log('Now trigger the report generation from the admin panel.');
    // eslint-disable-next-line no-console
    console.log('Check MailHog at http://mail.traefik.me for the email.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error setting up test data:', error);
  }
}

module.exports = { setupTestData };

// Run if called directly
if (require.main === module) {
  const config = require('../config');
  mongoose.connect(config.database.url).then(() => {
    setupTestData().then(() => {
      mongoose.disconnect();
    });
  });
}
