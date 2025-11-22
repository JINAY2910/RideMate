import { Car, Search, History, User, PlusCircle, List, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Dashboard() {
  const { navigateTo, userRole, userName } = useApp();

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
    { label: 'Upcoming rides', value: userRole === 'driver' ? '3' : '2', helper: 'Scheduled this week' },
    { label: 'Saved seats', value: userRole === 'driver' ? '8' : '4', helper: userRole === 'driver' ? 'Awaiting confirmations' : 'Friends joining' },
    { label: 'Rating', value: userRole === 'driver' ? '4.9' : '4.8', helper: 'Consistent feedback' },
  ];

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
    </div>
  );
}
