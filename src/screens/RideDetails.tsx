import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  AlertTriangle,
  MapPin,
  Users,
  Star,
  PhoneCall,
  ShieldAlert,
  Send,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { clearRideChat } from '../utils/chatStorage';
import { rideApi, Ride } from '../services/rides';

export default function RideDetails() {
  const {
    navigateTo,
    userRole,
    userId,
    userName,
    emergencyContacts,
    activeRideId,
    setRideSummaryInput,
  } = useApp();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [riderRatings, setRiderRatings] = useState<Record<string, number>>({});
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [showSOSConfirmation, setShowSOSConfirmation] = useState(false);
  const [emergencyType, setEmergencyType] = useState('medical');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'ready' | 'error'>('idle');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchComplete, setDispatchComplete] = useState(false);
  const [rideCancelled, setRideCancelled] = useState(false);

  useEffect(() => {
    if (!activeRideId) {
      setRide(null);
      setLoading(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    // Function to fetch ride data
    const fetchRide = (isInitial = false) => {
      if (isInitial) {
        setLoading(true);
        setLoadError(null);
      }

      rideApi
        .getById(activeRideId)
        .then((data) => {
          if (!cancelled) {
            setRide(data);
          }
        })
        .catch((err) => {
          if (!cancelled && isInitial) {
            setLoadError(err instanceof Error ? err.message : 'Unable to load ride.');
          }
        })
        .finally(() => {
          if (!cancelled && isInitial) {
            setLoading(false);
          }
        });
    };

    // Initial fetch
    fetchRide(true);

    // Polling interval (every 15 seconds)
    const intervalId = setInterval(() => {
      fetchRide(false);
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeRideId]);

  useEffect(() => {
    if (ride?.status === 'Completed') {
      clearRideChat(ride._id);
    }
  }, [ride]);

  const rideStatus = ride?.status ?? 'Pending';
  const approvedRequests =
    ride?.requests?.filter((request) => request.status === 'Approved') ?? [];
  const trustedContacts = emergencyContacts.length
    ? emergencyContacts
    : [
      { name: 'Add a contact', phone: 'No phone' },
      { name: 'Add a contact', phone: 'No phone' },
      { name: 'Add a contact', phone: 'No phone' },
    ];
  const emergencyTypes = [
    { id: 'medical', label: 'Medical Emergency', desc: 'Health issue, injury, or medical distress' },
    { id: 'security', label: 'Security Threat', desc: 'Harassment, assault, or unsafe rider/driver' },
    { id: 'accident', label: 'Accident / Collision', desc: 'Vehicle damage or crash' },
    { id: 'other', label: 'Other / Unknown', desc: 'Any unusual situation needing help' },
  ];

  const canSubmitRatings =
    approvedRequests.length > 0 &&
    approvedRequests.every((request) => (riderRatings[request._id] || 0) > 0);

  // Check if current user has already requested this ride
  const hasRequested = ride?.requests?.some(
    (req) => req.rider?.id === userId && req.status !== 'Rejected'
  );

  const handleRating = (riderId: string, rating: number) => {
    setRiderRatings((prev) => ({ ...prev, [riderId]: rating }));
  };

  const handleSubmitRatings = () => {
    if (!canSubmitRatings) return;
    navigateTo('dashboard');
  };

  const handleMarkRideComplete = async () => {
    if (!ride || ride.status === 'Completed') return;
    try {
      const updated = await rideApi.updateStatus(ride._id, 'Completed');
      setRide(updated);
      clearRideChat(updated._id);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update ride status.');
    }
  };

  const handleSOSButtonClick = () => {
    setShowSOSConfirmation(true);
  };

  const confirmSOSActivation = () => {
    setShowSOSConfirmation(false);
    setShowEmergencyPanel(true);
    setDispatchComplete(false);
    setIsDispatching(false);
    if (!userLocation) {
      setLocationStatus('fetching');
    }
  };

  const cancelSOSActivation = () => {
    setShowSOSConfirmation(false);
  };

  const handleDispatchEmergency = () => {
    if (isDispatching || dispatchComplete) return;
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchComplete(true);
      setRideCancelled(true);
      setIncidentNotes('');
    }, 1500);
  };

  const handleCloseEmergencyPanel = () => {
    setShowEmergencyPanel(false);
    setIncidentNotes('');
    setEmergencyType('medical');
    if (!rideCancelled) {
      setDispatchComplete(false);
      setIsDispatching(false);
    }
  };

  useEffect(() => {
    if (!showEmergencyPanel) return;
    if (userLocation && locationStatus === 'ready') return;

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
      setLocationStatus('error');
      return;
    }

    setLocationStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('ready');
      },
      () => {
        setUserLocation({ lat: 37.7749, lng: -122.4194 });
        setLocationStatus('error');
      }
    );
  }, [showEmergencyPanel, userLocation, locationStatus]);

  const handleBookRideFromDetails = async () => {
    if (!ride || !activeRideId) {
      alert('Select a ride from Find Ride to book this trip.');
      return;
    }
    try {
      const updatedRide = await rideApi.addRequest(activeRideId, {
        name: userName || 'Rider',
        rating: 5,
        seatsRequested: 1, // Default to 1 seat, can be made configurable later
      });
      setRide(updatedRide);
      setRideSummaryInput({
        start: {
          lat: updatedRide.start.coordinates.lat,
          lng: updatedRide.start.coordinates.lng,
        },
        destination: {
          lat: updatedRide.destination.coordinates.lat,
          lng: updatedRide.destination.coordinates.lng,
        },
      });
      setActionError(null);
      navigateTo('ride-confirmation');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to book this ride.');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <button onClick={() => navigateTo('dashboard')} className="mb-8 flex items-center text-black hover:opacity-70">
        <ArrowLeft size={24} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-black">Ride Details</h1>

        {actionError && (
          <div className="mb-6 rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {actionError}
          </div>
        )}

        {rideCancelled && (
          <div className="mb-6 rounded-2xl border-2 border-red-500 bg-red-50 p-5 text-black">
            <p className="text-xl font-bold mb-1 flex items-center gap-2">
              <ShieldAlert size={24} className="text-red-600" />
              Emergency protocol active
            </p>
            <p className="text-sm text-red-700">
              This ride has been automatically cancelled. Support staff and emergency services received the incident log.
            </p>
          </div>
        )}

        {!activeRideId ? (
          <div className="rounded-2xl border-2 border-black p-6 text-center">
            <p className="text-lg font-semibold text-black mb-2">No ride selected</p>
            <p className="text-sm text-gray-600">Head to My Rides or Search to pick a trip first.</p>
          </div>
        ) : loading ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center text-sm font-semibold text-gray-600">
            Loading ride details...
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-6 text-center font-semibold text-red-600">
            {loadError}
          </div>
        ) : ride ? (
          <>
            <Card className="mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-black mb-2">{ride.driver.name}</h2>
                    <span
                      className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border ${rideStatus === 'Completed' ? 'border-green-600 text-green-600' : 'border-black text-black'
                        }`}
                    >
                      {rideStatus}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Star size={20} className="text-black fill-black mr-1" />
                    <span className="font-medium">{ride.driver.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users size={24} className="text-black mr-2" />
                  <span className="text-xl font-bold">
                    {Math.max(ride.seats.available, 0)} / {ride.seats.total}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <MapPin size={20} className="text-black mr-3 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pickup</p>
                    <p className="text-lg font-medium text-black">{ride.start.label}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin size={20} className="text-black mr-3 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Drop-off</p>
                    <p className="text-lg font-medium text-black">{ride.destination.label}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-bold text-black">{ride.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-bold text-black">{ride.time}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button fullWidth onClick={() => navigateTo('chat')}>
                  <MessageCircle size={20} className="inline mr-2" />
                  Chat
                </Button>
                <Button fullWidth variant="secondary" onClick={() => navigateTo('gps-tracking')}>
                  <MapPin size={20} className="inline mr-2" />
                  Track
                </Button>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={handleSOSButtonClick}
                  className="border-red-500 text-red-600"
                >
                  <AlertTriangle size={20} className="inline mr-2 text-red-600" />
                  SOS
                </Button>
                <Button
                  fullWidth
                  onClick={handleBookRideFromDetails}
                  disabled={hasRequested || ride.seats.available === 0}
                  variant={hasRequested ? 'secondary' : 'primary'}
                >
                  {hasRequested ? 'Request Sent' : ride.seats.available === 0 ? 'Full' : 'Book Ride'}
                </Button>
              </div>
            </Card>

            {userRole === 'driver' && (
              <>
                <Card className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-black">Riders Joined</h3>
                  <div className="space-y-3">
                    {ride.participants && ride.participants.length > 0 ? (
                      ride.participants.map((participant, index) => (
                        <div key={participant.rider?.id || index} className="p-4 border-2 border-black rounded-lg bg-green-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-black">{participant.name}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Seats: {participant.seatsBooked} • Status: {participant.status}
                              </p>
                              {participant.rider?.email && (
                                <p className="text-xs text-gray-500 mt-1">Email: {participant.rider.email}</p>
                              )}
                              {participant.rider?.phone && (
                                <p className="text-xs text-gray-500">Phone: {participant.rider.phone}</p>
                              )}
                            </div>
                            <span className="px-3 py-1 text-sm font-medium rounded-full border-2 border-green-600 bg-green-600 text-white">
                              Confirmed
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">No riders have joined yet.</p>
                    )}
                  </div>
                </Card>

                <Card className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-black">Rider Requests</h3>
                  <div className="space-y-3">
                    {ride.requests && ride.requests.length > 0 && (
                      ride.requests.map((request) => (
                        <div key={request._id} className="p-4 border-2 border-black rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-black">{request.name}</p>
                              <div className="flex items-center mt-1">
                                <Star size={14} className="text-black fill-black mr-1" />
                                <span className="text-sm">{request.rating}</span>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-sm font-medium rounded-full border-2 border-black ${request.status === 'Approved' ? 'bg-black text-white' : 'bg-white text-black'
                                }`}
                            >
                              {request.status}
                            </span>
                          </div>

                          {request.status === 'Pending' && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const updated = await rideApi.updateRequestStatus(ride!._id, request._id, 'Approved');
                                    setRide(updated);
                                    setActionError(null);
                                  } catch (err) {
                                    setActionError(err instanceof Error ? err.message : 'Failed to approve request');
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={async () => {
                                  try {
                                    const updated = await rideApi.updateRequestStatus(ride!._id, request._id, 'Rejected');
                                    setRide(updated);
                                    setActionError(null);
                                  } catch (err) {
                                    setActionError(err instanceof Error ? err.message : 'Failed to reject request');
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {request.status === 'Approved' && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-600 mb-2 uppercase">Rate rider</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={`${request._id}-${star}`}
                                    type="button"
                                    onClick={() => handleRating(request._id, star)}
                                    className="transition-transform duration-150 hover:scale-110"
                                  >
                                    <Star
                                      size={28}
                                      className={`${star <= (riderRatings[request._id] || 0)
                                        ? 'text-black fill-black'
                                        : 'text-gray-300'
                                        }`}
                                    />
                                  </button>
                                ))}
                                <span className="text-sm font-medium text-black">
                                  {(riderRatings[request._id] || 0) > 0
                                    ? `${riderRatings[request._id]} / 5`
                                    : 'Tap to rate'}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="mt-2 text-xs text-gray-600">
                            Seats requested: {request.seatsRequested || 1}
                          </div>
                        </div>
                      )))}
                    {(!ride.requests || ride.requests.length === 0) && (
                      <p className="text-gray-600 text-center py-4">No pending requests.</p>
                    )}
                  </div>
                  {approvedRequests.length > 0 && (
                    <div className="mt-6 flex flex-col gap-3">
                      <p className="text-sm text-gray-600">
                        Rate each approved rider to keep your community trustworthy.
                      </p>
                      <Button onClick={handleSubmitRatings} disabled={!canSubmitRatings}>
                        Submit Rider Ratings
                      </Button>
                    </div>
                  )}
                </Card>
              </>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {userRole === 'driver' && (
                <Button fullWidth onClick={() => navigateTo('gps-tracking')}>
                  Start Trip
                </Button>
              )}
              {rideStatus !== 'Completed' ? (
                <Button fullWidth variant="secondary" onClick={handleMarkRideComplete}>
                  Mark Ride Complete
                </Button>
              ) : (
                <div className="rounded-2xl border border-green-500 bg-green-50 p-4 text-sm text-green-700">
                  Ride marked as complete. Chat history cleared.
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {showSOSConfirmation && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border-4 border-black bg-white p-6 md:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-black mb-2 flex items-center gap-2">
              <ShieldAlert className="text-red-600" size={26} />
              Confirm SOS Activation
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Triggering SOS immediately alerts local emergency services, shares your live location, and notifies all trusted contacts.
              False alarms may still result in authorities responding. Are you sure you need urgent help?
            </p>
            <ul className="mb-6 list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>Instant call-out to nearest police assistance desk</li>
              <li>Location + emergency type shared with RideMate Safety</li>
              <li>Current ride automatically paused until resolved</li>
            </ul>
            <div className="flex flex-col gap-3 md:flex-row">
              <Button fullWidth size="lg" onClick={confirmSOSActivation} className="bg-red-600 text-white hover:bg-red-700">
                Yes, Activate SOS
              </Button>
              <Button fullWidth size="lg" variant="secondary" onClick={cancelSOSActivation}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEmergencyPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-3xl rounded-3xl border-4 border-black bg-white p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseEmergencyPanel}
              className="absolute right-4 top-4 rounded-full border-2 border-black p-1 text-black hover:bg-black hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                SOS / Emergency
              </p>
              <h2 className="mt-2 flex items-center gap-2 text-2xl font-bold text-black">
                <ShieldAlert className="text-red-600" size={28} />
                Instant Emergency Response
              </h2>
              <p className="text-sm text-gray-600">
                One tap connects you with local authorities, shares your live location, and alerts your trusted
                contacts automatically.
              </p>
            </div>

            <div className="grid gap-4 mb-6 md:grid-cols-2">
              {emergencyTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setEmergencyType(type.id)}
                  className={`rounded-2xl border-2 p-4 text-left transition-colors ${emergencyType === type.id ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'
                    }`}
                >
                  <p className="font-semibold">{type.label}</p>
                  <p className={`text-sm mt-1 ${emergencyType === type.id ? 'text-white/80' : 'text-gray-600'}`}>
                    {type.desc}
                  </p>
                </button>
              ))}
            </div>

            <div className="mb-6 rounded-2xl border-2 border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Automatic Location Sharing</p>
              <p className="mt-2 text-lg font-bold text-black">
                {userLocation
                  ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : locationStatus === 'fetching'
                    ? 'Fetching GPS...'
                    : 'Location unavailable'}
              </p>
              <p className="text-xs text-gray-600">
                {locationStatus === 'error'
                  ? 'Using last known coordinates while we reconnect to GPS.'
                  : 'Coordinates sent to emergency services and all trusted contacts.'}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-3">Trusted contacts notified</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {trustedContacts.map((contact, index) => (
                  <li
                    key={`${contact.name}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-black">{contact.name}</p>
                      <p className="text-sm text-gray-700">{contact.phone || 'No phone added'}</p>
                    </div>
                    <PhoneCall size={18} className="text-gray-500" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-black">Incident details (optional)</label>
              <textarea
                value={incidentNotes}
                onChange={(e) => setIncidentNotes(e.target.value)}
                placeholder="Add any quick context (vehicle information, visible threats, medical symptoms, etc.)"
                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-black focus:outline-none focus:ring-1 focus:ring-black min-h-[120px]"
              />
              <p className="mt-1 text-xs text-gray-500">
                Notes are shared with emergency dispatchers and RideMate safety specialists.
              </p>
            </div>

            {dispatchComplete ? (
              <div className="mb-6 rounded-2xl border-2 border-green-500 bg-green-50 p-4 text-sm text-green-700">
                Emergency activation logged. Ride cancellation and post-incident support are in progress.
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border-2 border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-800">
                Selecting the correct emergency type helps responders prioritize the right resources faster.
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row">
              <Button
                fullWidth
                size="lg"
                onClick={handleDispatchEmergency}
                disabled={isDispatching || dispatchComplete}
              >
                {dispatchComplete ? (
                  'Emergency Logged'
                ) : (
                  <>
                    {isDispatching ? 'Contacting Emergency Services...' : 'Dispatch Emergency Response'}
                    {!dispatchComplete && !isDispatching && <Send size={18} />}
                  </>
                )}
              </Button>
              <Button fullWidth size="lg" variant="secondary" onClick={handleCloseEmergencyPanel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
