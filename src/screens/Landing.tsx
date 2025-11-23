import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Users,
  MapPin,
  Clock3,
  Wallet,
  Car,
  Star,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Logo from '../components/Logo';

export default function Landing() {
  const { navigateTo, authToken } = useApp();
  const [persona, setPersona] = useState<'rider' | 'driver'>('rider');
  const [activeReview, setActiveReview] = useState(0);

  const stats = [
    { label: 'Cities synced', value: '3+', detail: 'Expanding monthly' },
    { label: 'Trips weekly', value: '10K', detail: 'Peak reliability' },
    { label: 'Avg. response', value: '42s', detail: 'Live operations' },
  ];

  const personaHighlights = {
    rider: [
      {
        icon: MapPin,
        title: 'Predictive pickups',
        metric: '±2 min ETA',
        desc: 'Detours auto-adjust to traffic, so arrivals feel seamless.',
      },
      {
        icon: ShieldCheck,
        title: 'Layered safety',
        metric: '24/7 ops',
        desc: 'Real-time trip sharing, SOS laddering, verified driver bios.',
      },
      {
        icon: Wallet,
        title: 'Flexible payments',
        metric: '3 loyalty tiers',
        desc: 'Split fares, reward miles, and instant refunds when plans shift.',
      },
    ],
    driver: [
      {
        icon: Car,
        title: 'Smart demand zones',
        metric: '+22% earnings',
        desc: 'Heatmaps and route playlists keep your car full at peak hours.',
      },
      {
        icon: Clock3,
        title: 'Schedule autonomy',
        metric: 'Stacked drops',
        desc: 'Batch requests, pause instantly, and sync breaks with commute flows.',
      },
      {
        icon: Users,
        title: 'Community trust',
        metric: '4.9⭐ avg',
        desc: 'Transparent rider scoring with dispute resolution that protects pros.',
      },
    ],
  };

  const testimonials = [
    {
      quote:
        'RideMate lets us coordinate 30+ daily carpools without a dispatcher. The live dashboard is basically air traffic control for commutes.',
      name: 'Nirali Shah',
      role: 'Mobility lead • Pune',
      rating: 5,
    },
    {
      quote:
        'As a driver, heatmap nudges and payout transparency mean I never guess where to go. My idle time dropped by half.',
      name: 'Diego Martínez',
      role: 'Driver-partner • Mexico City',
      rating: 5,
    },
    {
      quote:
        'We run company offsites and RideMate handles every airport transfer. The concierge chat and multi-stop planner are game changers.',
      name: 'Leah Williams',
      role: 'Ops director • Seattle',
      rating: 4,
    },
  ];

  const trustSignals = ['Verified IDs', 'Live telemetry', 'Insurance backed', 'SOC2 in progress'];

  useEffect(() => {
    const ticker = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(ticker);
  }, [testimonials.length]);

  const currentTestimonials = testimonials[activeReview];

  return (
    <div className="min-h-screen bg-zinc-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        <header className="sticky top-0 z-20 mb-6 flex items-center justify-between rounded-3xl border border-black/5 bg-white/80 px-4 sm:px-6 py-4 shadow-[0_10px_45px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 sm:h-14 sm:w-14 shadow-xl" />
            <div>
              <p className="text-[10px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.45em] text-gray-500">RideMate</p>
              <p className="font-semibold text-sm sm:text-lg hidden sm:block">Community mobility OS</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <button onClick={() => navigateTo('platform')} className="hover:text-gray-900 transition-colors">
              Platform
            </button>
            <button onClick={() => navigateTo('safety')} className="hover:text-gray-900 transition-colors">
              Safety
            </button>
            <button onClick={() => navigateTo('cities')} className="hover:text-gray-900 transition-colors">
              Cities
            </button>
          </div>
          <div className="flex items-center gap-3">
            {authToken ? (
              <Button onClick={() => navigateTo('dashboard')} size="sm">
                Dashboard
              </Button>
            ) : (
              <>
                <button
                  onClick={() => navigateTo('login')}
                  className="px-3 sm:px-5 py-2 rounded-full border border-black/10 font-semibold hover:bg-black/5 transition-all duration-300 text-sm"
                >
                  Log in
                </button>
                <Button onClick={() => navigateTo('signup')} size="sm" className="hidden sm:flex">
                  Create account
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
          <section className="space-y-8">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1 text-sm font-semibold text-black">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Faster routes with human-first guardrails
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-gray-900">
                The carpool command center for riders, drivers, and teams on the move.
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                RideMate blends predictive routing, live safety escalation, and transparent earnings into a single surface.
                Switch between rider and driver tooling instantly and orchestrate journeys that feel concierge-level every time.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] space-y-1"
                >
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-500">{stat.label}</p>
                  <p className="text-sm text-gray-500">{stat.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.09)] space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {(['rider', 'driver'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setPersona(option)}
                    className={`rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 ${persona === option ? 'bg-black text-white shadow-lg' : 'bg-black/5 text-gray-700 hover:bg-black/10'
                      }`}
                  >
                    {option === 'rider' ? 'Rider experience' : 'Driver toolkit'}
                  </button>
                ))}
                <span className="text-xs uppercase tracking-[0.3em] text-gray-500 ml-auto">Live preview</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {personaHighlights[persona].map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-black/5 bg-white p-4 space-y-3 hover:-translate-y-1 transition-transform duration-300 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-2xl bg-black/5 p-2 text-black">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{feature.metric}</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{feature.title}</p>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                fullWidth
                onClick={() => navigateTo('login')}
                className="bg-black text-white hover:bg-gray-900"
              >
                Start planning
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white">
                  <ArrowRight size={18} />
                </span>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                fullWidth
                onClick={() => navigateTo('signup')}
                className="bg-white text-black border border-black/10 hover:bg-gray-100"
              >
                Create free workspace
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              No credit card · SOC2 in progress · Cancel anytime · Concierge onboarding for teams
            </p>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_25px_75px_rgba(15,23,42,0.08)] space-y-5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-black" />
                <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Live snapshots</p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-black/5 bg-white p-4 space-y-2">
                  <p className="text-sm text-gray-500">Driver earnings feed</p>
                  <p className="text-3xl font-semibold text-gray-900">+ ₹5,640</p>
                  <p className="text-xs text-gray-500">4 stacked drops · South Loop</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-4 space-y-2">
                  <p className="text-sm text-gray-500">Rider check-ins</p>
                  <p className="text-3xl font-semibold text-gray-900">98%</p>
                  <p className="text-xs text-gray-500">Within 2 min of ETA</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-4 flex items-center gap-3">
                  <Zap className="h-6 w-6 text-black" />
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Ops window</p>
                    <p className="font-semibold text-gray-900">2 dispatchers online now</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] space-y-5 text-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Reviews</p>
                  <h3 className="text-2xl font-semibold mt-2">Trusted by riders + drivers</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveReview((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                    className="rounded-full border border-black/10 p-2 hover:bg-black/5 transition-all duration-300"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => setActiveReview((prev) => (prev + 1) % testimonials.length)}
                    className="rounded-full border border-black/10 p-2 hover:bg-black/5 transition-all duration-300"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 border border-black/5 space-y-4 shadow-inner min-h-[220px]">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: currentTestimonials.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg leading-relaxed text-gray-700">&ldquo;{currentTestimonials.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900">{currentTestimonials.name}</p>
                  <p className="text-sm text-gray-500">{currentTestimonials.role}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {trustSignals.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-widest text-gray-600 bg-white"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
