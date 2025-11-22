import { useEffect, useState } from 'react';
import { ArrowLeft, Users, Clock, Car } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import { rideApi, Ride } from '../services/rides';

export default function MyRides() {
  const { navigateTo, userRole, userName, setActiveRideId, vehicles, rideVehicles } = useApp();
  const isDriver = userRole === 'driver';
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userName) {
      setRides([]);
      setLoading(false);
      return;
    }
    const params = isDriver ? { driver: userName } : { participant: userName };
    const fetchRides = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await rideApi.list(params);
        setRides(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load rides.');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [isDriver, userName]);

  return (
    <div className="min-h-screen bg-white p-6">
      <button onClick={() => navigateTo('dashboard')} className="mb-8 flex items-center text-black hover:opacity-70">
        <ArrowLeft size={24} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-black">Upcoming Rides</h1>

        {error && (
          <div className="mb-4 rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-600 font-semibold">
            Loading your rides...
          </div>
        ) : rides.length === 0 ? (
          <div className="rounded-2xl border-2 border-black p-6 text-center">
            <p className="text-lg font-semibold text-black mb-2">No rides yet</p>
            <p className="text-sm text-gray-600">
              {isDriver ? 'Create a ride to get started.' : 'Book a ride from the search screen and it will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => {
              const highlightStatus = ride.status === 'Active' || ride.status === 'Confirmed';
              const riderCount = ride.requests?.filter((r) => r.status === 'Approved').length ?? 0;
              const vehicleId = rideVehicles[ride._id];
              const vehicle = vehicleId ? vehicles.find(v => v._id === vehicleId) : null;

              const handleNavigateToRide = () => {
                setActiveRideId(ride._id);
                navigateTo('ride-details');
              };

              return (
                <Card key={ride._id} onClick={handleNavigateToRide}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-black">
                        {ride.start.label} → {ride.destination.label}
                      </h3>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <Clock size={16} className="mr-1" />
                        <span>
                          {ride.date} at {ride.time}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium border-2 border-black rounded-full ${
                        highlightStatus ? 'bg-black text-white' : 'bg-white text-black'
                      }`}
                    >
                      {ride.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Users size={20} className="text-black mr-2" />
                      {isDriver ? (
                        <span className="font-medium">
                          {riderCount} rider{riderCount !== 1 ? 's' : ''} joined
                        </span>
                      ) : (
                        <div className="text-sm">
                          <p className="font-semibold text-black">Driver: {ride.driver.name}</p>
                          <p className="text-gray-600">
                            Seats left: {Math.max(ride.seats.available, 0)} / {ride.seats.total}
                          </p>
                        </div>
                      )}
                    </div>

                    {vehicle && (
                      <div className="flex items-start pt-2 border-t border-gray-200">
                        <Car size={20} className="text-black mr-2 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-black">Vehicle Details</p>
                          <p className="text-gray-600">
                            {vehicle.registrationNumber} • {vehicle.vehicleType}
                          </p>
                          {vehicle.make && vehicle.model && (
                            <p className="text-gray-600">
                              {vehicle.make} {vehicle.model}
                            </p>
                          )}
                          {vehicle.color && (
                            <p className="text-gray-600">Color: {vehicle.color}</p>
                          )}
                          <p className="text-gray-600">Seating: {vehicle.seatingLimit} seats</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
