require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const locationRoutes = require('./routes/locationRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RideMate API is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));

    if (userId && userId !== user._id.toString()) {
      return next(new Error('User ID mismatch'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;

    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Store active ride rooms
const rideRooms = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.userRole})`);

  socket.on('join-ride', ({ rideId }) => {
    if (!rideId) {
      socket.emit('error', { message: 'Ride ID is required' });
      return;
    }

    const roomName = `ride:${rideId}`;
    socket.join(roomName);

    if (!rideRooms.has(rideId)) {
      rideRooms.set(rideId, new Set());
    }
    rideRooms.get(rideId).add(socket.id);

    socket.emit('joined-ride', { rideId });
  });

  socket.on('leave-ride', ({ rideId }) => {
    if (!rideId) return;

    const roomName = `ride:${rideId}`;
    socket.leave(roomName);

    if (rideRooms.has(rideId)) {
      rideRooms.get(rideId).delete(socket.id);
      if (rideRooms.get(rideId).size === 0) rideRooms.delete(rideId);
    }
  });

  socket.on('driver-location', ({ rideId, location, timestamp }) => {
    if (!rideId || !location?.lat || !location?.lng) {
      socket.emit('error', { message: 'Invalid location data' });
      return;
    }

    if (socket.userRole !== 'driver') {
      socket.emit('error', { message: 'Only drivers can send location updates' });
      return;
    }

    const roomName = `ride:${rideId}`;
    socket.to(roomName).emit('driver-location-update', {
      rideId,
      location,
      timestamp: timestamp || new Date().toISOString(),
      driverId: socket.userId,
      driverName: socket.userName,
    });
  });

  socket.on('disconnect', () => {
    for (const [rideId, socketSet] of rideRooms.entries()) {
      socketSet.delete(socket.id);
      if (socketSet.size === 0) rideRooms.delete(rideId);
    }
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});
