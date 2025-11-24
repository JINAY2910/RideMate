import { User, Search, Car, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DriverDashboard from '../components/DriverDashboard';
import RiderDashboard from '../components/RiderDashboard';
import Button from '../components/Button';
import Layout from '../components/Layout';
import GreenStatsCard from '../components/GreenStatsCard';

export default function Dashboard() {
  const { navigateTo, userRole, userName, logout, user } = useApp();

  const handleLogout = () => {
    logout();
    navigateTo('landing');
  };

  return (
    <Layout fullWidth className="bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-gray-100 rounded-full translate-x-1/3 -translate-y-1/3 opacity-50 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col gap-1">
            <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-bold text-black leading-tight">
              {userRole === 'driver' ? 'Welcome back, Driver' : (
                <>
                  Welcome back, <span className="capitalize">{userName || 'Rider'}</span>
                </>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigateTo('profile')} className="flex items-center gap-2 border-2 border-black hover:bg-gray-100 transition-colors">
              <User size={18} />
              Profile
            </Button>
            <button
              onClick={handleLogout}
              className="p-3 rounded-xl border-2 border-black hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-all"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="mb-12">
          <div className="rounded-3xl bg-black text-white p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] border-2 border-black animate-slide-in">
            <div className="flex items-center gap-6 mb-6 sm:mb-0">
              <div className="p-6 bg-white/10 rounded-2xl border-2 border-white/20 backdrop-blur-sm">
                {userRole === 'driver' ? <Car size={56} className="text-white" strokeWidth={1.5} /> : <Search size={56} className="text-white" strokeWidth={1.5} />}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-2">Quick Action</p>
                <h2 className="text-3xl sm:text-4xl font-bold">{userRole === 'driver' ? 'Post a Ride' : 'Find a Ride'}</h2>
                <p className="text-white/70 mt-2 max-w-md">
                  {userRole === 'driver'
                    ? 'Going somewhere? Share your ride and save on travel costs.'
                    : 'Need a lift? Find a reliable ride to your destination.'}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-lg font-bold border-2 border-white hover:bg-white hover:text-black transition-all transform hover:-translate-y-1"
                onClick={() => navigateTo(userRole === 'driver' ? 'create-ride' : 'search-ride')}
              >
                {userRole === 'driver' ? 'Create New Ride' : 'Search Available Rides'}
              </Button>
            </div>
          </div>


          {/* GreenMiles Stats */}
          <div className="mb-8 animate-slide-in-from-bottom-2">
            <GreenStatsCard
              co2Saved={user?.co2Saved || 0}
              greenPoints={user?.greenPoints || 0}
            />
          </div>

          <div className="animate-slide-in-from-bottom-4 mb-12">
            {userRole === 'driver' ? (
              <DriverDashboard userName={userName || ''} />
            ) : (
              <RiderDashboard />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
