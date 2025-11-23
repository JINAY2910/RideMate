import { useEffect, useState, useRef } from 'react';
import { initSocket, getSocket, joinRideRoom, leaveRideRoom, sendLocationUpdate, onDriverLocationUpdate, offDriverLocationUpdate, disconnectSocket } from '../services/socket';
import { LocationPoint } from '../context/AppContext';

interface UseLiveTrackingOptions {
  rideId: string | null;
  authToken: string | null;
  userId: string | null;
  userRole: 'driver' | 'rider' | null;
  isDriver: boolean;
  updateInterval?: number; // in milliseconds, default 5000 (5 seconds)
}

interface UseLiveTrackingReturn {
  driverLocation: LocationPoint | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
}

/**
 * Hook for live location tracking
 * - Drivers: Sends their GPS location every few seconds
 * - Riders: Receives driver location updates
 */
export const useLiveTracking = ({
  rideId,
  authToken,
  userId,
  userRole,
  isDriver,
  updateInterval = 5000,
}: UseLiveTrackingOptions): UseLiveTrackingReturn => {
  const [driverLocation, setDriverLocation] = useState<LocationPoint | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locationWatchIdRef = useRef<number | null>(null);
  const socketInitializedRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    if (!authToken || !userId || !userRole || socketInitializedRef.current) {
      return;
    }

    try {
      initSocket(authToken, userId, userRole);
      socketInitializedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize socket connection');
    }
  }, [authToken, userId, userRole]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
        locationWatchIdRef.current = null;
      }
      if (locationUpdateHandlerRef.current) {
        offDriverLocationUpdate(locationUpdateHandlerRef.current);
        locationUpdateHandlerRef.current = null;
      }
      if (rideId) {
        leaveRideRoom(rideId);
      }
    };
  }, [rideId]);

  // Store location update handler for cleanup
  const locationUpdateHandlerRef = useRef<((data: { rideId: string; location: { lat: number; lng: number }; timestamp: string }) => void) | null>(null);

  const startTracking = () => {
    if (!rideId) {
      setError('No ride ID provided');
      return;
    }

    const socket = getSocket();
    if (!socket || !socket.connected) {
      setError('Socket not connected. Please try again.');
      return;
    }

    setError(null);
    setIsTracking(true);
    joinRideRoom(rideId);

    if (isDriver) {
      // Driver: Start sending location updates
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setIsTracking(false);
        return;
      }

      const sendLocation = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        sendLocationUpdate(rideId, latitude, longitude);
      };

      const handleError = (err: GeolocationPositionError) => {
        console.error('Geolocation error:', err);
        setError(`Location error: ${err.message}`);
      };

      // Get initial location
      navigator.geolocation.getCurrentPosition(sendLocation, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      // Watch position and send updates
      locationWatchIdRef.current = navigator.geolocation.watchPosition(
        sendLocation,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: updateInterval,
          maximumAge: 2000,
        }
      );
    } else {
      // Rider: Listen for driver location updates
      const handleLocationUpdate = (data: { rideId: string; location: { lat: number; lng: number }; timestamp: string }) => {
        if (data.rideId === rideId) {
          setDriverLocation({ lat: data.location.lat, lng: data.location.lng });
        }
      };

      locationUpdateHandlerRef.current = handleLocationUpdate;
      onDriverLocationUpdate(handleLocationUpdate);
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    
    if (locationWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }

    // Remove location update listener for riders
    if (locationUpdateHandlerRef.current) {
      offDriverLocationUpdate(locationUpdateHandlerRef.current);
      locationUpdateHandlerRef.current = null;
    }

    if (rideId) {
      leaveRideRoom(rideId);
    }
  };

  // Auto-start tracking for riders when rideId is available
  useEffect(() => {
    if (!isDriver && rideId && authToken && userId && userRole && !isTracking) {
      const socket = getSocket();
      if (socket?.connected) {
        // Use a small delay to ensure socket is fully ready
        const timer = setTimeout(() => {
          startTracking();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideId, isDriver, authToken, userId, userRole, isTracking]);

  return {
    driverLocation,
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
};

