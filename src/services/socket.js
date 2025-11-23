import { io } from 'socket.io-client';

// Get the server URL from environment or default to localhost:5000
const getServerUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
  // Remove /api suffix if present, as socket.io connects to the base server
  return apiUrl.replace(/\/api\/?$/, '');
};

let socket = null;

/**
 * Initialize socket connection
 * @param {string} token - JWT authentication token
 * @param {string} userId - Current user ID
 * @param {string} userRole - Current user role ('driver' or 'rider')
 */
export const initSocket = (token, userId, userRole) => {
  if (socket?.connected) {
    console.log('Socket already connected');
    return socket;
  }

  const serverUrl = getServerUrl();
  console.log('Connecting to socket server:', serverUrl);

  socket = io(serverUrl, {
    auth: {
      token,
      userId,
      userRole,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join a ride room for tracking
 * @param {string} rideId - The ride ID to track
 */
export const joinRideRoom = (rideId) => {
  if (!socket || !socket.connected) {
    console.error('Socket not connected. Call initSocket first.');
    return;
  }
  socket.emit('join-ride', { rideId });
  console.log('Joined ride room:', rideId);
};

/**
 * Leave a ride room
 * @param {string} rideId - The ride ID to stop tracking
 */
export const leaveRideRoom = (rideId) => {
  if (!socket || !socket.connected) {
    return;
  }
  socket.emit('leave-ride', { rideId });
  console.log('Left ride room:', rideId);
};

/**
 * Send driver location update
 * @param {string} rideId - The ride ID
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
export const sendLocationUpdate = (rideId, lat, lng) => {
  if (!socket || !socket.connected) {
    console.error('Socket not connected');
    return;
  }
  socket.emit('driver-location', {
    rideId,
    location: { lat, lng },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Listen for driver location updates
 * @param {Function} callback - Callback function that receives { rideId, location: { lat, lng }, timestamp }
 */
export const onDriverLocationUpdate = (callback) => {
  if (!socket || !socket.connected) {
    console.error('Socket not connected');
    return;
  }
  socket.on('driver-location-update', callback);
};

/**
 * Remove driver location update listener
 */
export const offDriverLocationUpdate = (callback) => {
  if (!socket) return;
  socket.off('driver-location-update', callback);
};

