import React, { useState, useEffect } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { PORTFOLIO_STATES } from './TerritoryRoadmap';
import { X, Train, Sparkles, Compass } from 'lucide-react';

export const ConductorBoardingDialog: React.FC = () => {
  const isConductorModalOpen = useJourneyStore((s) => s.isConductorModalOpen);
  const setConductorModalOpen = useJourneyStore((s) => s.setConductorModalOpen);
  const goToStation = useJourneyStore((s) => s.goToStation);
  const setCameraPreset = useJourneyStore((s) => s.setCameraPreset);
  const setPanelHeight = useJourneyStore((s) => s.setPanelHeight);
  const setPhase = useJourneyStore((s) => s.setPhase);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);

  const [boardingMessage, setBoardingMessage] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isConductorModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConductorModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConductorModalOpen, setConductorModalOpen]);

  if (!isConductorModalOpen) return null;

  const handleBoardState = (targetStationIndex: number, _stateName: string) => {
    // Instant 1-click execution: close modal and launch smooth 2-3s transit immediately
    setConductorModalOpen(false);
    setBoardingMessage(null);
    setCameraPreset('chase');
    setPhase('journey');
    setPanelHeight('full');
    goToStation(targetStationIndex);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="conductor-dialog-title"
      data-no-drag="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 animate-in fade-in duration-150 pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setConductorModalOpen(false);
      }}
    >
      <div data-no-drag="true" className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border-2 border-amber-400/70 bg-[#041a10] text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden pointer-events-auto">
        {/* Conductor Header Banner */}
        <div className="p-4 sm:p-5 border-b border-amber-400/30 bg-gradient-to-r from-[#062417] via-[#083020] to-[#062417] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div
                  className="h-14 w-14 shrink-0 rounded-2xl border-2 border-amber-400 bg-emerald-950/80 p-0.5 shadow-md overflow-hidden"
                  style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px' }}
                >
                  <img
                    src="/conductor-charan.png"
                    alt="Conductor Charan"
                    className="h-full w-full object-cover object-top rounded-xl"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://api.dicebear.com/7.x/bottts/svg?seed=Charan';
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow-xs">
                  ★
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40">
                    Official Station Conductor
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">• Line Dispatcher</span>
                </div>
                <h2 id="conductor-dialog-title" className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                  Conductor Charan: State Ticket Check & Boarding
                </h2>
              </div>
            </div>

            <button
              onClick={() => setConductorModalOpen(false)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-[#0a2419] px-3 py-1.5 text-xs font-mono font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-colors cursor-pointer shrink-0 shadow-sm"
              aria-label="Close Conductor Dialog"
            >
              <span>Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Conductor Speech Box */}
          <div className="mt-3 rounded-2xl border border-emerald-500/40 bg-[#02130b]/80 p-3 text-xs leading-relaxed text-amber-200/90 font-medium flex items-start gap-2.5 shadow-inner">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              {boardingMessage ? (
                <span className="font-mono text-emerald-300 font-bold text-sm">
                  {boardingMessage}
                </span>
              ) : (
                <span>
                  &ldquo;Greetings, traveler! Which state would you like to travel to? Choose your destination below and I will punch your boarding ticket to take you directly onto that section of the line with zero delays!&rdquo;
                </span>
              )}
            </p>
          </div>
        </div>

        {/* States Selection Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 overscroll-contain">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300/80 mb-1 px-1">
            <span>SELECT A REGION TO BOARD:</span>
            <span>6 VERIFIED TRANSIT SECTIONS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PORTFOLIO_STATES.map((state) => {
              const StateIcon = state.icon;
              const firstStnIdx = state.stationIndices[0];
              const isCurrentState = state.stationIndices.includes(currentStationIndex);
              const stnRange =
                state.stationIndices.length === 1
                  ? `STN ${(state.stationIndices[0] + 1).toString().padStart(2, '0')}`
                  : `STN ${(state.stationIndices[0] + 1).toString().padStart(2, '0')} - ${(
                      state.stationIndices[state.stationIndices.length - 1] + 1
                    )
                      .toString()
                      .padStart(2, '0')}`;

              return (
                <div
                  key={state.id}
                  onClick={() => handleBoardState(firstStnIdx, state.name)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer active:scale-[0.98] select-none ${
                    isCurrentState
                      ? 'border-amber-400 bg-amber-400/15 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/60'
                      : 'border-emerald-500/40 bg-[#062015] hover:border-amber-400 hover:bg-[#0a2e1e]'
                  }`}
                >
                  <div>
                    {/* Top Pill Row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950 font-mono shadow-xs"
                        style={{ backgroundColor: state.accentColor }}
                      >
                        <StateIcon className="h-3 w-3" />
                        <span>{state.shortName}</span>
                      </span>

                      <span className="font-mono text-[11px] font-bold text-amber-300/90 bg-[#03130b] px-2 py-0.5 rounded border border-amber-400/30">
                        {stnRange}
                      </span>
                    </div>

                    {/* State Full Name & Tagline */}
                    <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                      {state.name}
                    </h3>
                    <p className="text-xs text-amber-200/70 font-mono mt-0.5">
                      {state.tagline}
                    </p>

                    {/* Description */}
                    <p className="mt-2 text-xs leading-relaxed text-slate-300 font-normal line-clamp-2">
                      {state.description}
                    </p>

                    {/* Biome Atmosphere */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                      <Compass className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                      <span className="truncate">{state.biomeName}</span>
                    </div>
                  </div>

                  {/* Boarding Action Button */}
                  <div className="mt-4 pt-3 border-t border-amber-400/20 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {isCurrentState ? 'Currently Here' : 'Fast Travel Ready'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBoardState(firstStnIdx, state.name);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-sm hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer group-hover:scale-105"
                      title={`Board train to ${state.name} at ${stnRange}`}
                    >
                      <Train className="h-3.5 w-3.5" />
                      <span>{isCurrentState ? 'Re-Board Here' : 'Board State →'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-5 border-t border-amber-400/30 bg-[#041a10] flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
          <span>Central Milestone Express • Passenger Transit Gate</span>
          <button
            onClick={() => setConductorModalOpen(false)}
            className="text-amber-300 hover:text-white font-bold transition-colors cursor-pointer"
          >
            Stay at Current Platform
          </button>
        </div>
      </div>
    </div>
  );
};
