import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  MapPin,
  Wallet,
  Star,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Layout from '../components/Layout';

export default function Landing() {
  const { navigateTo, authToken } = useApp();
  const [activeReview, setActiveReview] = useState(0);

  const stats = [
    { label: 'Cities', value: '3+', detail: 'Expanding monthly' },
    { label: 'Trips', value: '10K+', detail: 'Weekly rides' },
    { label: 'Rating', value: '4.9', detail: 'Average score' },
  ];

  const features = [
    {
      icon: MapPin,
      title: 'Smart Routing',
      desc: 'Predictive pickups with ±2 min ETA accuracy.',
    },
    {
      icon: ShieldCheck,
      title: 'Safety First',
      desc: 'Real-time trip sharing and 24/7 support.',
    },
    {
      icon: Wallet,
      title: 'Fair Pricing',
      desc: 'Transparent fares with no hidden surges.',
    },
  ];

  const testimonials = [
    {
      quote:
        'RideMate lets us coordinate 30+ daily carpools without a dispatcher. The live dashboard is basically air traffic control for commutes.',
      name: 'Nirali Shah',
      role: 'Mobility lead • Pune',
    },
    {
      quote:
        'As a driver, heatmap nudges and payout transparency mean I never guess where to go. My idle time dropped by half.',
      name: 'Diego Martínez',
      role: 'Driver-partner • Mexico City',
    },
    {
      quote:
        'We run company offsites and RideMate handles every airport transfer. The concierge chat and multi-stop planner are game changers.',
      name: 'Leah Williams',
      role: 'Ops director • Seattle',
    },
  ];

  useEffect(() => {
    const ticker = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(ticker);
  }, [testimonials.length]);

  return (
    <Layout fullWidth>
      <div className="bg-white text-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gray-100 rounded-full translate-x-1/3 -translate-y-1/3 opacity-50 blur-3xl" />

          <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight">RideMate</span>
            </div>
            <div className="flex items-center gap-4">
              {authToken ? (
                <Button onClick={() => navigateTo('dashboard')} size="sm">
                  Dashboard
                </Button>
              ) : (
                <>
                  <button onClick={() => navigateTo('login')} className="font-semibold text-sm hover:text-black text-gray-600 transition-colors">
                    Log in
                  </button>
                  <Button onClick={() => navigateTo('signup')} size="sm">
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live in 3 cities
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black mb-8 leading-[1.1]">
                The modern way to <br />
                <span className="text-gray-400">move together.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
                RideMate connects communities with reliable, safe, and efficient carpooling.
                Whether you're driving or riding, every journey is better shared.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigateTo('signup')} className="px-8">
                  Start Riding
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigateTo('platform')} className="px-8">
                  How it works
                </Button>
              </div>
            </div>
          </main>
        </div>

        {/* Stats Section */}
        <div className="border-y border-gray-100 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-3 gap-8 md:gap-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center md:text-left">
                  <p className="text-3xl md:text-4xl font-bold text-black mb-1">{stat.value}</p>
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="space-y-4">
                  <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-black">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-black text-white py-24 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-blue-500 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <div className="mb-12">
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="fill-white text-white" size={20} />
                ))}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-8">
                "{testimonials[activeReview].quote}"
              </h2>
              <div>
                <p className="font-bold text-lg">{testimonials[activeReview].name}</p>
                <p className="text-gray-400">{testimonials[activeReview].role}</p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveReview(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${activeReview === idx ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-bold text-black mb-6">Ready to get moving?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of riders and drivers saving time and money every day.
          </p>
          <Button size="lg" onClick={() => navigateTo('signup')} className="px-12">
            Get Started Now
          </Button>
        </div>
      </div>
    </Layout>
  );
}
