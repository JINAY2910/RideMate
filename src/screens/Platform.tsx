import React from 'react';
import { ArrowLeft, Layers, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ScrollProgressBar from '../components/ScrollProgressBar';
import CustomCursor from '../components/CustomCursor/CustomCursor';
import AnimatedSection from '../components/AnimatedSection/AnimatedSection';
import Footer from '../components/Footer';
import '../styles/landing.css';

export default function Platform() {
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
          <span className="font-bold text-lg">Platform</span>
        </div>
      </header>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h1 className="hero-title text-center mb-16">The RideMate<br />Architecture</h1>
          </AnimatedSection>

          <div className="space-y-20">
            <AnimatedSection delay={200}>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                    <Layers size={24} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Full-Stack Mobility</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Our platform integrates real-time dispatching, predictive routing, and seamless payments into a unified infrastructure.
                    Whether you're a daily commuter or a fleet manager, RideMate scales to your needs.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-3xl p-8 aspect-square flex items-center justify-center border border-black/5">
                  <div className="text-center">
                    <p className="text-6xl font-black mb-2">99.9%</p>
                    <p className="text-gray-500 uppercase tracking-widest text-sm">Uptime Reliability</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
                <div className="order-2 md:order-1 bg-black text-white rounded-3xl p-8 aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <Zap size={48} className="mx-auto mb-4" />
                    <p className="text-2xl font-bold">Real-Time Sync</p>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="text-3xl font-bold mb-4">Instantaneous Data</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Every ride, driver location, and transaction is synced in milliseconds.
                    Our WebSocket-based architecture ensures you never miss a beat, with live updates pushed directly to your device.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
