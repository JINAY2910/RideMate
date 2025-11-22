import { ArrowLeft, UserCheck, Shield, Users, Map, Star, Eye, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';

export default function Safety() {
  const { navigateTo } = useApp();

  const safetyFeatures = [
    { icon: UserCheck, title: 'Verified user profiles' },
    { icon: Shield, title: 'SOS emergency button', desc: 'UI only' },
    { icon: Users, title: '3 trusted emergency contacts stored in rider profile' },
    { icon: Users, title: 'Gender-preference matching' },
    { icon: Map, title: 'Live location map', desc: 'mock' },
    { icon: Star, title: 'Transparent driver ratings' },
    { icon: Eye, title: 'Profile visibility before booking' },
    { icon: MessageSquare, title: 'Post-ride rating system' },
  ];

  return (
    <div className="min-h-screen bg-white p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full translate-x-1/3 -translate-y-1/3 opacity-20"></div>

      <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('landing')}
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
          <h1 className="text-5xl font-bold text-black mb-4">Safety First, Always</h1>
        </div>

        <div className="space-y-4 mb-12">
          {safetyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 bg-white border-2 border-black rounded-xl flex items-start gap-4 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-2 bg-black/5 rounded-lg flex-shrink-0">
                  <Icon className="h-6 w-6 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black mb-1">{feature.title}</h3>
                  {feature.desc && <p className="text-sm text-gray-600 font-medium">{feature.desc}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-8 border-t-2 border-black">
          <p className="text-lg font-semibold text-black">Your safety is our priority — always.</p>
        </div>
      </div>
    </div>
  );
}

