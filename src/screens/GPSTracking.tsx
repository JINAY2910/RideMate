import { ArrowLeft, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import LiveMap from '../components/LiveMap';
import DriverTracker from '../components/DriverTracker';

export default function GPSTracking() {
  const { navigateTo, userRole, activeRideId } = useApp();

  if (!activeRideId) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 flex flex-col items-center justify-center">
        <p className="text-lg font-semibold text-gray-600 mb-4">No active ride selected.</p>
        <Button onClick={() => navigateTo('dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <button onClick={() => navigateTo('ride-details')} className="mb-8 flex items-center text-black hover:opacity-70">
        <ArrowLeft size={24} className="mr-2" />
        Back to Ride Details
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-black">
          {userRole === 'driver' ? 'Start Trip & Share Location' : 'Live Tracking'}
        </h1>

        <div className="mb-6">
          {userRole === 'driver' ? (
            <div className="space-y-6">
              <DriverTracker rideId={activeRideId} />
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                <p className="font-semibold">Driver Mode Active</p>
                <p className="text-sm">Your location is being shared with riders in real-time.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <LiveMap rideId={activeRideId} />
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <p className="font-semibold">Live Tracking Active</p>
                <p className="text-sm">You are viewing the driver's real-time location.</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 border-2 border-black rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Current Location</p>
            <p className="font-bold text-black">Live Update</p>
          </div>
          <div className="p-4 border-2 border-black rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Destination</p>
            <p className="font-bold text-black">City Airport</p>
          </div>
          <div className="p-4 border-2 border-black rounded-lg">
            <p className="text-sm text-gray-600 mb-1">ETA</p>
            <p className="font-bold text-black">Calculating...</p>
          </div>
          <div className="p-4 border-2 border-black rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Distance</p>
            <p className="font-bold text-black">-- km</p>
          </div>
        </div>

        <Button fullWidth onClick={() => navigateTo('rating')}>
          <Navigation size={20} className="inline mr-2" />
          Complete Trip
        </Button>
      </div>
    </div>
  );
}
