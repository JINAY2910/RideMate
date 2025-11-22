import { useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
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

export default function CreateRide() {
  const { navigateTo, setRideSummaryInput, userName, userRole, setActiveRideId } = useApp();
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startLocation || !destinationLocation) {
      alert('Please select both a start and destination location.');
      return;
    }
    if (!date || !time || !seats) {
      alert('Please complete all required fields.');
      return;
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
      });

      setActiveRideId(newRide._id);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create ride. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-white p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full translate-x-1/3 -translate-y-1/3 opacity-20"></div>

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

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Input
                label="Time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

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
