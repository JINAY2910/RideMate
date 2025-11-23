import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import { Car, Search } from 'lucide-react';
import DriverDashboard from '../components/DriverDashboard';
import RiderDashboard from '../components/RiderDashboard';

export default function Dashboard() {
  const { navigateTo, userRole, userName, logout } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-gray-200 rounded-full translate-x-1/3 -translate-y-1/3 opacity-20 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.25fr,0.75fr] items-stretch mb-8 sm:mb-12">
          <div className="rounded-3xl border border-gray-200 bg-white/85 p-6 sm:p-8 shadow-lg backdrop-blur">
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
          </div>

          <div className="rounded-3xl bg-black text-white p-6 sm:p-8 flex flex-col justify-between shadow-xl animate-slide-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-5">
              <div className="p-5 bg-white/10 rounded-2xl border border-white/10">
                {userRole === 'driver' ? <Car size={48} className="text-white" strokeWidth={1.5} /> : <Search size={48} className="text-white" strokeWidth={1.5} />}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/60">Quick Action</p>
                <h2 className="text-2xl font-semibold">{userRole === 'driver' ? 'Post a Ride' : 'Find a Ride'}</h2>
              </div>
            </div>
            <div className="mt-8">
              <Button variant="secondary" fullWidth onClick={() => navigateTo(userRole === 'driver' ? 'create-ride' : 'search-ride')}>
                {userRole === 'driver' ? 'Create New Ride' : 'Search Available Rides'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="animate-slide-in-from-bottom-4">
          {userRole === 'driver' ? (
            <DriverDashboard userName={userName || ''} />
          ) : (
            <RiderDashboard />
          )}
        </div>

        <div className="mt-12 rounded-3xl border border-gray-200 bg-white/90 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-black mb-2">Need help?</h3>
            <p className="text-sm text-gray-600 max-w-xl">
              Explore step-by-step guides, safety checklists, and community support forums to keep every ride running smoothly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
