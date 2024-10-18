const cron = require('node-cron');
const Booking = require('../models/Booking');
const { assignDriver } = require('./jobAssignment');

const schedulerService = {
  init: () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      try {
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

        const upcomingBookings = await Booking.find({
          status: 'scheduled',
          scheduledTime: { $gte: now, $lt: fiveMinutesFromNow }
        });

        for (const booking of upcomingBookings) {
            booking.status = 'assigned';
            await booking.save();
        }
      } catch (error) {
            // Handle case when no driver is available
            booking.status = 'cancelled';
            await booking.save();
            // Notify user about cancellation
        console.error('Error processing scheduled bookings:', error);
      }
    });
  }
};

module.exports = schedulerService;