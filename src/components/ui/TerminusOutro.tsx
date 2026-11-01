import React, { useState, useRef } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { portfolioData } from '../../data';
import emailjs from '@emailjs/browser';
import {
  RotateCcw,
  Mail,
  Linkedin,
  Github,
  Trophy,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Ticket,
  User,
  Eye,
  X,
  Sun,
  Moon,
} from 'lucide-react';

export const TerminusOutro: React.FC = () => {
  const phase = useJourneyStore((s) => s.phase);
  const goToStation = useJourneyStore((s) => s.goToStation);
  const setPassModalOpen = useJourneyStore((s) => s.setPassModalOpen);

  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cardTheme, setCardTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      if (search.get('theme') === 'dark' || window.location.hash.includes('theme=dark')) {
        return 'dark';
      }
    }
    return 'light';
  });

  if (phase !== 'terminus') return null;

  const { outro, owner, guide } = portfolioData;

  const handleRideAgain = () => {
    goToStation(0);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      await emailjs.sendForm(
        'service_btst4cs',
        'template_qf5orga',
        formRef.current,
        'WjvmFynigzZnyBPNw'
      );
      setStatus('success');
      formRef.current.reset();
    } catch (err: unknown) {
      console.error('[EmailJS Error]', err);
      setStatus('error');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to transmit message. Please contact ravidaliparthy@gmail.com directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-auto flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto"
      role="region"
      aria-label="Terminus Concourse Contact Me Page"
    >
      {/* Suspended Grand Central Terminus Arrival Banner */}
      <div className="relative w-full max-w-4xl my-auto text-left pt-6">
        
        {/* Overhead Brass Station Suspension Cables */}
        <div className="hidden sm:block pointer-events-none absolute -top-16 left-16 h-20 w-1.5 bg-gradient-to-b from-amber-200 via-amber-500 to-amber-600 shadow-md">
          <div className="absolute -top-2 -left-2 h-5 w-5 rounded-full border-2 border-slate-900 bg-amber-400 shadow" />
          <div className="absolute bottom-0 -left-1.5 h-4 w-4 rounded-full border border-slate-950 bg-amber-300 shadow" />
        </div>
        <div className="hidden sm:block pointer-events-none absolute -top-16 right-16 h-20 w-1.5 bg-gradient-to-b from-amber-200 via-amber-500 to-amber-600 shadow-md">
          <div className="absolute -top-2 -left-2 h-5 w-5 rounded-full border-2 border-slate-900 bg-amber-400 shadow" />
          <div className="absolute bottom-0 -left-1.5 h-4 w-4 rounded-full border border-slate-950 bg-amber-300 shadow" />
        </div>

        {/* Grand Banner Body with Full Card Light / Dark Theme Support */}
        <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 pointer-events-auto transition-all duration-300 ${
          cardTheme === 'light'
            ? 'border-2 border-amber-500/80 bg-slate-50 text-slate-900 shadow-[0_25px_80px_rgba(0,0,0,0.35),0_0_50px_rgba(245,158,11,0.25)]'
            : 'border-2 border-amber-400/60 bg-[#04180f]/85 text-white shadow-[0_20px_70px_rgba(0,0,0,0.85),0_0_60px_rgba(16,185,129,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)]'
        }`}>
          
          {/* Decorative Corner Rivets */}
          <div className={`pointer-events-none absolute top-3 left-3 h-2.5 w-2.5 rounded-full border shadow ${
            cardTheme === 'light' ? 'bg-amber-500 border-slate-400' : 'bg-amber-400/60 border-slate-900'
          }`} />
          <div className={`pointer-events-none absolute top-3 right-3 h-2.5 w-2.5 rounded-full border shadow ${
            cardTheme === 'light' ? 'bg-amber-500 border-slate-400' : 'bg-amber-400/60 border-slate-900'
          }`} />
          <div className={`pointer-events-none absolute bottom-3 left-3 h-2.5 w-2.5 rounded-full border shadow ${
            cardTheme === 'light' ? 'bg-amber-500 border-slate-400' : 'bg-amber-400/60 border-slate-900'
          }`} />
          <div className={`pointer-events-none absolute bottom-3 right-3 h-2.5 w-2.5 rounded-full border shadow ${
            cardTheme === 'light' ? 'bg-amber-500 border-slate-400' : 'bg-amber-400/60 border-slate-900'
          }`} />

          {/* Top Header Badge */}
          <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-5 mb-6 relative z-10 ${
            cardTheme === 'light' ? 'border-amber-300/80' : 'border-amber-400/25'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${
                cardTheme === 'light'
                  ? 'bg-amber-100 border-amber-400 text-amber-700'
                  : 'bg-amber-400/20 border-amber-400/40 text-amber-300'
              }`}>
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <span className={`text-[11px] font-mono font-bold uppercase tracking-widest block ${
                  cardTheme === 'light' ? 'text-amber-800' : 'text-amber-300'
                }`}>
                  {outro.stationName}
                </span>
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${
                  cardTheme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  Terminus Concourse & Contact Gate
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Full Card Light / Dark Theme Switcher */}
              <div className={`flex items-center rounded-xl border p-0.5 text-xs font-mono font-bold transition-all ${
                cardTheme === 'light'
                  ? 'border-amber-400 bg-amber-100 shadow-xs'
                  : 'border-amber-400/40 bg-[#03140c]'
              }`}>
                <button
                  type="button"
                  onClick={() => setCardTheme('light')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    cardTheme === 'light'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Switch entire card to Light theme"
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('dark')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    cardTheme === 'dark'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                  title="Switch entire card to Dark Glass theme"
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark (Glass)</span>
                </button>
              </div>

              <button
                onClick={() => setPassModalOpen(true)}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  cardTheme === 'light'
                    ? 'border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200'
                    : 'border-amber-400/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black shadow-md'
                }`}
              >
                <Ticket className="h-4 w-4" />
                <span>Souvenir Pass</span>
              </button>

              <button
                onClick={() => useJourneyStore.getState().setPhase('journey')}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
                  cardTheme === 'light'
                    ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                    : 'border-white/20 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
                title="View 3D Station Scene"
              >
                <Eye className={`h-3.5 w-3.5 ${cardTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                <span>Explore 3D</span>
              </button>

              <button
                onClick={handleRideAgain}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
                  cardTheme === 'light'
                    ? 'border-emerald-400 bg-emerald-100 text-emerald-950 hover:bg-emerald-200'
                    : 'border-emerald-500/30 bg-[#061e15] text-emerald-200 hover:bg-[#0a2e21] hover:text-white'
                }`}
              >
                <RotateCcw className={`h-3.5 w-3.5 ${cardTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                <span>Ride Again</span>
              </button>

              <button
                onClick={() => useJourneyStore.getState().setPhase('journey')}
                className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-sm ${
                  cardTheme === 'light'
                    ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    : 'border-white/20 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
                title="Close board to view 3D Station"
                aria-label="Close board"
              >
                <X className={`h-4 w-4 ${cardTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
              </button>
            </div>
          </div>

          {/* Conductor Farewell Banner with Portrait Photo */}
          <div className={`mb-6 flex items-center gap-4 rounded-2xl border p-4 relative z-10 transition-colors ${
            cardTheme === 'light'
              ? 'border-amber-300 bg-amber-50/80 shadow-xs text-slate-900'
              : 'border-amber-400/40 bg-[#061c13]/70 shadow-inner text-white'
          }`}>
            <div className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 shadow-lg ${
              cardTheme === 'light'
                ? 'border-amber-500 bg-amber-100'
                : 'border-amber-400/80 bg-[#04160e]'
            }`}>
              <img
                src="/assets/guide/guide_reference.jpg"
                alt="Conductor Charan"
                className="h-full w-full object-cover object-top"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/guide/charan_avatar.jpg';
                }}
              />
            </div>
            <div className="text-xs space-y-1">
              <span className={`font-black block text-sm ${cardTheme === 'light' ? 'text-amber-800' : 'text-amber-300'}`}>
                Conductor {guide.name}
              </span>
              <p className={`font-medium leading-relaxed ${cardTheme === 'light' ? 'text-slate-700' : 'text-white'}`}>
                "{guide.outroLines[0]} {guide.outroLines[1]}"
              </p>
            </div>
          </div>

          {/* 2-Column Layout: Direct Contact Info & Live Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
            {/* Left Column (2 spans): Contact details & Links */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h2 className={`text-base font-black mb-1 ${cardTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {outro.farewellTitle}
                </h2>
                <p className={`text-xs font-semibold leading-relaxed mb-4 ${cardTheme === 'light' ? 'text-amber-800' : 'text-amber-200'}`}>
                  {outro.farewellSubtitle}
                </p>
              </div>

              <div className="space-y-2.5 text-xs font-mono font-medium">
                <a
                  href={`mailto:${owner.email}`}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 transition-all cursor-pointer shadow-xs ${
                    cardTheme === 'light'
                      ? 'border-slate-300 bg-white text-slate-800 hover:border-amber-500 hover:bg-amber-50/50'
                      : 'border-emerald-500/30 bg-[#04160e]/80 text-slate-100 hover:border-amber-400 hover:text-white'
                  }`}
                >
                  <Mail className={`h-4 w-4 shrink-0 ${cardTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                  <span className="truncate">{owner.email}</span>
                </a>

                <a
                  href={`tel:${owner.phone}`}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 transition-all cursor-pointer shadow-xs ${
                    cardTheme === 'light'
                      ? 'border-slate-300 bg-white text-slate-800 hover:border-amber-500 hover:bg-amber-50/50'
                      : 'border-emerald-500/30 bg-[#04160e]/80 text-slate-100 hover:border-amber-400 hover:text-white'
                  }`}
                >
                  <Phone className={`h-4 w-4 shrink-0 ${cardTheme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`} />
                  <span>{owner.phone}</span>
                </a>

                <div className={`flex items-center gap-2.5 rounded-xl border p-3 shadow-xs ${
                  cardTheme === 'light'
                    ? 'border-slate-300 bg-white text-slate-800'
                    : 'border-emerald-500/30 bg-[#04160e]/80 text-white'
                }`}>
                  <MapPin className={`h-4 w-4 shrink-0 ${cardTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                  <span>{owner.location}</span>
                </div>
              </div>

              {/* Social / Profile Links */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={owner.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-colors cursor-pointer ${
                    cardTheme === 'light'
                      ? 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100 hover:border-amber-400 hover:text-sky-700'
                      : 'border-emerald-500/30 bg-[#04160e]/80 text-white hover:bg-[#072417] hover:text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-sky-500" />
                    <span>LinkedIn Profile</span>
                  </div>
                  <span className={`text-[10px] font-bold ${cardTheme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>Connect ➔</span>
                </a>

                <a
                  href={owner.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-colors cursor-pointer ${
                    cardTheme === 'light'
                      ? 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100 hover:border-amber-400 hover:text-slate-700'
                      : 'border-emerald-500/30 bg-[#04160e]/80 text-white hover:bg-[#072417] hover:text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Github className={`h-4 w-4 ${cardTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`} />
                    <span>GitHub Repositories</span>
                  </div>
                  <span className={`text-[10px] font-bold ${cardTheme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>Inspect ➔</span>
                </a>

                <a
                  href={`mailto:${owner.email}`}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-black transition-colors cursor-pointer shadow-xs ${
                    cardTheme === 'light'
                      ? 'border-amber-500 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400'
                      : 'border-amber-400/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Direct Email Dispatch</span>
                  </div>
                  <span className="text-[10px]">Send ➔</span>
                </a>
              </div>
            </div>

            {/* Right Column (3 spans): Embedded EmailJS Contact Form */}
            <div
              className={`lg:col-span-3 rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
                cardTheme === 'light'
                  ? 'border-2 border-amber-400/80 bg-white text-slate-900 shadow-sm'
                  : 'border border-amber-400/40 bg-[#061c13]/75 text-white shadow-[0_0_50px_rgba(0,0,0,0.9)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1 gap-2">
                <h3 className={`text-sm font-black flex items-center gap-2 ${cardTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  <Send className={`h-4 w-4 ${cardTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                  <span>Send Me an Inquiry</span>
                </h3>

                {/* Theme Switcher in Form syncing the entire card */}
                <div className={`flex items-center rounded-lg border p-0.5 text-[10px] font-mono font-bold ${
                  cardTheme === 'light' ? 'border-slate-300 bg-slate-100' : 'border-amber-400/40 bg-[#03140c]'
                }`}>
                  <button
                    type="button"
                    onClick={() => setCardTheme('light')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      cardTheme === 'light'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('dark')}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      cardTheme === 'dark'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dark (Glass)
                  </button>
                </div>
              </div>

              <p className={`text-xs font-medium mb-4 ${cardTheme === 'light' ? 'text-slate-600' : 'text-emerald-200'}`}>
                Messages transmit directly to Charan's inbox via verified EmailJS service.
              </p>

              {status === 'success' ? (
                <div className={`py-8 text-center space-y-3 rounded-2xl border p-6 ${
                  cardTheme === 'light'
                    ? 'bg-emerald-50/80 border-emerald-200 text-slate-900'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-100'
                }`}>
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-md ${
                    cardTheme === 'light'
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                      : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                  }`}>
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className={`text-base font-bold ${cardTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Inquiry Transmitted!
                  </h4>
                  <p className={`text-xs max-w-xs mx-auto ${cardTheme === 'light' ? 'text-slate-600' : 'text-emerald-200'}`}>
                    Thank you! Your dispatch has been delivered directly to Charan. He will reply shortly.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-5 py-2 text-xs font-black text-slate-950 hover:from-amber-300 hover:to-amber-500 transition-all cursor-pointer shadow-md"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleContactSubmit} className="space-y-3.5">
                  {status === 'error' && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-800">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                        cardTheme === 'light' ? 'text-slate-700' : 'text-amber-300'
                      }`}>
                        Your Name
                      </label>
                      <div className="relative">
                        <User className={`absolute left-3 top-2.5 h-3.5 w-3.5 ${
                          cardTheme === 'light' ? 'text-slate-400' : 'text-emerald-400'
                        }`} />
                        <input
                          type="text"
                          name="from_name"
                          required
                          placeholder="e.g. Recruit Lead / Engineer"
                          className={`w-full rounded-xl py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:outline-none pointer-events-auto shadow-xs transition-all ${
                            cardTheme === 'light'
                              ? 'border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                              : 'border border-emerald-500/40 bg-[#03140c]/80 text-white focus:border-amber-400 shadow-inner'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                        cardTheme === 'light' ? 'text-slate-700' : 'text-amber-300'
                      }`}>
                        Your Email
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-2.5 h-3.5 w-3.5 ${
                          cardTheme === 'light' ? 'text-slate-400' : 'text-emerald-400'
                        }`} />
                        <input
                          type="email"
                          name="from_email"
                          required
                          placeholder="name@company.com"
                          className={`w-full rounded-xl py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:outline-none pointer-events-auto shadow-xs transition-all ${
                            cardTheme === 'light'
                              ? 'border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                              : 'border border-emerald-500/40 bg-[#03140c]/80 text-white focus:border-amber-400 shadow-inner'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      cardTheme === 'light' ? 'text-slate-700' : 'text-amber-300'
                    }`}>
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      placeholder="Engineering Role / Project Opportunity"
                      className={`w-full rounded-xl py-2 px-3 text-xs placeholder-slate-400 focus:outline-none pointer-events-auto shadow-xs transition-all ${
                        cardTheme === 'light'
                          ? 'border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                          : 'border border-emerald-500/40 bg-[#03140c]/80 text-white focus:border-amber-400 shadow-inner'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      cardTheme === 'light' ? 'text-slate-700' : 'text-amber-300'
                    }`}>
                      Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={3}
                      placeholder="Provide details about your inquiry or team..."
                      className={`w-full rounded-xl p-3 text-xs placeholder-slate-400 focus:outline-none pointer-events-auto resize-none shadow-xs transition-all ${
                        cardTheme === 'light'
                          ? 'border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                          : 'border border-emerald-500/40 bg-[#03140c]/80 text-white focus:border-amber-400 shadow-inner'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/30 hover:from-amber-300 hover:to-amber-500 hover:scale-[1.01] disabled:opacity-50 transition-all cursor-pointer pointer-events-auto"
                  >
                    {isSubmitting ? (
                      <span>Transmitting Dispatch...</span>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Transmit Dispatch to Charan</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
