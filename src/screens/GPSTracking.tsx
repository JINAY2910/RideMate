import { useEffect, useState } from 'react';
import { ArrowLeft, Navigation, Radio } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import LiveMap from '../components/LiveMap';
import { useLiveTracking } from '../hooks/useLiveTracking';
import { rideApi, Ride } from '../services/rides';

export default function GPSTracking() {
  const { navigateTo, activeRideId, authToken, userId, userRole } = useApp();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDriver = userRole === 'driver';

  const {
    driverLocation,
    isTracking,
    error: trackingError,
    startTracking,
    stopTracking,
  } = useLiveTracking({
    rideId: activeRideId,
    authToken,
    userId,
    userRole,
    isDriver,
    updateInterval: 5000, // Update every 5 seconds
  });

  // Fetch ride details
  useEffect(() => {
    if (!activeRideId) {
      setRide(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchRide = async () => {
      try {
        setLoading(true);
        setError(null);
        const rideData = await rideApi.getById(activeRideId);
        if (!cancelled) {
          setRide(rideData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load ride details');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRide();

    return () => {
      cancelled = true;
    };
  }, [activeRideId]);

  // Auto-start tracking for drivers when component mounts
  useEffect(() => {
    if (isDriver && activeRideId && !isTracking) {
      // Small delay to ensure socket is ready
      const timer = setTimeout(() => {
        startTracking();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isDriver, activeRideId, isTracking, startTracking]);

  const startLocation = ride
    ? {
        lat: ride.start.coordinates.lat,
        lng: ride.start.coordinates.lng,
      }
    : null;

  const destinationLocation = ride
    ? {
        lat: ride.destination.coordinates.lat,
        lng: ride.destination.coordinates.lng,
      }
    : null;

  // Calculate distance and ETA (simplified calculation)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceAndETA = () => {
    if (!driverLocation || !destinationLocation) {
      return { distance: null, eta: null };
    }

    const distance = calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      destinationLocation.lat,
      destinationLocation.lng
    );

    // Simple ETA calculation: assume average speed of 50 km/h
    const averageSpeed = 50; // km/h
    const etaMinutes = Math.round((distance / averageSpeed) * 60);

    return { distance: distance.toFixed(1), eta: etaMinutes };
  };

  const { distance, eta } = getDistanceAndETA();

  return (
    <div className="min-h-screen bg-white p-6">
      <button onClick={() => navigateTo('ride-details')} className="mb-8 flex items-center text-black hover:opacity-70">
        <ArrowLeft size={24} className="mr-2" />
        Back to Ride Details
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-black">Live Tracking</h1>
          {isDriver && (
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-600">
                {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {trackingError && (
          <div className="mb-6 rounded-2xl border-2 border-yellow-500 bg-yellow-50 p-4 text-sm font-semibold text-yellow-700">
            {trackingError}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center text-sm font-semibold text-gray-600">
            Loading ride details...
          </div>
        ) : !ride ? (
          <div className="rounded-2xl border-2 border-black p-6 text-center">
            <p className="text-lg font-semibold text-black mb-2">No ride selected</p>
            <p className="text-sm text-gray-600">Please select a ride to track.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <LiveMap
                start={startLocation}
                destination={destinationLocation}
                driverLocation={driverLocation}
                height={500}
                showRoute={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border-2 border-black rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Start Location</p>
                <p className="font-bold text-black">{ride.start.label}</p>
              </div>
              <div className="p-4 border-2 border-black rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Destination</p>
                <p className="font-bold text-black">{ride.destination.label}</p>
              </div>
              {driverLocation && (
                <>
                  <div className="p-4 border-2 border-black rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">ETA</p>
                    <p className="font-bold text-black">{eta ? `${eta} minutes` : 'Calculating...'}</p>
                  </div>
                  <div className="p-4 border-2 border-black rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Distance Remaining</p>
                    <p className="font-bold text-black">{distance ? `${distance} km` : 'Calculating...'}</p>
                  </div>
                </>
              )}
            </div>

            {isDriver && (
              <div className="mb-6 flex gap-3">
                {!isTracking ? (
                  <Button fullWidth onClick={startTracking}>
                    <Radio size={20} className="inline mr-2" />
                    Start Tracking
                  </Button>
                ) : (
                  <Button fullWidth variant="secondary" onClick={stopTracking}>
                    <Radio size={20} className="inline mr-2" />
                    Stop Tracking
                  </Button>
                )}
              </div>
            )}

            {!isDriver && !driverLocation && (
              <div className="mb-6 rounded-2xl border-2 border-yellow-500 bg-yellow-50 p-4 text-sm text-yellow-700">
                Waiting for driver to start tracking...
              </div>
            )}

            <Button fullWidth onClick={() => navigateTo('ride-details')}>
              <Navigation size={20} className="inline mr-2" />
              Back to Ride Details
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
