import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';

export default function GPSTracking() {
  const { navigateTo } = useApp();

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <button onClick={() => navigateTo('ride-details')} className="mb-8 flex items-center text-black hover:opacity-70">
        <ArrowLeft size={24} className="mr-2" />
        Back to Ride Details
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-black">Live Tracking</h1>

        <div className="relative border-2 border-black rounded-lg overflow-hidden mb-6" style={{ height: '500px' }}>
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <MapPin size={64} className="text-black mx-auto mb-4" />
              <p className="text-xl font-medium text-black">Map View</p>
              <p className="text-sm text-gray-600 mt-2">Live location tracking</p>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-6 h-6 bg-black rounded-full animate-ping absolute"></div>
              <div className="w-6 h-6 bg-black rounded-full relative"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 border-2 border-black rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Current Location</p>
            <p className="font-bold text-black">Downtown Plaza</p>
          </div>
          <div className="p-4 border-2 border-black rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Destination</p>
            <p className="font-bold text-black">City Airport</p>
          </div>
          <div className="p-4 border-2 border-black rounded-lg">
            <p className="text-sm text-gray-600 mb-1">ETA</p>
            <p className="font-bold text-black">25 minutes</p>
          </div>
          <div className="p-4 border-2 border-black rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Distance</p>
            <p className="font-bold text-black">12.5 km</p>
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
