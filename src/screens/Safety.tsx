import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ScrollProgressBar from '../components/ScrollProgressBar';
import CustomCursor from '../components/CustomCursor/CustomCursor';
import AnimatedSection from '../components/AnimatedSection/AnimatedSection';
import Footer from '../components/Footer';
import '../styles/landing.css';

export default function Safety() {
  const { navigateTo } = useApp();

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
          <span className="font-bold text-lg">Safety</span>
        </div>
      </header>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-2xl mb-6">
                <ShieldCheck size={32} />
              </div>
              <h1 className="hero-title mb-6">Uncompromised<br />Safety Standards</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Every feature, every trip, and every interaction is designed with your security as the foundation.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <AnimatedSection delay={200}>
              <div className="bg-white border border-black/10 rounded-3xl p-8 h-full hover:border-black/30 transition-colors cursor-hover">
                <Lock className="mb-6 text-black" size={32} />
                <h3 className="text-2xl font-bold mb-4">End-to-End Encryption</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your personal data, location history, and payment information are encrypted with military-grade protocols.
                  We never share your private details with third parties without your explicit consent.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="bg-white border border-black/10 rounded-3xl p-8 h-full hover:border-black/30 transition-colors cursor-hover">
                <Eye className="mb-6 text-black" size={32} />
                <h3 className="text-2xl font-bold mb-4">Real-Time Monitoring</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our safety algorithms monitor every trip in real-time. Unusual stops or route deviations trigger
                  automatic check-ins from our 24/7 safety response team.
                </p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={600}>
            <div className="bg-black text-white rounded-3xl p-10 md:p-16 text-center">
              <AlertTriangle className="mx-auto mb-6 text-yellow-400" size={48} />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Emergency Assistance</h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
                In the unlikely event of an emergency, our in-app SOS button connects you directly to local authorities
                and shares your live location with your trusted contacts instantly.
              </p>
              <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors cursor-hover">
                Learn About SOS Features
              </button>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <Footer />
    </div>
  );
}
