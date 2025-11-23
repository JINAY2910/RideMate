import { useEffect, useState } from 'react';
import { ArrowLeft, Star, Users, Car, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { Location } from '../services/locations';
import { rideApi, Ride } from '../services/rides';

export default function SearchRide() {
  const { navigateTo, setRideSummaryInput, setActiveRideId, vehicles, rideVehicles } = useApp();
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [requiredSeats, setRequiredSeats] = useState('');
  const [sameGender, setSameGender] = useState(false);
  const [showVehicleFilters, setShowVehicleFilters] = useState(false);
  const [filterVehicleType, setFilterVehicleType] = useState('');
  const [filterMake, setFilterMake] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRides = async (params?: Parameters<typeof rideApi.list>[0]) => {
    try {
      setLoading(true);
      setError(null);
      const results = await rideApi.list(params);
      setAllRides(results);
      applyVehicleFilters(results);
    } catch (err) {
      console.error('Error loading rides:', err);
      let errorMessage = 'Unable to load rides.';
      if (err instanceof Error) {
        // Check for network errors
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Unable to connect to the server. Please check if the server is running and try again.';
        } else if (err.message.includes('404')) {
          errorMessage = 'API endpoint not found. Please check the server configuration.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = err.message || 'Unable to load rides.';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const formatDisplayDate = (value: string) => {
    if (!value) return '--';
    const dateObject = new Date(value);
    if (Number.isNaN(dateObject.getTime())) return value;
    return dateObject.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const applyVehicleFilters = (ridesToFilter: Ride[]) => {
    let filtered = [...ridesToFilter];

    if (filterVehicleType || filterMake || filterModel) {
      filtered = filtered.filter(ride => {
        const vehicle = ride.vehicle;
        if (!vehicle) return false;

        if (filterVehicleType && vehicle.type !== filterVehicleType) {
          return false;
        }
        if (filterMake && vehicle.make?.toLowerCase() !== filterMake.toLowerCase()) {
          return false;
        }
        if (filterModel && vehicle.model?.toLowerCase() !== filterModel.toLowerCase()) {
          return false;
        }
        return true;
      });
    }

    setRides(filtered);
  };

  useEffect(() => {
    if (allRides.length > 0) {
      applyVehicleFilters(allRides);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterVehicleType, filterMake, filterModel, allRides.length]);

  const handleSearch = async () => {
    if (!startLocation || !destinationLocation) {
      setError('Please select both a starting point and destination.');
      return;
    }

    if (requiredSeats && (isNaN(Number(requiredSeats)) || Number(requiredSeats) <= 0)) {
      setError('Please enter a valid number of required seats.');
      return;
    }

    const normalizedDate = date ? date : '';

    // Use geo-based search with location names
    try {
      await loadRides({
        nearStart: startLocation.name,
        nearDest: destinationLocation.name,
        date: normalizedDate,
        limit: 50,
      });
      setHasSearched(true);
    } catch (err) {
      // Error is already handled in loadRides
      console.error('Search error:', err);
    }
  };

  const getUniqueMakes = () => {
    const makes = allRides
      .map(r => r.vehicle?.make)
      .filter((make): make is string => !!make)
      .filter((make, index, self) => self.indexOf(make) === index)
      .sort();
    return makes;
  };

  const getUniqueModels = () => {
    const models = allRides
      .map(r => r.vehicle?.model)
      .filter((model): model is string => !!model)
      .filter((model, index, self) => self.indexOf(model) === index)
      .sort();
    return models;
  };

  const prepareRideSummaryInput = (ride: Ride) => {
    if (ride.start?.coordinates && ride.destination?.coordinates) {
      setRideSummaryInput({
        start: {
          lat: ride.start.coordinates.lat,
          lng: ride.start.coordinates.lng,
        },
        destination: {
          lat: ride.destination.coordinates.lat,
          lng: ride.destination.coordinates.lng,
        },
      });
    }
  };

  const handleViewDetails = (ride: Ride) => {
    setActiveRideId(ride._id);
    prepareRideSummaryInput(ride);
    navigateTo('ride-details');
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gray-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
      </div>

      <button
        onClick={() => navigateTo('dashboard')}
        className="relative z-10 mb-8 flex items-center gap-2 text-sm font-semibold text-black hover:opacity-70 transition-opacity"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 text-black">Find Your Ride</h1>
          <p className="text-gray-600 font-medium">Search and connect with verified drivers</p>
        </div>

        <Card highlight className="mb-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-bold text-black mb-6">Search Criteria</h2>

          <div className="space-y-5">
            <div className="space-y-4">
              <div>
                <LocationAutocomplete
                  label="From"
                  value={startLocation?.name || ''}
                  onChange={setStartLocation}
                  placeholder="Search starting location (e.g., Delhi Airport, Connaught Place)"
                />
              </div>
              <div>
                <LocationAutocomplete
                  label="To"
                  value={destinationLocation?.name || ''}
                  onChange={setDestinationLocation}
                  placeholder="Search destination (e.g., Sector 62 Noida, Mumbai Central)"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                label="Preferred Time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <Input
              label="Required Seats"
              type="number"
              min={1}
              placeholder="e.g., 2"
              value={requiredSeats}
              onChange={(e) => setRequiredSeats(e.target.value)}
            />

            <div className="flex items-center my-2 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="same-gender"
                checked={sameGender}
                onChange={(e) => setSameGender(e.target.checked)}
                className="w-5 h-5 border-2 border-black rounded cursor-pointer"
              />
              <label htmlFor="same-gender" className="ml-3 text-sm font-semibold text-black cursor-pointer">
                Prefer same gender driver
              </label>
            </div>

            <div className="flex items-center my-2 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <input
                type="checkbox"
                id="show-vehicle-filters"
                checked={showVehicleFilters}
                onChange={(e) => setShowVehicleFilters(e.target.checked)}
                className="w-5 h-5 border-2 border-black rounded cursor-pointer"
              />
              <label htmlFor="show-vehicle-filters" className="ml-3 text-sm font-semibold text-black cursor-pointer flex items-center gap-2">
                <Filter size={18} />
                Vehicle Filters (Optional)
              </label>
            </div>

            {showVehicleFilters && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-black">
                    Vehicle Type
                  </label>
                  <select
                    value={filterVehicleType}
                    onChange={(e) => setFilterVehicleType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg smooth-transition focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                  >
                    <option value="">All Types</option>
                    <option value="2-wheeler">2-wheeler</option>
                    <option value="3-wheeler">3-wheeler</option>
                    <option value="4-wheeler">4-wheeler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-black">
                    Make
                  </label>
                  <select
                    value={filterMake}
                    onChange={(e) => setFilterMake(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg smooth-transition focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                  >
                    <option value="">All Makes</option>
                    {getUniqueMakes().map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2.5 text-black">
                    Model
                  </label>
                  <select
                    value={filterModel}
                    onChange={(e) => setFilterModel(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg smooth-transition focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                  >
                    <option value="">All Models</option>
                    {getUniqueModels().map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <Button type="button" fullWidth size="lg" onClick={handleSearch}>
              Search Rides
            </Button>
          </div>
        </Card>

        <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-black mb-6">
            Available Rides ({rides.length})
          </h2>

          {error && (
            <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-red-700 font-semibold mb-6">
              <p className="font-bold mb-2">Error: {error}</p>
              {error.includes('connect') || error.includes('Failed to fetch') ? (
                <div className="text-sm mt-2 space-y-1">
                  <p>• Make sure the backend server is running on port 5001</p>
                  <p>• Check that VITE_API_URL in your .env file is correct</p>
                  <p>• Verify CORS is enabled on the server</p>
                </div>
              ) : null}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center text-sm font-semibold text-gray-600">
              Loading rides...
            </div>
          ) : rides.length === 0 ? (
            <div className="rounded-2xl border-2 border-black p-6 text-center">
              <p className="text-lg font-semibold text-black mb-2">No rides found</p>
              <p className="text-sm text-gray-600">
                {hasSearched ? 'Try adjusting your filters and search again.' : 'Be the first to create a ride!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride, idx) => (
                <Card
                  key={ride._id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-black">{ride.driver.name}</h3>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${i < Math.floor(ride.driver.rating) ? 'text-black fill-black' : 'text-gray-300'} mr-1`}
                          />
                        ))}
                        <span className="text-sm font-semibold ml-1">{ride.driver.rating.toFixed(1)}</span>
                      </div>
                      {ride.vehicle && (
                        <div className="mt-2 text-xs text-gray-600">
                          <div className="flex items-center mb-1">
                            <Car size={14} className="mr-1" />
                            <span className="font-semibold">
                              {ride.vehicle.make} {ride.vehicle.model}
                            </span>
                          </div>
                          <div className="pl-5">
                            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: ride.vehicle.color || '#000' }}></span>
                            {ride.vehicle.color} • {ride.vehicle.registrationNumber}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase mb-1">Route</p>
                      <p className="font-semibold text-black">{ride.start.label}</p>
                      <p className="text-sm text-gray-600">→ {ride.destination.label}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-medium uppercase mb-1">Schedule</p>
                      <p className="font-semibold text-black">{formatDisplayDate(ride.date)}</p>
                      <p className="text-sm text-gray-600">{ride.time}</p>
                    </div>

                    <div className="flex items-center justify-end">
                      <div className="px-4 py-2 bg-black rounded-lg text-white font-bold flex items-center gap-2">
                        <Users size={18} />
                        <span>{Math.max(ride.seats.available, 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-200">
                    <Button fullWidth size="sm" onClick={() => handleViewDetails(ride)}>
                      More Info
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
