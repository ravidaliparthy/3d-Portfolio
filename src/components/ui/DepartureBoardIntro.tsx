import React, { useEffect } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { portfolioData } from '../../data';
import { useAudio } from '../../hooks/useAudio';
import {
  Train,
  Clock,
  ArrowRight,
  Ticket,
  Sparkles,
  ShieldCheck,
  Map,
} from 'lucide-react';

export const DepartureBoardIntro: React.FC = () => {
  const phase = useJourneyStore((s) => s.phase);
  const setPhase = useJourneyStore((s) => s.setPhase);
  const setPassModalOpen = useJourneyStore((s) => s.setPassModalOpen);
  const setRoadmapOpen = useJourneyStore((s) => s.setRoadmapOpen);
  const { handleUserGestureStart, playWhistle } = useAudio();

  const handleBoardTrain = () => {
    try {
      handleUserGestureStart();
      playWhistle();
    } catch (err) {
      console.warn('[Audio] User gesture audio initialization skipped:', err);
    }

    // Seamlessly transition right into Station 1 in Chase view mode!
    useJourneyStore.getState().setCameraPreset('chase');
    useJourneyStore.getState().setPanelHeight('full');
    useJourneyStore.getState().goToStation(0);
    setPhase('journey');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'intro' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleBoardTrain();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  if (phase !== 'intro' && phase !== 'boarding') return null;

  const intro = portfolioData.intro;
  const owner = portfolioData.owner;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleBoardTrain();
        }
      }}
      className={`fixed inset-0 z-40 pointer-events-auto flex items-center justify-center bg-black/75 px-3 sm:px-4 py-4 transition-opacity duration-500 overflow-y-auto cursor-default ${
        phase === 'boarding' ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the Ravi Express Departure Concourse"
    >
      {/* Container with Suspended Railway Station Banner Visual Framing */}
      <div className="relative w-full max-w-3xl my-auto text-left pt-2 sm:pt-6">
        
        {/* Overhead Brass Station Suspension Cables */}
        <div className="hidden sm:block pointer-events-none absolute -top-16 left-12 h-20 w-1.5 bg-gradient-to-b from-amber-200 via-amber-500 to-amber-600 shadow-md">
          <div className="absolute -top-2 -left-2 h-5 w-5 rounded-full border-2 border-slate-900 bg-amber-400 shadow" />
          <div className="absolute bottom-0 -left-1.5 h-4 w-4 rounded-full border border-slate-950 bg-amber-300 shadow" />
        </div>
        <div className="hidden sm:block pointer-events-none absolute -top-16 right-12 h-20 w-1.5 bg-gradient-to-b from-amber-200 via-amber-500 to-amber-600 shadow-md">
          <div className="absolute -top-2 -left-2 h-5 w-5 rounded-full border-2 border-slate-900 bg-amber-400 shadow" />
          <div className="absolute bottom-0 -left-1.5 h-4 w-4 rounded-full border border-slate-950 bg-amber-300 shadow" />
        </div>

        {/* Grand Railway Concourse Suspended Banner with Rich Opaque Heritage Styling */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-400/70 bg-[#04180f]/95 p-4 sm:p-6 md:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.95),0_0_60px_rgba(245,158,11,0.2),inset_0_1px_1px_rgba(255,255,255,0.25)] pointer-events-auto">
          
          {/* Decorative Corner Rivets */}
          <div className="pointer-events-none absolute top-3 left-3 h-2.5 w-2.5 rounded-full bg-amber-400/60 border border-slate-900 shadow" />
          <div className="pointer-events-none absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-amber-400/60 border border-slate-900 shadow" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-2.5 w-2.5 rounded-full bg-amber-400/60 border border-slate-900 shadow" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-2.5 w-2.5 rounded-full bg-amber-400/60 border border-slate-900 shadow" />

          {/* Banner Top Header Ribbon */}
          <div className="mb-4 sm:mb-5 flex flex-wrap items-center justify-between border-b border-slate-900/25 pb-3 sm:pb-4 gap-2.5 sm:gap-3 relative z-10">
            <div className="flex items-center gap-2.5 font-mono text-xs tracking-widest uppercase">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-950 border border-slate-900 text-amber-400 shadow-sm">
                <Train className="h-4 w-4" />
              </div>
              <div>
                <span className="font-black text-amber-300 block tracking-wider text-xs md:text-sm">ORIGIN CONCOURSE • TRACK 01</span>
                <span className="text-[10px] text-emerald-300 font-bold font-mono tracking-wide">HYDERABAD CENTRAL LINE</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-bold shadow-sm">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                {intro.departureTime}
              </span>
              <span className="rounded-lg bg-amber-400 px-2.5 sm:px-3 py-1 text-slate-950 font-black border border-amber-500 shadow-sm">
                {intro.platformNumber}
              </span>
              <span className="rounded-lg bg-emerald-400 px-2.5 py-1 text-slate-950 font-black border border-emerald-500 text-[11px] shadow-sm">
                ● BOARDING NOW
              </span>
            </div>
          </div>

          {/* WELCOME TO THE RAVI EXPRESS */}
          <div className="mb-4 sm:mb-6 space-y-1.5 sm:space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-600/70 bg-amber-400 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-950 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                CENTRAL MILESTONE EXPRESS
              </span>
              <span className="text-xs text-emerald-200 font-mono font-bold hidden sm:inline">
                12 Stations • Continuous Track Journey
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-sans drop-shadow-md">
              WELCOME TO THE RAVI EXPRESS
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-amber-300 font-mono font-bold tracking-wide">
              {owner.name} • {owner.title}
            </p>
          </div>

          {/* Conductor Welcome Panel featuring Charan's Exact Portrait */}
          <div className="mb-4 sm:mb-6 grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-5 rounded-2xl border border-amber-400/40 bg-[#061c13]/90 p-3 sm:p-4 md:p-6 shadow-inner relative z-10">
            {/* Left Column: Charan's Conductor Portrait Photo */}
            <div className="md:col-span-4 flex flex-col items-center justify-center gap-2 border-b md:border-b-0 md:border-r border-emerald-500/30 pb-3 md:pb-0 md:pr-4">
              <div className="relative group">
                <div className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 overflow-hidden rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-[#092218] via-[#051610] to-[#020b08] shadow-[0_12px_35px_rgba(0,0,0,0.85)]">
                  <img
                    src="/assets/guide/guide_reference.jpg"
                    alt="Conductor Charan"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                </div>
                <span className="absolute -bottom-2 inset-x-0 mx-auto w-max rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-0.5 text-[9px] font-black text-slate-950 uppercase tracking-widest shadow-md">
                  Journey Conductor
                </span>
              </div>
              <div className="text-center mt-1">
                <span className="text-xs font-black text-amber-300 block">Charan</span>
                <p className="text-[10px] text-emerald-200 font-mono font-bold">Conductor on the Express</p>
              </div>
            </div>

            {/* Right Column: Conductor Welcome & Journey Overview */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-2.5 sm:space-y-3.5">
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>All Aboard for 12 Verified Engineering Milestones</span>
                </h3>
                <p className="text-xs md:text-sm text-white font-medium leading-relaxed font-sans">
                  "Welcome aboard the Ravi Express! I am your conductor, Charan. Fasten your seatbelt as we embark on a 12-milestone continuous journey across published seismic AI research, national hackathons (selected 40 out of 400 teams, top 10%), and production edge architectures."
                </p>
              </div>

              {/* Quick Route Preview Cards across States */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-1 font-mono text-[10px] sm:text-[11px]">
                <div className="rounded-xl bg-[#03130c]/90 border border-amber-400/30 p-2 shadow-sm">
                  <span className="block text-emerald-300 text-[9px] uppercase font-bold tracking-wider">Station 01</span>
                  <span className="font-black text-amber-300 text-xs truncate block">About Me</span>
                </div>
                <div className="rounded-xl bg-[#03130c]/90 border border-emerald-400/30 p-2 shadow-sm">
                  <span className="block text-emerald-300 text-[9px] uppercase font-bold tracking-wider">Station 06</span>
                  <span className="font-black text-emerald-200 text-xs truncate block">IIT Dhanbad Paper</span>
                </div>
                <div className="rounded-xl bg-[#03130c]/90 border border-amber-400/40 p-2 shadow-sm bg-gradient-to-b from-[#082218]/90 to-[#03130c]/90">
                  <span className="block text-amber-300 text-[9px] uppercase font-black tracking-wider">Station 10 • Finalist</span>
                  <span className="font-black text-yellow-300 text-xs truncate block">40 / 400 Teams (Top 10%)</span>
                </div>
                <div className="rounded-xl bg-[#03130c]/90 border border-amber-400/30 p-2 shadow-sm">
                  <span className="block text-emerald-300 text-[9px] uppercase font-bold tracking-wider">Station 12</span>
                  <span className="font-black text-yellow-300 text-xs truncate block">Grand Central</span>
                </div>
              </div>

              {/* Conductor Dialogue Callout */}
              <div className="rounded-xl bg-gradient-to-r from-emerald-950/90 to-[#0b2b1d]/90 border border-emerald-400/40 px-3.5 py-2.5 text-xs text-white font-medium flex items-start gap-2.5 shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">Click below to board the train at Station 1 and begin your interactive ride along the rails!</span>
              </div>
            </div>
          </div>

          {/* Action Controls Ribbon */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 relative z-10">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Souvenir Boarding Pass Customizer */}
              <button
                onClick={() => setPassModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-amber-400/50 bg-[#09271c] px-3.5 py-2.5 text-xs font-bold text-amber-300 transition-all hover:bg-emerald-900/60 hover:text-white cursor-pointer justify-center shadow-md flex-1 sm:flex-initial"
              >
                <Ticket className="h-4 w-4 text-amber-400" />
                <span>Boarding Pass</span>
              </button>

              {/* 6-State Landscape Map Preview */}
              <button
                onClick={() => setRoadmapOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-amber-400/50 bg-[#09271c] px-3.5 py-2.5 text-xs font-bold text-amber-300 transition-all hover:bg-emerald-900/60 hover:text-white cursor-pointer justify-center shadow-md flex-1 sm:flex-initial"
              >
                <Map className="h-4 w-4 text-amber-400" />
                <span>6-State Map</span>
              </button>
            </div>

            {/* Board the Ravi Express CTA */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBoardTrain();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-7 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/30 transition-all hover:from-amber-300 hover:to-amber-400 hover:scale-[1.03] active:scale-95 cursor-pointer pointer-events-auto"
            >
              <span>Board the Ravi Express (Station 1)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
