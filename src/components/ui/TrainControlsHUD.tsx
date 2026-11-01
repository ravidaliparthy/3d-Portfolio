import React, { useState } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { useTrainControls } from '../../hooks/useTrainControls';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Gauge,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Video,
  Eye,
  EyeOff,
} from 'lucide-react';

export const TrainControlsHUD: React.FC = () => {
  const phase = useJourneyStore((s) => s.phase);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);
  const stations = useJourneyStore((s) => s.stations);
  const progress = useJourneyStore((s) => s.progress);
  const setTargetProgress = useJourneyStore((s) => s.setTargetProgress);
  const goToStation = useJourneyStore((s) => s.goToStation);
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

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only display during journey phase
  if (phase !== 'journey') return null;

  const currentStation = stations[currentStationIndex];
  const isMoving = speedKmh > 1 || isDragging;

  const handleTrackScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    useJourneyStore.getState().recordDirectInput();
    setTargetProgress(ratio);
  };

  return (
    <div
      data-no-drag="true"
      className="pointer-events-auto fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center select-none max-w-[96vw] sm:max-w-2xl"
    >
      {/* Mini Toggle Pill when Collapsed */}
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 rounded-full border-2 border-amber-400/60 bg-[#020b06]/98 px-4 py-1.5 text-xs font-mono font-bold text-amber-300 shadow-2xl hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer"
          title="Expand Locomotive Controls"
        >
          <Gauge className="h-3.5 w-3.5 text-amber-400" />
          <span>
            {isMoving ? `CRUISING ${speedKmh} KM/H` : `STN ${currentStationIndex + 1} DOCKED`}
          </span>
          <span className="text-amber-400 font-bold">•</span>
          <span className="text-emerald-300 font-semibold">{cameraMode === 'driver' ? 'CAB POV' : 'CHASE'}</span>
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      ) : (
        <div className="flex flex-col gap-1.5 rounded-2xl border-2 border-amber-400/50 bg-[#020b06]/98 p-2 sm:p-2.5 shadow-[0_10px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(251,191,36,0.12)]">
          {/* Top Status & View Switcher Header */}
          <div className="flex items-center justify-between gap-2 px-1 text-[11px] font-mono">
            {/* Speedometer indicator */}
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-2 w-2 rounded-full ${
                  isMoving ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="font-bold text-white tracking-wider flex items-center gap-1">
                <Gauge className="h-3 w-3 text-amber-400" />
                {isMoving ? `${speedKmh} KM/H` : '0 KM/H'}
              </span>
              <span className="text-slate-500 font-semibold">•</span>
              <span className="text-amber-300 font-bold truncate max-w-[120px] sm:max-w-[180px]">
                STN {currentStationIndex + 1}: {currentStation?.title}
              </span>
            </div>

            {/* Quick View Controls */}
            <div className="flex items-center gap-1.5">
              {/* Alternative Driver View Toggle Button */}
              <button
                onClick={toggleCameraMode}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] sm:text-[11px] font-mono font-black transition-all cursor-pointer ${
                  cameraMode === 'driver'
                    ? 'border-amber-400 bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'border-white/20 bg-slate-900/90 text-amber-300 hover:bg-white/10'
                }`}
                title="Toggle between Driver Cab View and Chase View (Key V)"
              >
                <Video className="h-3 w-3" />
                <span>{cameraMode === 'driver' ? 'Driver View [V]' : 'Chase View [V]'}</span>
              </button>

              {/* Uncrowd / Dossier Toggle Button */}
              <button
                onClick={toggleStationPanel}
                className="hidden sm:flex items-center gap-1 rounded-lg border border-white/20 bg-slate-900/90 px-2 py-1 text-[10px] font-mono font-bold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                title="Toggle Station Details Panel (Key P)"
              >
                {isStationPanelCollapsed ? (
                  <>
                    <Eye className="h-3 w-3 text-amber-400" />
                    <span>Dossier</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 text-amber-400" />
                    <span>Uncrowd</span>
                  </>
                )}
              </button>

              {/* Minimize Dock Button */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                title="Minimize Controls Dock"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Route Track Scrubber */}
          <div
            onClick={handleTrackScrub}
            className="group relative h-4 w-full flex items-center cursor-pointer px-1"
            title="Click or drag anywhere on the track to scrub train progress"
          >
            {/* Background Rail Track Bed */}
            <div className="relative h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden border border-white/10 group-hover:h-2 transition-all">
              {/* Active Progress Fill */}
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 transition-all duration-75"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>

            {/* Station Tick Marks along the Scrubber */}
            <div className="absolute inset-x-1 flex justify-between pointer-events-none">
              {stations.map((stn, idx) => {
                const isActive = idx === currentStationIndex;
                return (
                  <div
                    key={stn.id}
                    className={`h-2.5 w-1 rounded-full transition-all ${
                      isActive ? 'bg-amber-400 scale-125' : 'bg-slate-600/60'
                    }`}
                  />
                );
              })}
            </div>

            {/* Locomotive Head Pin */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
              style={{ left: `${Math.max(2, Math.min(98, progress * 100))}%` }}
            >
              <div className="h-3.5 w-3.5 rounded-full bg-amber-400 border-2 border-slate-950 shadow-md shadow-amber-400/50 scale-110" />
            </div>
          </div>

          {/* Locomotive Cockpit Tactile Buttons */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Origin Quick Button */}
            <button
              onClick={() => goToStation(0)}
              className="flex items-center gap-1 rounded-lg border border-white/15 bg-slate-900/80 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Jump to Origin Platform (Key 1 / Home)"
            >
              <SkipBack className="h-3 w-3 text-amber-400" />
              <span className="hidden sm:inline">Origin</span>
            </button>

            {/* Step Previous Station / Reverse */}
            <button
              onClick={cruiseReverse}
              disabled={currentStationIndex === 0}
              className="flex items-center gap-1 rounded-lg border border-amber-400/30 bg-[#061e15] px-2.5 py-1 text-[11px] font-bold text-amber-200 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Reverse Train / Previous Station (Hold A / Left Arrow)"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Rev [A]</span>
            </button>

            {/* Central Auto-Cruise / Brake Toggle */}
            <button
              onClick={isCruising ? brake : toggleCruise}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer shadow-md ${
                isCruising
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-400/40'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/40'
              }`}
              title="Toggle Auto-Cruise / Space to Brake"
            >
              {isCruising ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Brake [Space]</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Cruise [Space]</span>
                </>
              )}
            </button>

            {/* Step Next Station / Forward */}
            <button
              onClick={cruiseForward}
              disabled={currentStationIndex === stations.length - 1}
              className="flex items-center gap-1 rounded-lg border border-amber-400/30 bg-[#061e15] px-2.5 py-1 text-[11px] font-bold text-amber-200 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Accelerate Train / Next Station (Hold D / Right Arrow)"
            >
              <span>Fwd [D]</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Terminus Quick Button */}
            <button
              onClick={() => goToStation(stations.length - 1)}
              className="flex items-center gap-1 rounded-lg border border-white/15 bg-slate-900/80 px-2 py-1 text-[11px] font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Jump to Terminus (Key 0 / End)"
            >
              <span className="hidden sm:inline">Terminus</span>
              <SkipForward className="h-3 w-3 text-amber-400" />
            </button>
          </div>

          {/* Hotkey & Pointer Control Tips */}
          <div className="flex items-center justify-center gap-2 pt-0.5 text-[9px] sm:text-[10px] text-amber-300/80 font-mono font-medium text-center">
            <SlidersHorizontal className="h-2.5 w-2.5 text-amber-400 hidden sm:inline" />
            <span>
              🖱️ Drag mouse on scene • Scroll trackpad • [A][D] Drive • [Space] Cruise/Brake
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

