import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Star, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';

interface Ride {
  _id: string;
  driver: {
    name: string;
    rating: number;
  };
  start: {
    label: string;
  };
  destination: {
    label: string;
  };
  date: string;
  time: string;
  seats: {
    available: number;
    total: number;
  };
  notes: string;
  createdAt: string;
}

export default function RideHistory() {
  const { navigateTo } = useApp();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/rides');
        if (!response.ok) throw new Error('Failed to fetch rides.');
        const data: Ride[] = await response.json();
        setRides(data);
      } catch (err:any) {
        setError(err.message || 'Error fetching rides');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      <button
        onClick={() => navigateTo('dashboard')}
        className="mb-8 flex items-center text-black hover:opacity-70"
        aria-label="Back to Dashboard"
      >
        <ArrowLeft size={24} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-black">Ride History</h1>

        {loading && <p className="text-gray-600">Loading rides...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && rides.length === 0 && (
          <p className="text-gray-600">No rides found.</p>
        )}

        <div className="space-y-4">
          {rides.map((ride) => (
            <Card key={ride._id}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-start mb-2">
                    <MapPin size={20} className="text-black mr-2 mt-1" />
                    <div>
                      <p className="font-bold text-black">{ride.start?.label || '-'}</p>
                      <p className="text-sm text-gray-600">to</p>
                      <p className="font-bold text-black">{ride.destination?.label || '-'}</p>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 text-sm font-medium bg-black text-white rounded-full">
                  Completed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <Calendar size={16} className="text-black mr-2" />
                  <span className="text-sm text-gray-600">
                    {ride.date} {ride.time}
                  </span>
                </div>
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{ride.driver?.rating?.toFixed(1)}</span>
                </div>
                <div className="flex items-center">
                  <Users size={16} className="text-black mr-1" />
                  <span className="text-sm">
                    {Math.max(ride.seats?.available ?? 0, 0)} of {ride.seats?.total ?? 0} seats
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">{ride.notes}</span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Driver: <span className="font-bold text-black">{ride.driver?.name}</span>
                </p>
                <span className="text-xs text-gray-500">
                  Added: {new Date(ride.createdAt).toLocaleString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
