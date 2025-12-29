const mongoose = require('mongoose');
const config = require('../config');

const migrateDateTime = async () => {
  try {
    await mongoose.connect(config.database.url);
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('streamevents');

    // Find all documents with old field structure
    const oldEvents = await collection
      .find({
        scheduledDate: { $exists: true },
        scheduledTime: { $exists: true },
        scheduledDateTime: { $exists: false },
      })
      .toArray();

    // eslint-disable-next-line no-console
    console.log(`Found ${oldEvents.length} events to migrate`);

    for (const event of oldEvents) {
      // Combine date and time (assuming time is in format like "10:00 AM")
      const dateStr = event.scheduledDate.toISOString().split('T')[0];
      const timeStr = event.scheduledTime;

      // Convert time to 24-hour format for parsing
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':');
      let hourNum = parseInt(hours);

      if (period === 'PM' && hourNum !== 12) hourNum += 12;
      if (period === 'AM' && hourNum === 12) hourNum = 0;

      const scheduledDateTime = new Date(
        `${dateStr}T${hourNum.toString().padStart(2, '0')}:${minutes}:00.000Z`
      );

      await collection.updateOne(
        { _id: event._id },
        {
          $set: {
            scheduledDateTime,
            timezone: 'America/New_York', // Default timezone
          },
          $unset: {
            scheduledDate: '',
            scheduledTime: '',
          },
        }
      );

      // eslint-disable-next-line no-console
      console.log(
        `Migrated event ${event._id}: ${dateStr} ${timeStr} -> ${scheduledDateTime.toISOString()}`
      );
    }

    // eslint-disable-next-line no-console
    console.log('Migration completed successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

migrateDateTime();
