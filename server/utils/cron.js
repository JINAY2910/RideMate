const cron = require('node-cron');
const Ride = require('../models/Ride');

const cleanupExpiredRides = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            console.log('Running auto-delete check for expired rides...');
            const rides = await Ride.find({ isActive: true });
            const now = new Date();

            for (const ride of rides) {
                // Parse ride date and time
                // Format: date "YYYY-MM-DD", time "HH:MM"
                const rideDateTimeStr = `${ride.date}T${ride.time}`;
                const rideStart = new Date(rideDateTimeStr);

                // If date parsing fails, skip
                if (isNaN(rideStart.getTime())) {
                    console.error(`Invalid date format for ride ${ride._id}: ${rideDateTimeStr}`);
                    continue;
                }

                // Calculate end time
                const durationHours = ride.duration || 2;
                const rideEnd = new Date(rideStart.getTime() + durationHours * 60 * 60 * 1000);

                if (now > rideEnd) {
                    console.log(`Deleting expired ride ${ride._id}. Ended at ${rideEnd.toISOString()}`);
                    await Ride.findByIdAndDelete(ride._id);
                }
            }
        } catch (error) {
            console.error('Error in auto-delete cron job:', error);
        }
    });
};

module.exports = cleanupExpiredRides;
