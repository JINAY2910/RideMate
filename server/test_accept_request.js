const mongoose = require('mongoose');
const Ride = require('./models/Ride');
const Booking = require('./models/Booking');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const testAcceptRequest = async () => {
    await connectDB();

    try {
        // Find a ride with pending requests
        let ride = await Ride.findOne({ 'requests.status': 'Pending' });

        if (!ride) {
            console.log('No rides with pending requests found. Creating dummy data...');
            const users = await User.find().limit(2);
            if (users.length < 2) {
                console.error('Need at least 2 users to run test');
                process.exit(1);
            }
            const driver = users[0];
            const rider = users[1];

            ride = await Ride.create({
                driver: driver._id,
                from: 'Test From',
                to: 'Test To',
                date: '2025-12-25',
                time: '10:00',
                price: 100,
                seatsAvailable: 3,
                startCoordinates: { coordinates: [0, 0] },
                destCoordinates: { coordinates: [0, 0] },
                driverLocation: { coordinates: [0, 0] }
            });

            console.log(`Created dummy ride: ${ride._id}`);

            ride.requests.push({
                rider: rider._id,
                name: rider.name,
                status: 'Pending',
                seatsRequested: 2
            });
            await ride.save();

            // Create booking
            await Booking.create({
                ride: ride._id,
                rider: rider._id,
                seatsBooked: 2,
                totalPrice: 200,
                status: 'Pending'
            });

            console.log('Created dummy request and booking');

            // Re-fetch to get subdocument with ID
            ride = await Ride.findById(ride._id);
        }

        console.log(`Found ride: ${ride._id}`);
        const request = ride.requests.find(r => r.status === 'Pending');
        console.log(`Found pending request: ${request._id} from rider ${request.rider}`);

        const status = 'Approved';

        // Simulate the logic from rideController.js
        console.log(`Processing request ${request._id} for ride ${ride._id}. Status: ${status}, Current: ${request.status}`);

        if (request.status === 'Approved' && status === 'Approved') {
            console.log('Request is already approved');
            return;
        }

        if (status === 'Approved' && request.status !== 'Approved') {
            const seatsToBook = request.seatsRequested || 1;
            console.log(`Approving request. Seats requested: ${seatsToBook}, Available: ${ride.seatsAvailable}`);

            if (ride.seatsAvailable < seatsToBook) {
                console.error('Not enough seats available');
                return;
            }

            ride.seatsAvailable -= seatsToBook;

            const existingParticipant = ride.participants.find(
                p => p.rider && p.rider.toString() === request.rider.toString()
            );

            if (!existingParticipant) {
                ride.participants.push({
                    rider: request.rider,
                    name: request.name,
                    status: 'Confirmed',
                    seatsBooked: seatsToBook,
                });
            }
        }

        request.status = status;

        await ride.save();
        console.log('Ride saved successfully');

        const bookingUpdate = await Booking.findOneAndUpdate(
            { ride: ride._id, rider: request.rider },
            { status: status },
            { new: true }
        );

        if (!bookingUpdate) {
            console.warn(`No booking found for ride ${ride._id} and rider ${request.rider}`);
        } else {
            console.log(`Booking updated: ${bookingUpdate._id}`);
        }

        // Clean up
        // await Ride.findByIdAndDelete(ride._id);
        // await Booking.deleteMany({ ride: ride._id });
        // console.log('Cleaned up test data');

    } catch (error) {
        console.error('Error in test script:', error);
    } finally {
        mongoose.connection.close();
    }
};

testAcceptRequest();
