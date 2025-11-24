const mongoose = require('mongoose');
const Ride = require('./models/Ride');
const Booking = require('./models/Booking');
const User = require('./models/User');
const { updateRequestStatus } = require('./controllers/rideController');
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

const verifyFix = async () => {
    await connectDB();

    let driver, rider, ride;

    try {
        console.log('Creating test data...');

        // Create dummy users if needed or find existing
        const users = await User.find().limit(2);
        if (users.length < 2) {
            // Create dummy users
            driver = await User.create({ name: 'Test Driver', email: 'driver@test.com', password: 'password', role: 'driver' });
            rider = await User.create({ name: 'Test Rider', email: 'rider@test.com', password: 'password', role: 'rider' });
        } else {
            driver = users[0];
            rider = users[1];
        }

        // Create a dummy ride
        ride = await Ride.create({
            driver: driver._id,
            from: 'Test From',
            to: 'Test To',
            date: '2025-12-25',
            time: '10:00',
            price: 100,
            seatsAvailable: 3,
            startCoordinates: { type: 'Point', coordinates: [0, 0] },
            destCoordinates: { type: 'Point', coordinates: [0, 0] },
            driverLocation: { type: 'Point', coordinates: [0, 0] },
            isActive: true,
            requests: [{
                rider: rider._id,
                name: rider.name,
                status: 'Pending',
                seatsRequested: 2
            }]
        });

        console.log(`Created dummy ride: ${ride._id} with pending request`);

        // Create booking
        await Booking.create({
            ride: ride._id,
            rider: rider._id,
            seatsBooked: 2,
            totalPrice: 200,
            status: 'Pending'
        });

        const request = ride.requests[0];

        // Mock Request and Response
        const req = {
            params: {
                id: ride._id.toString(),
                requestId: request._id.toString()
            },
            user: {
                id: driver._id.toString(),
                role: 'driver'
            },
            body: {
                status: 'Approved'
            }
        };

        const res = {
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.data = data;
                return this;
            }
        };

        const next = (err) => {
            console.error('Controller called next with error:', err);
        };

        console.log('Calling updateRequestStatus controller...');
        await updateRequestStatus(req, res, next);

        if (res.statusCode && res.statusCode !== 200) {
            console.error('Controller returned error status:', res.statusCode, res.data);
        } else {
            console.log('Controller executed successfully.');
        }

        // Verify the result in DB
        const updatedRide = await Ride.findById(ride._id);
        const updatedRequest = updatedRide.requests.id(request._id);
        const participant = updatedRide.participants.find(p => p.rider.toString() === rider._id.toString());

        console.log('--- Verification Results ---');
        console.log(`Request Status: ${updatedRequest.status} (Expected: Approved)`);
        console.log(`Seats Available: ${updatedRide.seatsAvailable} (Expected: 1)`);
        console.log(`Participant Added: ${!!participant} (Expected: true)`);

        if (updatedRequest.status === 'Approved' && updatedRide.seatsAvailable === 1 && participant) {
            console.log('SUCCESS: Fix verified!');
        } else {
            console.error('FAILURE: Fix verification failed.');
        }

    } catch (error) {
        console.error('Error in verification script:', error);
    } finally {
        // Cleanup
        if (ride) {
            await Ride.findByIdAndDelete(ride._id);
            await Booking.deleteMany({ ride: ride._id });
            console.log('Cleaned up test data');
        }
        mongoose.connection.close();
    }
};

verifyFix();
