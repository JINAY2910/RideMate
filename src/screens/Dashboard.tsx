import { useEffect, useState } from 'react';
import { Car, Search, History, User, PlusCircle, List, LogOut, Bell, MapPin, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { rideApi, Ride, RideRequest } from '../services/rides';
import RiderProfileModal from '../components/RiderProfileModal';

export default function Dashboard() {
  const { navigateTo, userRole, userName } = useApp();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<{ rideId: string; request: RideRequest } | null>(null);

  useEffect(() => {
    if (userRole === 'driver' && userName) {
      rideApi.list({ driver: userName })
        .then(setRides)
        .catch((err) => console.error('Failed to fetch rides:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userRole, userName]);

  const refreshRides = () => {
    if (userRole === 'driver' && userName) {
      rideApi.list({ driver: userName })
        .then(setRides)
        .catch(console.error);
    }
  };

  const driverMenuItems = [
    { icon: PlusCircle, label: 'Create Ride', desc: 'Start a new ride', screen: 'create-ride' },
    { icon: Car, label: 'Vehicles', desc: 'Manage your vehicles', screen: 'vehicles' },
    { icon: List, label: 'My Rides', desc: 'View active rides', screen: 'my-rides' },
    { icon: History, label: 'Ride History', desc: 'Past journeys', screen: 'ride-history' },
    { icon: User, label: 'Profile', desc: 'Edit your profile', screen: 'profile' },
  ];

  const riderMenuItems = [
    { icon: Search, label: 'Find a Ride', desc: 'Search available rides', screen: 'search-ride' },
    { icon: List, label: 'My Rides', desc: 'Track upcoming rides', screen: 'my-rides' },
    { icon: History, label: 'Ride History', desc: 'Your past journeys', screen: 'ride-history' },
    { icon: User, label: 'Profile', desc: 'Manage your profile', screen: 'profile' },
  ];

  const menuItems = userRole === 'driver' ? driverMenuItems : riderMenuItems;

  const stats = [
    { label: 'Upcoming rides', value: userRole === 'driver' ? rides.filter(r => r.status === 'Active').length.toString() : '2', helper: 'Scheduled this week' },
    { label: 'Saved seats', value: userRole === 'driver' ? rides.reduce((acc, r) => acc + (r.requests?.filter(req => req.status === 'Pending').length || 0), 0).toString() : '4', helper: userRole === 'driver' ? 'Pending requests' : 'Friends joining' },
    { label: 'Rating', value: userRole === 'driver' ? '4.9' : '4.8', helper: 'Consistent feedback' },
  ];

  const pendingRequests = userRole === 'driver' ? rides.flatMap(ride =>
    (ride.requests || [])
      .filter(r => r.status === 'Pending')
      .map(r => ({ ride, request: r }))
  ) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-gray-200 rounded-full translate-x-1/3 -translate-y-1/3 opacity-20 blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="grid gap-8 lg:grid-cols-[1.25fr,0.75fr] items-stretch mb-12">
          <div className="rounded-3xl border border-gray-200 bg-white/85 p-8 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 animate-fade-in">
              <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Dashboard</p>
              <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">
                {userRole === 'driver' ? 'Welcome back, Driver' : (
                  <>
                    Welcome back, <span className="capitalize">{userName || 'Rider'}</span>
                  </>
                )}
              </h1>
              <p className="text-lg text-gray-600 font-medium capitalize">
                {userRole === 'driver' ? '🚗 Ready to pick up your passengers?' : '🚕 Plan your next shared ride effortlessly'}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-gray-200 px-5 py-4 bg-white/90 shadow-sm">
                  <p className="text-3xl font-semibold text-black">{stat.value}</p>
                  <p className="text-sm uppercase tracking-wide text-gray-500 mt-1">{stat.label}</p>
                  <p className="text-xs text-gray-500 mt-2">{stat.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-black text-white p-8 flex flex-col justify-between shadow-xl animate-slide-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-5">
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10">
                <Car size={48} className="text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/60">Status check</p>
                <h2 className="text-2xl font-semibold">All systems go</h2>
              </div>
            </div>
            <ul className="mt-8 space-y-4 text-sm text-white/80">
              <li>• Smart suggestions keep your most-used actions on top.</li>
              <li>• Sync rides across devices instantly.</li>
              <li>• Real-time alerts for seat requests and route changes.</li>
            </ul>
            <Button variant="secondary" onClick={() => navigateTo(userRole === 'driver' ? 'create-ride' : 'search-ride')}>
              {userRole === 'driver' ? 'Create a ride now' : 'Find a ride now'}
            </Button>
          </div>
        </div>

        {/* Pending Requests Section for Drivers */}
        {userRole === 'driver' && pendingRequests.length > 0 && (
          <div className="mb-10 animate-slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Bell size={24} className="text-yellow-700" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Action Required</p>
                <h2 className="text-3xl font-bold text-black">New Ride Requests</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingRequests.map(({ ride, request }) => (
                <Card key={request._id} className="border-l-4 border-l-yellow-400">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{request.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold mr-2">
                          {request.rating} ★
                        </span>
                        {request.seatsRequested} seat(s)
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                      {request.status}
                    </span>
                  </div>

                  <div className="mb-4 pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin size={14} className="mr-2 text-gray-400" />
                      <span className="truncate">{ride.start.label} → {ride.destination.label}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock size={14} className="mr-2 text-gray-400" />
                      <span>{ride.date} • {ride.time}</span>
                    </div>
                  </div>

                  <Button
                    fullWidth
                    size="sm"
                    onClick={() => setSelectedRequest({ rideId: ride._id, request })}
                  >
                    Review Request
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Shortcuts</p>
              <h2 className="text-3xl font-bold text-black">Quick Access</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {menuItems.map((item, idx) => (
              <Card
                key={item.screen}
                onClick={() => navigateTo(item.screen)}
                highlight={idx === 0}
                className="h-full"
                style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${idx === 0 ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
                    <item.icon size={26} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black">{item.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-gray-200 bg-white/90 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-black mb-2">Need help?</h3>
            <p className="text-sm text-gray-600 max-w-xl">
              Explore step-by-step guides, safety checklists, and community support forums to keep every ride running smoothly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigateTo('landing')}>
              <LogOut size={18} />
              Sign Out
            </Button>
            <Button variant="outline">
              Documentation
            </Button>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <RiderProfileModal
          rider={selectedRequest.request.rider}
          rating={selectedRequest.request.rating}
          onAccept={async () => {
            try {
              await rideApi.updateRequestStatus(selectedRequest.rideId, selectedRequest.request._id, 'Approved');
              refreshRides();
              setSelectedRequest(null);
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Failed to approve request');
            }
          }}
          onReject={async () => {
            try {
              await rideApi.updateRequestStatus(selectedRequest.rideId, selectedRequest.request._id, 'Rejected');
              refreshRides();
              setSelectedRequest(null);
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Failed to reject request');
            }
          }}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
