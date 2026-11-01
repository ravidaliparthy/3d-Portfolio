import React, { useState, useRef } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { useViewport } from '../../hooks/useViewport';
import { getSkillById } from '../../data';
import {
  Award,
  ChevronRight,
  HelpCircle,
  MapPin,
  Calendar,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Eye,
} from 'lucide-react';

export const StationMobileSheet: React.FC = () => {
  const activeStation = useJourneyStore((s) => s.activeStation);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);
  const navigatingTargetIndex = useJourneyStore((s) => s.navigatingTargetIndex);
  const stations = useJourneyStore((s) => s.stations);
  const nextStation = useJourneyStore((s) => s.nextStation);
  const prevStation = useJourneyStore((s) => s.prevStation);
  const panelHeight = useJourneyStore((s) => s.panelHeight);
  const setPanelHeight = useJourneyStore((s) => s.setPanelHeight);
  const setPassModalOpen = useJourneyStore((s) => s.setPassModalOpen);
  const setRoadmapOpen = useJourneyStore((s) => s.setRoadmapOpen);
  const cameraPreset = useJourneyStore((s) => s.cameraPreset);
  const { isMobile, isPortrait } = useViewport();

  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'qa' | 'ticket'>('overview');
  const touchStartY = useRef(0);

  if (!isMobile || !isPortrait) return null;
  if (!activeStation || panelHeight === 'closed') return null;

  // Station View Mode on Mobile: Minimal bottom capsule so 3D station is completely unobstructed
  if (cameraPreset === 'station') {
    return (
      <div className="pointer-events-auto fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-2 rounded-2xl border-2 border-amber-400 bg-[#061a12]/95 p-2 text-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.95)]">
        <button
          onClick={() => useJourneyStore.getState().setConductorModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/60 bg-[#0a2419] py-2 text-xs font-mono font-bold text-amber-300"
        >
          <span>🧑‍✈️</span>
          <span>Ask Conductor: Board State</span>
        </button>
        <button
          onClick={() => {
            useJourneyStore.getState().setCameraPreset('chase');
            setPanelHeight('full');
          }}
          className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-xs font-black text-slate-950 shadow-md"
        >
          Board Train
        </button>
      </div>
    );
  }

  const hasChallenges = Boolean(activeStation.challenges && activeStation.challenges.length > 0);

  // Swipe gesture handling for peek / half / full
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY < -40) {
      // Swiped UP
      if (panelHeight === 'peek') setPanelHeight('half');
      else if (panelHeight === 'half') setPanelHeight('full');
    } else if (deltaY > 40) {
      // Swiped DOWN
      if (panelHeight === 'full') setPanelHeight('half');
      else if (panelHeight === 'half') setPanelHeight('peek');
    }
  };

  const heightClass =
    panelHeight === 'peek'
      ? 'h-[105px]'
      : panelHeight === 'full'
      ? 'h-[calc(90dvh-env(safe-area-inset-bottom,0px))]'
      : 'h-[52dvh]';

  return (
    <div
      data-no-drag="true"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`pointer-events-auto fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-3xl border-t-2 border-x-2 border-amber-400/60 bg-[#061a12] text-slate-100 shadow-[0_-15px_40px_rgba(0,0,0,0.98)] transition-[height] duration-300 ease-out ${heightClass}`}
    >
      {/* Drag handle / Pill indicator */}
      <div className="flex h-6 w-full items-center justify-center cursor-grab active:cursor-grabbing shrink-0">
        <div className="h-1.5 w-12 rounded-full bg-amber-400/60" />
      </div>

      {/* Sheet Header */}
      <div className="px-4 pb-2 pt-0.5 border-b border-amber-400/30 bg-[#061a12] shrink-0">
        <div className="flex items-center justify-between mb-1 gap-1">
          {navigatingTargetIndex !== null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/90 border border-amber-400/80 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 animate-pulse">
              <span>🚆 En Route → STN {navigatingTargetIndex + 1}</span>
            </span>
          ) : (
            <button
              onClick={() => setRoadmapOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-xs"
            >
              <span>STATION {currentStationIndex + 1} OF {stations.length}</span>
            </button>
          )}

          <button
            onClick={() => {
              useJourneyStore.getState().setCameraPreset('station');
              setPanelHeight('peek');
            }}
            className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-[#0a2419] px-2 py-0.5 text-[10px] font-bold font-mono text-amber-300 transition-all whitespace-nowrap shrink-0"
          >
            <Eye className="h-3 w-3" />
            <span>View Station</span>
          </button>

          <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 font-bold">
            <Calendar className="h-3 w-3 text-amber-400" />
            <span>{activeStation.period}</span>
          </div>
        </div>

        <h2 className="text-base font-black text-white leading-tight truncate">
          {activeStation.title}
        </h2>

        <div className="flex items-center gap-1 text-[11px] text-slate-300 font-semibold truncate mt-0.5">
          <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
          <span className="text-emerald-300 font-bold truncate">{activeStation.organization}</span>
        </div>

        {/* Tab switcher (Visible when expanded beyond peek) */}
        {panelHeight !== 'peek' && (
          <div className="mt-2 flex rounded-lg bg-[#0a2419] p-1 border border-amber-400/30 gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 rounded-md py-1 text-[11px] font-bold ${
                activeTab === 'overview' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black' : 'text-amber-200/80'
              }`}
            >
              Overview
            </button>
            {hasChallenges && (
              <button
                onClick={() => setActiveTab('challenges')}
                className={`flex-1 rounded-md py-1 text-[11px] font-bold ${
                  activeTab === 'challenges' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black' : 'text-amber-200/80'
                }`}
              >
                Tradeoffs
              </button>
            )}
            <button
              onClick={() => setActiveTab('qa')}
              className={`flex-1 rounded-md py-1 text-[11px] font-bold ${
                activeTab === 'qa' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black' : 'text-amber-200/80'
              }`}
            >
              Q&A
            </button>
            <button
              onClick={() => setActiveTab('ticket')}
              className={`flex-1 rounded-md py-1 text-[11px] font-bold ${
                activeTab === 'ticket' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black' : 'text-amber-200/80'
              }`}
            >
              Ticket
            </button>
          </div>
        )}
      </div>

      {/* Lazy-Mounted Tab Content with Fast Fluid Native Scrolling */}
      {panelHeight !== 'peek' && (
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5 text-xs text-slate-100">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <p className="leading-relaxed text-slate-100 font-medium text-xs">
                {activeStation.summary}
              </p>

              {activeStation.metrics.length > 0 && (
                <div className="grid grid-cols-1 gap-1.5">
                  {activeStation.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-[#0a2419] p-2 text-[11px] font-mono text-amber-300 font-bold"
                    >
                      <Award className="h-3 w-3 text-amber-400 shrink-0" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h3 className="mb-1 text-[11px] font-black uppercase text-amber-400">
                  Key Accomplishments
                </h3>
                <ul className="space-y-1">
                  {activeStation.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <ChevronRight className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-slate-100 text-[11px]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-1 text-[11px] font-black uppercase text-emerald-400">
                  Technical Stack
                </h3>
                <div className="flex flex-wrap gap-1">
                  {activeStation.skillIds.map((skillId) => {
                    const skill = getSkillById(skillId);
                    return (
                      <span
                        key={skillId}
                        className="rounded border border-emerald-500/30 bg-[#0a2419] px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-200"
                      >
                        {skill?.name || skillId}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'challenges' && hasChallenges && (
            <div className="space-y-2.5">
              {activeStation.challenges?.map((ch, idx) => (
                <div key={idx} className="rounded-xl border border-emerald-500/30 bg-[#0a2419] p-2.5 space-y-1.5">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-xs">{ch.title}</h4>
                      <p className="mt-0.5 text-slate-200 text-[11px]">{ch.theObstacle}</p>
                    </div>
                  </div>
                  <div className="rounded bg-[#061a12] border border-emerald-500/30 p-1.5 text-[10px] text-emerald-200">
                    <div className="flex items-center gap-1 font-bold text-emerald-300">
                      <Lightbulb className="h-3 w-3 text-emerald-400" />
                      <span>Resolution</span>
                    </div>
                    <p className="mt-0.5 text-slate-200">{ch.decisionAndTradeoff}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-0.5 border-t border-emerald-900/60">
                    <span className="text-slate-300">Outcome:</span>
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      {ch.outcomeMetric}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="space-y-2.5">
              {activeStation.qa.map((qa, idx) => (
                <div key={idx} className="rounded-xl border border-emerald-500/30 bg-[#0a2419] p-2.5 space-y-1">
                  <h4 className="font-bold text-white text-xs flex items-start gap-1">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{qa.question}</span>
                  </h4>
                  <p className="text-slate-200 pl-4 text-[11px] leading-relaxed">
                    {qa.answer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ticket' && (
            <div className="space-y-2.5">
              <div className="rounded-xl border-2 border-dashed border-amber-400/60 bg-[#0a2419] p-3 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-300">Official Transit Record</span>
                <div className="text-sm font-black text-white">STATION {currentStationIndex + 1} OF {stations.length}</div>
                <div className="text-xs text-emerald-300 font-bold">{activeStation.organization}</div>
                <button
                  onClick={() => setPassModalOpen(true)}
                  className="w-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-1.5 text-xs font-black text-slate-950"
                >
                  Generate Boarding Pass
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sticky Bottom Actions */}
      <div className="flex items-center justify-between border-t border-amber-400/30 bg-[#061a12] p-2.5 shrink-0">
        <button
          onClick={prevStation}
          disabled={currentStationIndex === 0}
          className="rounded-lg border border-amber-400/40 bg-[#0a2419] px-2.5 py-1 text-xs font-bold text-amber-200 disabled:opacity-30"
        >
          Previous
        </button>
        <span className="text-[11px] font-mono text-amber-300 font-bold">
          STATION {currentStationIndex + 1} OF {stations.length}
        </span>
        {currentStationIndex < stations.length - 1 ? (
          <button
            onClick={nextStation}
            className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-xs font-black text-slate-950 shadow-xs"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => useJourneyStore.getState().setPhase('terminus')}
            className="rounded-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-3 py-1 text-xs font-black text-slate-950 shadow-md"
          >
            Contact Form
          </button>
        )}
      </div>
    </div>
  );
};
