import React from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { useTrainControls } from '../../hooks/useTrainControls';
import {
  ChevronLeft,
  ChevronRight,
  Video,
  FileText,
  AlertTriangle,
  Pause,
} from 'lucide-react';

/**
 * Compact, Low-Profile Train Driver Cabin Cockpit Console
 * - Decreased height & zero screen overlap
 * - Real-time circular SVG precision speedometer with sweeping needle
 * - Digital train telemetry computer (station, track, route progress)
 * - Tactile Throttle [D], Reverser [A], Brake [Space], and Dossier [P] controls
 * - 100% unobstructed panoramic front view down the tracks
 */
export const DriverCockpitOverlay: React.FC = () => {
  const phase = useJourneyStore((s) => s.phase);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);
  const stations = useJourneyStore((s) => s.stations);
  const progress = useJourneyStore((s) => s.progress);
  const setTargetProgress = useJourneyStore((s) => s.setTargetProgress);
  const cameraMode = useJourneyStore((s) => s.cameraMode);
  const toggleCameraMode = useJourneyStore((s) => s.toggleCameraMode);
  const isStationPanelCollapsed = useJourneyStore((s) => s.isStationPanelCollapsed);
  const toggleStationPanel = useJourneyStore((s) => s.toggleStationPanel);

  const {
    isDragging,
    isCruising,
    speedKmh,
    toggleCruise,
    cruiseForward,
    cruiseReverse,
    brake,
  } = useTrainControls();

  // Only display during journey phase
  if (phase !== 'journey') return null;

  const currentStation = stations[currentStationIndex];
  const isMoving = speedKmh > 1 || isDragging;

  // Speedometer needle rotation: 0 km/h = -120 deg, 120 km/h = +120 deg
  const maxSpeed = 120;
  const speedClamped = Math.min(maxSpeed, speedKmh);
  const needleRotation = -120 + (speedClamped / maxSpeed) * 240;

  const handleTrackScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setTargetProgress(ratio);
  };

  // If in cinematic exterior chase mode, render a clean floating switcher pill
  if (cameraMode === 'cinematic') {
    return (
      <div
        data-no-drag="true"
        className="pointer-events-auto fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2"
      >
        <button
          onClick={toggleCameraMode}
          className="flex items-center gap-2 rounded-full border-2 border-amber-400/80 bg-[#020b06]/98 px-5 py-2 text-xs font-mono font-black text-amber-300 shadow-[0_10px_35px_rgba(0,0,0,0.95)] hover:bg-amber-400 hover:text-slate-950 hover:scale-105 transition-all cursor-pointer"
          title="Switch to Front Driver Cockpit View (Key V)"
        >
          <Video className="h-4 w-4 text-amber-400" />
          <span>ENTER DRIVER CABIN [V]</span>
        </button>
      </div>
    );
  }

  return (
    <div
      data-no-drag="true"
      className="pointer-events-auto fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-[96vw] max-w-4xl select-none"
    >
      {/* Low-Profile Sleek Driver Cockpit Console */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-[#020906]/98 p-2.5 sm:p-3 shadow-[0_15px_50px_rgba(0,0,0,0.98),0_0_30px_rgba(251,191,36,0.15)]">
        
        {/* Upper Embedded Route Track Progress Bar */}
        <div
          onClick={handleTrackScrub}
          className="group relative mb-2 flex h-3 w-full items-center cursor-pointer px-1"
          title="Click or drag anywhere on the track to scrub train position"
        >
          <div className="relative h-1.5 w-full rounded-full bg-slate-900 border border-slate-700/80 overflow-hidden group-hover:h-2 transition-all">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 transition-all duration-75"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="absolute inset-x-1 flex justify-between pointer-events-none">
            {stations.map((stn, idx) => (
              <div
                key={stn.id}
                className={`h-2.5 w-1 rounded-full ${
                  idx === currentStationIndex ? 'bg-amber-400 scale-125' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          {/* Locomotive Pin on Track */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center"
            style={{ left: `${Math.max(1.5, Math.min(98.5, progress * 100))}%` }}
          >
            <div className="h-3.5 w-3.5 rounded-full bg-amber-400 border-2 border-slate-950 shadow-md shadow-amber-400/60" />
          </div>
        </div>

        {/* Console Layout: Speedometer | Telemetry Screen | Driver Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4">
          
          {/* 1. Precision Circular Analog Speedometer Gauge */}
          <div className="flex items-center gap-2.5 shrink-0 bg-[#04120a] rounded-xl border border-amber-400/30 p-1.5 sm:px-3">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center">
              {/* Circular Gauge Face SVG */}
              <svg viewBox="0 0 100 100" className="h-full w-full">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="#030b06"
                  stroke="#1e293b"
                  strokeWidth="5"
                />
                {/* Active Speed Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={isMoving ? '#10b981' : '#f59e0b'}
                  strokeWidth="4"
                  strokeDasharray="210"
                  strokeDashoffset={210 - (speedClamped / maxSpeed) * 160}
                  strokeLinecap="round"
                  transform="rotate(135 50 50)"
                />
                {/* Center Indicator */}
                <circle cx="50" cy="50" r="4" fill="#fbbf24" />
              </svg>

              {/* Sweeping Needle */}
              <div
                className="absolute h-5 sm:h-6 w-0.5 bg-amber-400 origin-bottom rounded-full shadow-md transition-transform duration-100"
                style={{
                  transform: `rotate(${needleRotation}deg)`,
                  bottom: '50%',
                }}
              />

              <span className="absolute bottom-1.5 font-mono text-[7px] sm:text-[8px] font-black text-slate-400">
                KM/H
              </span>
            </div>

            {/* Live Numerical Speed Display */}
            <div className="flex flex-col">
              <span className="font-mono text-sm sm:text-base font-black text-white leading-none">
                {speedKmh} <span className="text-[10px] text-amber-400">KM/H</span>
              </span>
              <span className="mt-0.5 flex items-center gap-1 font-mono text-[9px] font-bold">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isMoving ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span className={isMoving ? 'text-emerald-300' : 'text-amber-300'}>
                  {isMoving ? 'CRUISING' : 'DOCKED'}
                </span>
              </span>
            </div>
          </div>

          {/* 2. Train Telemetry Computer Screen */}
          <div className="flex-1 min-w-[180px] rounded-xl border border-emerald-500/30 bg-[#03140c] px-3 py-1.5 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold border-b border-emerald-500/20 pb-0.5">
              <span>STN {(currentStationIndex + 1).toString().padStart(2, '0')} // TRACK 01</span>
              <span className="text-amber-300">KM {((currentStationIndex + 1) * 3.8).toFixed(1)}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white truncate py-0.5">
              {currentStation?.title}
            </h4>
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold pt-0.5">
              <span className="text-amber-400/90 truncate max-w-[140px] sm:max-w-xs">{currentStation?.organization}</span>
              <span className="text-emerald-400 font-bold">{currentStation?.period}</span>
            </div>
          </div>

          {/* 3. Driver Controls & Action Levers */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Reverse Lever [A] */}
            <button
              onClick={cruiseReverse}
              disabled={currentStationIndex === 0}
              className="flex items-center gap-1 rounded-xl border border-amber-400/40 bg-[#061e14] px-2.5 sm:px-3 py-2 text-xs font-mono font-bold text-amber-200 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
              title="Reverse Train (Key A / Left Arrow)"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Rev [A]</span>
            </button>

            {/* Throttle / Cruise Forward [D] */}
            <button
              onClick={cruiseForward}
              disabled={currentStationIndex === stations.length - 1}
              className="flex items-center gap-1 rounded-xl border border-emerald-500/60 bg-emerald-500/20 px-3 sm:px-3.5 py-2 text-xs font-mono font-black text-emerald-200 hover:bg-emerald-400 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
              title="Throttle Train Forward (Key D / Right Arrow)"
            >
              <span>Throttle [D]</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Emergency Brake / Cruise Toggle [Space] */}
            <button
              onClick={isCruising ? brake : toggleCruise}
              className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-mono font-black transition-all cursor-pointer shadow-md ${
                isCruising
                  ? 'border border-amber-400 bg-amber-400 text-slate-950'
                  : 'border border-rose-500/70 bg-rose-500/20 text-rose-200 hover:bg-rose-500 hover:text-white'
              }`}
              title="Apply Brake or Toggle Cruise (Spacebar)"
            >
              {isCruising ? (
                <>
                  <Pause className="h-3 w-3 fill-current" />
                  <span>Cruise</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  <span>Brake [Space]</span>
                </>
              )}
            </button>

            {/* Open Station Dossier Modal [P] */}
            <button
              onClick={toggleStationPanel}
              className={`flex items-center gap-1 rounded-xl border px-2.5 sm:px-3 py-2 text-xs font-mono font-bold transition-all cursor-pointer shadow-md ${
                !isStationPanelCollapsed
                  ? 'border-amber-400 bg-amber-400 text-slate-950 font-black'
                  : 'border-white/20 bg-slate-900/90 text-slate-200 hover:bg-white/10'
              }`}
              title="Inspect Station Dossier & Engineering Trade-offs (Key P)"
            >
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Dossier [P]</span>
            </button>

            {/* Switch to Exterior Chase View [V] */}
            <button
              onClick={toggleCameraMode}
              className="flex items-center gap-1 rounded-xl border border-white/20 bg-slate-900/90 px-2.5 py-2 text-xs font-mono font-bold text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="Switch to 3rd-Person Chase View (Key V)"
            >
              <Video className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline">Chase [V]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
