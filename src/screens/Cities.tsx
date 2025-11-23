import { ArrowLeft, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';

export default function Cities() {
  const { navigateTo, goBack } = useApp();

  const cities = ['Anand', 'V.V. Nagar', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Mumbai'];

  return (
    <div className="min-h-screen bg-white p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-gray-100 rounded-full -translate-y-1/2 -translate-x-1/3 opacity-20"></div>

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
          <h1 className="text-5xl font-bold text-black mb-4">Cities We Serve</h1>
          <p className="text-lg text-gray-600 font-medium">
            RideMate is currently available in select regions and expanding rapidly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cities.map((city, index) => (
            <div
              key={index}
              className="p-6 bg-white border-2 border-black rounded-xl flex items-center gap-3 hover:shadow-lg transition-all duration-300"
            >
              <MapPin className="h-5 w-5 text-black flex-shrink-0" />
              <h3 className="text-lg font-bold text-black">{city}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

