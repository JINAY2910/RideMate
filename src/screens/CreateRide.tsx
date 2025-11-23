import { useState } from 'react';
import { ArrowLeft, Users, Car, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { Location } from '../services/locations';
import { rideApi } from '../services/rides';

const formatTimeLabel = (timeValue: string) => {
  if (!timeValue) return '';
  const [hourStr, minute] = timeValue.split(':');
  let hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:${minute} ${suffix}`;
};

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

export default function CreateRide() {
  const { navigateTo, setRideSummaryInput, userName, userRole, setActiveRideId, vehicles, setRideVehicle, addRideSchedule } = useApp();
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startLocation || !destinationLocation) {
      alert('Please select both a start and destination location.');
      return;
    }
    if (isScheduled) {
      if (selectedDays.length === 0) {
        alert('Please select at least one day for the schedule.');
        return;
      }
      if (!time || !seats) {
        alert('Please complete all required fields for scheduled ride.');
        return;
      }
    } else {
      if (!date || !time || !seats) {
        alert('Please complete all required fields.');
        return;
      }
    }

    if (userRole === 'driver') {
      if (vehicles.length === 0) {
        alert('Please add a vehicle first before creating a ride.');
        return;
      }
      if (!selectedVehicle) {
        alert('Please select a vehicle for this ride.');
        return;
      }
    }

    const seatsNumber = Number(seats);
    if (!Number.isFinite(seatsNumber) || seatsNumber <= 0) {
      alert('Please enter a valid number of seats.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const formattedTime = formatTimeLabel(time);

      if (isScheduled) {
        // Store schedule (dummy data - not saved to DB)
        if (selectedVehicle && startLocation && destinationLocation) {
          addRideSchedule({
            rideId: `schedule_${Date.now()}`,
            days: selectedDays,
            time: formattedTime || time,
            startLocation: {
              lat: startLocation.lat,
              lng: startLocation.lng,
            },
            destinationLocation: {
              lat: destinationLocation.lat,
              lng: destinationLocation.lng,
            },
            vehicleId: selectedVehicle,
            seats: seatsNumber,
            notes: notes || undefined,
          });
        }
        alert(`Weekly schedule created for ${selectedDays.length} day(s) of the week!`);
        navigateTo('dashboard');
      } else {
        // Get driver's current location
        let driverLocation: { lat: number; lng: number } | undefined = undefined;
        if (userRole === 'driver' && typeof navigator !== 'undefined' && navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 60000, // Use cached location if less than 1 minute old
              });
            });
            driverLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
          } catch (err) {
            console.warn('Could not get driver location:', err);
            // Continue without location - it's optional
          }
        }

        const newRide = await rideApi.create({
          driverName: userName || 'RideMate Driver',
          driverRating: userRole === 'driver' ? 4.9 : 4.8,
          start: {
            label: startLocation.name,
            lat: startLocation.lat,
            lng: startLocation.lng,
          },
          destination: {
            label: destinationLocation.name,
            lat: destinationLocation.lat,
            lng: destinationLocation.lng,
          },
          date,
          time: formattedTime || time,
          seats: seatsNumber,
          notes,
          vehicleId: selectedVehicle || undefined,
          driverLocation: driverLocation,
        });

        setActiveRideId(newRide._id);

        // Store vehicle ID for this ride (dummy data)
        if (selectedVehicle) {
          setRideVehicle(newRide._id, selectedVehicle);
        }

        setRideSummaryInput({
          start: {
            lat: newRide.start.coordinates.lat,
            lng: newRide.start.coordinates.lng,
          },
          destination: {
            lat: newRide.destination.coordinates.lat,
            lng: newRide.destination.coordinates.lng,
          },
        });

        navigateTo('ride-confirmation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create ride. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full translate-x-1/3 -translate-y-1/3 opacity-20"></div>
      </div>

      <button
        onClick={() => navigateTo('dashboard')}
        className="mb-8 flex items-center text-black hover:opacity-70 transition-opacity font-semibold"
      >
        <ArrowLeft size={24} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black">Create a Ride</h1>
          <p className="text-gray-600 font-medium mt-2">Post your route and earn money</p>
        </div>

        <Card highlight className="animate-fade-in">
          {error && (
            <div className="mb-4 rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-4">
              <LocationAutocomplete
                label="From"
                value={startLocation?.name || ''}
                onChange={setStartLocation}
                placeholder="Search starting location (e.g., Delhi Airport, Connaught Place)"
              />
              <LocationAutocomplete
                label="To"
                value={destinationLocation?.name || ''}
                onChange={setDestinationLocation}
                placeholder="Search destination (e.g., Sector 62 Noida, Mumbai Central)"
              />
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <input
                type="checkbox"
                id="is-scheduled"
                checked={isScheduled}
                onChange={(e) => {
                  setIsScheduled(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedDays([]);
                    setDate('');
                  }
                }}
                className="w-5 h-5 border-2 border-black rounded cursor-pointer"
              />
              <label htmlFor="is-scheduled" className="ml-3 text-sm font-semibold text-black cursor-pointer flex items-center gap-2">
                <Calendar size={18} />
                Create Weekly Schedule
              </label>
            </div>

            {isScheduled ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-black">
                    Select Days of the Week *
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`py-3 px-2 rounded-lg border-2 font-semibold text-sm transition-all ${selectedDays.includes(day.value)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300 hover:border-black'
                          }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {selectedDays.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      Selected: {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <Input
                  label="Time *"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Date *"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <Input
                  label="Time *"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            )}

            {userRole === 'driver' && (
              <div>
                <label className="block text-sm font-semibold mb-2.5 text-black">
                  Select Vehicle *
                </label>
                {vehicles.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                      <Car size={20} />
                    </div>
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg smooth-transition focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                      required
                    >
                      <option value="">Choose a vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.registrationNumber} - {vehicle.vehicleType} ({vehicle.seatingLimit} seats)
                          {vehicle.make && vehicle.model && ` - ${vehicle.make} ${vehicle.model}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">No vehicles added yet.</p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigateTo('vehicles')}
                    >
                      Add Vehicle First
                    </Button>
                  </div>
                )}
              </div>
            )}

            <Input
              label="Available Seats"
              type="number"
              placeholder="e.g., 3"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              icon={<Users size={20} />}
              required
            />

            <div>
              <label className="block text-sm font-semibold mb-2.5 text-black">Additional Notes (Optional)</label>
              <textarea
                placeholder="e.g., Non-smoking, music, pet-friendly..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg smooth-transition focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                rows={4}
              />
            </div>

            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Posting ride...' : 'Create & Post Ride'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
