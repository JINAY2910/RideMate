import { ArrowLeft, Zap, UserCheck, Shield, Users, Map, MessageCircle, History, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';

export default function Platform() {
  const { navigateTo, goBack } = useApp();

  const features = [
    { icon: Zap, title: 'Real-time ride matching', desc: 'UI mock' },
    { icon: UserCheck, title: 'Verified user profiles', desc: '' },
    { icon: Shield, title: 'Emergency SOS with 3 trusted contacts', desc: '' },
    { icon: Users, title: 'Gender-preference ride matching', desc: '' },
    { icon: Map, title: 'Live trip map', desc: 'mock' },
    { icon: MessageCircle, title: 'In-app contact options', desc: '' },
    { icon: History, title: 'Ride history tracking', desc: '' },
    { icon: Star, title: 'Ratings & reviews system', desc: '' },
  ];

  return (
    <div className="min-h-screen bg-white p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full translate-x-1/3 -translate-y-1/3 opacity-20"></div>

      <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="flex items-center text-black hover:opacity-70 transition-opacity font-semibold"
            >
              <ArrowLeft size={24} className="mr-2" />
              Back
            </button>
            <Logo className="h-10 w-10" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('login')}
              className="px-5 py-2 rounded-full border-2 border-black font-semibold hover:bg-gray-50 transition-all duration-300"
            >
              Log in
            </button>
            <button
              onClick={() => navigateTo('signup')}
              className="px-5 py-2 rounded-full bg-black text-white font-semibold hover:opacity-90 transition-all duration-300"
            >
              Create account
            </button>
          </div>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-black mb-4">Platform</h1>
          <p className="text-lg text-gray-600 font-medium">
            RideMate is a modern ride-sharing platform designed for safe, simple and trusted travel.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 bg-white border-2 border-black rounded-xl space-y-3 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black/5 rounded-lg">
                    <Icon className="h-6 w-6 text-black" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-black">{feature.title}</h3>
                {feature.desc && <p className="text-sm text-gray-600 font-medium">{feature.desc}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

