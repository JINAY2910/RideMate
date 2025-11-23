import React from 'react';
import { ArrowRight, Shield, Globe, Zap, Smartphone, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Logo from '../components/Logo';
import CustomCursor from '../components/CustomCursor/CustomCursor';
import RollingReviews from '../components/RollingReviews/RollingReviews';
import AnimatedSection from '../components/AnimatedSection/AnimatedSection';
import FloatingActionButton from '../components/FloatingActionButton/FloatingActionButton';
import ScrollProgressBar from '../components/ScrollProgressBar';
import Footer from '../components/Footer';
import '../styles/landing.css';

export default function Landing() {
  const { navigateTo, authToken } = useApp();

  return (
    <div className="landing-page">
      <ScrollProgressBar />
      <CustomCursor />
      <FloatingActionButton />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-hover">
            <Logo className="h-10 w-10" />
            <span className="font-bold text-xl tracking-tight">RideMate</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigateTo('platform')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors cursor-hover">Platform</button>
            <button onClick={() => navigateTo('cities')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors cursor-hover">Cities</button>
            <button onClick={() => navigateTo('safety')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors cursor-hover">Safety</button>
          </nav>

          <div className="flex items-center gap-4">
            {authToken ? (
              <Button onClick={() => navigateTo('dashboard')} size="sm" className="cursor-hover">
                Dashboard
              </Button>
            ) : (
              <>
                <button onClick={() => navigateTo('login')} className="text-sm font-medium hover:text-gray-600 transition-colors cursor-hover">
                  Log in
                </button>
                <Button onClick={() => navigateTo('signup')} size="sm" className="bg-black text-white hover:bg-gray-800 cursor-hover">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto w-full">
          <AnimatedSection delay={200}>
            <h1 className="hero-title">
              Mobility,<br />
              Reimagined.
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <p className="hero-subtitle">
              Experience the future of urban transportation. Seamless, sustainable, and designed for the modern world.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={600}>
            <div className="hero-buttons">
              <Button
                size="lg"
                onClick={() => navigateTo('signup')}
                className="bg-black text-white px-8 py-4 rounded-full text-lg hover:scale-105 transition-transform cursor-hover"
              >
                Start Riding
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigateTo('platform')}
                className="bg-white text-black border border-black/10 px-8 py-4 rounded-full text-lg hover:bg-gray-50 cursor-hover"
              >
                Learn More
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="section-header">
            <span className="section-label">Why RideMate</span>
            <h2 className="section-title">Engineered for Excellence</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection delay={200} direction="up">
              <div className="feature-card cursor-hover">
                <div className="feature-icon-wrapper">
                  <Zap size={24} />
                </div>
                <h3 className="feature-title">Lightning Fast</h3>
                <p className="feature-desc">
                  Our predictive algorithms ensure the quickest routes and minimal wait times, getting you there faster.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400} direction="up">
              <div className="feature-card cursor-hover">
                <div className="feature-icon-wrapper">
                  <Shield size={24} />
                </div>
                <h3 className="feature-title">Safety First</h3>
                <p className="feature-desc">
                  Verified drivers, real-time tracking, and 24/7 support. Your safety is our absolute priority.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={600} direction="up">
              <div className="feature-card cursor-hover">
                <div className="feature-icon-wrapper">
                  <Globe size={24} />
                </div>
                <h3 className="feature-title">Global Scale</h3>
                <p className="feature-desc">
                  Available in major cities worldwide. One app, endless destinations. Travel without boundaries.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Rolling Reviews */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <AnimatedSection className="section-header">
          <span className="section-label">Community</span>
          <h2 className="section-title">Loved by Thousands</h2>
        </AnimatedSection>
        <RollingReviews />
      </section>

      {/* App Showcase */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <AnimatedSection direction="right">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 block">The App</span>
            <h2 className="text-5xl font-bold mb-6">Power in your pocket.</h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Manage rides, track payments, and connect with drivers—all from a beautifully designed interface.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 border border-white/20 rounded-lg px-4 py-2 cursor-hover hover:bg-white/10 transition-colors">
                <Smartphone size={24} />
                <div>
                  <p className="text-xs text-gray-400">Download on the</p>
                  <p className="font-bold">App Store</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border border-white/20 rounded-lg px-4 py-2 cursor-hover hover:bg-white/10 transition-colors">
                <Smartphone size={24} />
                <div>
                  <p className="text-xs text-gray-400">Get it on</p>
                  <p className="font-bold">Google Play</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="left" delay={300}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl rounded-full" />
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex items-center justify-center driver-partner-section">
                <div className="text-center driver-partner-content">
                  <Users size={48} className="mx-auto mb-4 text-white/80" />
                  <h3 className="text-2xl font-bold mb-2">Driver Partner?</h3>
                  <p className="text-gray-400 mb-6">Join our fleet and earn on your terms.</p>
                  <Button onClick={() => navigateTo('signup')} variant="secondary" className="bg-white text-black hover:bg-gray-200 cursor-hover">
                    Become a Driver
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
