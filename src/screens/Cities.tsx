import React from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ScrollProgressBar from '../components/ScrollProgressBar';
import CustomCursor from '../components/CustomCursor/CustomCursor';
import AnimatedSection from '../components/AnimatedSection/AnimatedSection';
import Footer from '../components/Footer';
import '../styles/landing.css';

export default function Cities() {
  const { navigateTo } = useApp();

  const cities = [
    { name: 'Mumbai', status: 'Live', rides: '12K+' },
    { name: 'Delhi NCR', status: 'Live', rides: '15K+' },
    { name: 'Bangalore', status: 'Live', rides: '10K+' },
    { name: 'Pune', status: 'Beta', rides: '2K+' },
    { name: 'Hyderabad', status: 'Coming Soon', rides: '-' },
    { name: 'Chennai', status: 'Coming Soon', rides: '-' },
  ];

  return (
    <div className="landing-page">
      <ScrollProgressBar />
      <CustomCursor />

      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors cursor-hover"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
          <span className="font-bold text-lg">Cities</span>
        </div>
      </header>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <h1 className="hero-title text-center mb-8">Global Reach,<br />Local Impact.</h1>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-20 text-lg">
              We are expanding rapidly to bring seamless mobility to metropolises around the world.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city, index) => (
              <AnimatedSection key={city.name} delay={index * 100}>
                <div className="bg-white border border-black/10 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-hover group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                      <MapPin size={20} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${city.status === 'Live' ? 'bg-green-100 text-green-800' :
                      city.status === 'Beta' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {city.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{city.name}</h3>
                  <p className="text-gray-500 text-sm">{city.rides} daily rides</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
