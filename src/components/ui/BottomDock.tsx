import React from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { useTrainControls } from '../../hooks/useTrainControls';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  LogOut,
} from 'lucide-react';

export const BottomDock: React.FC = () => {
  const phase = useJourneyStore((s) => s.phase);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);
  const stations = useJourneyStore((s) => s.stations);
  const nextStation = useJourneyStore((s) => s.nextStation);
  const prevStation = useJourneyStore((s) => s.prevStation);
  const cameraPreset = useJourneyStore((s) => s.cameraPreset);
  const setCameraPreset = useJourneyStore((s) => s.setCameraPreset);
  // Only re-render scrubber on 1% progress steps when in cab view
  const progress = useJourneyStore((s) => (s.cameraPreset === 'cab' ? Math.round(s.progress * 100) / 100 : 0));
  const setTargetProgress = useJourneyStore((s) => s.setTargetProgress);

  const {
    speedKmh,
    isCruising,
    toggleCruise,
    brake,
  } = useTrainControls();

  // ONLY render when in journey phase AND Driver Mode (cab view) is selected
  if (phase !== 'journey' || cameraPreset !== 'cab') {
    return null;
  }

  const maxSpeed = 120;
  const speedClamped = Math.min(maxSpeed, speedKmh);
  const needleRotation = -120 + (speedClamped / maxSpeed) * 240;
  const isMoving = speedKmh > 1;

  const handleTrackScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setTargetProgress(ratio);
  };

  return (
    <div
      data-no-drag="true"
      className="pointer-events-auto fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-auto select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
      aria-label="Driver Cabin Instrument Console"
    >
      {/* Compact High-Tech Driver Console Bar */}
      <div className="relative flex flex-col rounded-2xl border-2 border-amber-400/60 bg-[#061a12] p-2 shadow-[0_15px_50px_rgba(0,0,0,0.98)]">
        
        {/* Micro Track Runner Scrubber (Top Edge of Console) */}
        <div
          onClick={handleTrackScrub}
          className="group relative mb-1.5 flex h-2 w-full items-center cursor-pointer px-1"
          title="Scrub train position along route"
        >
          <div className="relative h-1 w-full rounded-full bg-slate-900 border border-slate-700/60 overflow-hidden group-hover:h-1.5 transition-all">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-amber-500 transition-all duration-75"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="absolute inset-x-1 flex justify-between pointer-events-none">
            {stations.map((stn, idx) => (
              <div
                key={stn.id}
                className={`h-2 w-0.5 rounded-full ${
                  idx === currentStationIndex ? 'bg-amber-400 scale-150' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center"
            style={{ left: `${Math.max(1.5, Math.min(98.5, progress * 100))}%` }}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400 border border-slate-950 shadow-sm shadow-amber-400" />
          </div>
        </div>

        {/* Main Single Compact Non-Overlapping Instrument Lane */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* 1. Prev Station Button */}
          <button
            onClick={prevStation}
            disabled={currentStationIndex === 0}
            className="flex items-center gap-1 rounded-xl border border-amber-400/40 bg-[#0a2419] px-2.5 py-1.5 text-xs font-mono font-bold text-amber-200 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
            title="Previous Station (Key A / Left Arrow)"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="text-[11px]">Prev</span>
          </button>

          {/* 2. Precision Driver Instrument Cluster */}
          <div className="flex items-center gap-2 bg-[#0a2419] rounded-xl border border-emerald-500/30 px-2 py-1 shrink-0">
            {/* Speedometer SVG Gauge */}
            <div className="relative h-7 w-7 sm:h-8 sm:w-8 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle cx="50" cy="50" r="42" fill="#061a12" stroke="#1e293b" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={isMoving ? '#10b981' : '#f59e0b'}
                  strokeWidth="6"
                  strokeDasharray="210"
                  strokeDashoffset={210 - (speedClamped / maxSpeed) * 160}
                  strokeLinecap="round"
                  transform="rotate(135 50 50)"
                />
                <circle cx="50" cy="50" r="4" fill="#fbbf24" />
              </svg>
              <div
                className="absolute h-3 w-0.5 bg-amber-400 origin-bottom rounded-full shadow-sm transition-transform duration-100"
                style={{ transform: `rotate(${needleRotation}deg)`, bottom: '50%' }}
              />
            </div>

            {/* Live Digital Speed & Status */}
            <div className="flex flex-col">
              <span className="font-mono text-xs font-black text-white leading-none">
                {speedKmh} <span className="text-[9px] text-amber-400">KM/H</span>
              </span>
              <span className="mt-0.5 flex items-center gap-1 font-mono text-[8px] font-bold">
                <span className={`h-1.5 w-1.5 rounded-full ${isMoving ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={isMoving ? 'text-emerald-300' : 'text-amber-300'}>
                  {isMoving ? 'CRUISING' : 'DOCKED'}
                </span>
              </span>
            </div>

            {/* Cruise / Brake Toggle */}
            <button
              onClick={isCruising ? brake : toggleCruise}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${
                isCruising
                  ? 'border border-amber-400 bg-amber-400 text-slate-950 font-black'
                  : 'border border-rose-500/50 bg-rose-500/15 text-rose-300 hover:bg-rose-500 hover:text-white'
              }`}
              title="Toggle Cruise or Brake (Spacebar)"
            >
              {isCruising ? <Pause className="h-2.5 w-2.5 fill-current" /> : <Play className="h-2.5 w-2.5 fill-current" />}
              <span>{isCruising ? 'Brake' : 'Cruise'}</span>
            </button>
          </div>

          {/* 3. Next Station / Terminus Form Button */}
          {currentStationIndex < stations.length - 1 ? (
            <button
              onClick={nextStation}
              className="flex items-center gap-1 rounded-xl border border-emerald-500/50 bg-[#0a2419] px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-200 hover:bg-emerald-400 hover:text-slate-950 transition-all cursor-pointer shrink-0"
              title="Next Station (Key D / Right Arrow)"
            >
              <span className="text-[11px]">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => useJourneyStore.getState().setPhase('terminus')}
              className="flex items-center gap-1 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1.5 text-xs font-mono font-black text-slate-950 hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer shadow-sm shrink-0"
              title="Open Terminus Concourse & Contact Gate"
            >
              <span className="text-[11px] uppercase tracking-wider">Contact Form</span>
            </button>
          )}

          {/* 4. Exit Cab Button - Included right here inside the middle panel */}
          <button
            onClick={() => setCameraPreset('chase')}
            className="flex items-center gap-1.5 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-mono font-black text-slate-950 hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer shadow-sm shrink-0"
            title="Exit Cab View and return to Chase Cam (Key V / Esc)"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-950" />
            <span className="text-[11px] uppercase tracking-wider">Exit Cab</span>
          </button>

        </div>
      </div>
    </div>
  );
};
