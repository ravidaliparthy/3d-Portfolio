import React, { useEffect, useState } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { AudioToggle } from './AudioToggle';
import { UnifiedMenuDropdown } from './UnifiedMenuDropdown';
import { StationDesktopPanel } from './StationDesktopPanel';
import { StationMobileSheet } from './StationMobileSheet';
import { GuideCard } from './GuideCard';
import { BottomDock } from './BottomDock';
import { RecruiterDrawer } from './RecruiterDrawer';
import { DepartureBoardIntro } from './DepartureBoardIntro';
import { TerminusOutro } from './TerminusOutro';
import { BoardingPassModal } from './BoardingPassModal';
import { ContactFormModal } from './ContactFormModal';
import { SemanticMirror } from './SemanticMirror';
import { TerritoryRoadmap } from './TerritoryRoadmap';
import { ConductorBoardingDialog } from './ConductorBoardingDialog';
import { CameraViewDropdown } from './CameraViewDropdown';
import { VoiceAssistantModal } from './VoiceAssistantModal';
import { KeyboardHelpModal } from './KeyboardHelpModal';
import { StoryLineModal } from './StoryLineModal';
import { Mic } from 'lucide-react';
import { isDebugDisabled } from '../../utils/debugSwitches';

export const NavigationOverlay: React.FC = () => {
  const phase = useJourneyStore((s) => s.phase);
  const stations = useJourneyStore((s) => s.stations);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);
  const activeStation = useJourneyStore((s) => s.activeStation);
  const goToStation = useJourneyStore((s) => s.goToStation);
  const isPassModalOpen = useJourneyStore((s) => s.isPassModalOpen);
  const setPassModalOpen = useJourneyStore((s) => s.setPassModalOpen);
  const isContactModalOpen = useJourneyStore((s) => s.isContactModalOpen);
  const setContactModalOpen = useJourneyStore((s) => s.setContactModalOpen);
  const isRoadmapOpen = useJourneyStore((s) => s.isRoadmapOpen);
  const setRoadmapOpen = useJourneyStore((s) => s.setRoadmapOpen);
  const isVoiceModalOpen = useJourneyStore((s) => s.isVoiceModalOpen);
  const setVoiceModalOpen = useJourneyStore((s) => s.setVoiceModalOpen);

  const [hoveredStation, setHoveredStation] = useState<number | null>(null);
  const hasMountedRef = React.useRef(false);

  // On refresh / page load: ALWAYS return to the first form (Origin Departure Board Intro at Station 1)
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    // Clear any lingering URL hash on load/refresh so the app cleanly returns to the first form
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    useJourneyStore.getState().goToStation(0);
    useJourneyStore.getState().setPhase('intro');
  }, [goToStation]);

  return (
    <div id="navigation-overlay" className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between overflow-hidden select-none">
      {/* Accessible semantic hidden mirror */}
      <SemanticMirror />

      {/* Centralized Modals */}
      <BoardingPassModal
        isOpen={isPassModalOpen}
        onClose={() => setPassModalOpen(false)}
        station={activeStation}
      />

      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      <DepartureBoardIntro />
      <TerminusOutro />
      <RecruiterDrawer />
      <TerritoryRoadmap
        isOpen={isRoadmapOpen}
        onClose={() => setRoadmapOpen(false)}
      />
      <ConductorBoardingDialog />
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
      <KeyboardHelpModal />
      <StoryLineModal />

      {/* ============================================================== */}
      {/* ZONE 1: TOP STRIP                                              */}
      {/* Brand | Station Rail with Hover Labels | Audio | View | Menu   */}
      {/* ============================================================== */}
      <header className="pointer-events-auto relative z-50 flex items-center justify-between gap-2 sm:gap-4 p-2.5 sm:p-3 md:px-6">
        
        {/* Brand Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => goToStation(0)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/50 bg-[#061e15] text-amber-300 shadow-md hover:bg-[#092a1d] transition-colors cursor-pointer"
            title="Return to Origin Platform (Station 1)"
          >
            <span className="font-mono text-xs font-black">RC</span>
          </button>
          <div className="hidden sm:block">
            <span className="block text-xs font-black text-white tracking-wide leading-tight">
              RAVI DALIPARTHY
            </span>
            <span className="block text-[10px] font-mono text-amber-300 font-bold leading-none">
              CENTRAL MILESTONE EXPRESS
            </span>
          </div>
        </div>

        {/* Station Rail: Interactive Track with Name Labels on Hover / Focus (Visible only during Journey phase) */}
        {phase === 'journey' && (
          <div className="relative flex items-center animate-in fade-in duration-300">
            <nav
              aria-label="Route Station Track"
              className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-amber-400/40 bg-[#04160e]/95 px-2.5 py-1 sm:px-3.5 sm:py-1.5 shadow-lg"
            >
              {stations.map((stn, idx) => {
                const isActive = idx === currentStationIndex;
                return (
                  <button
                    key={stn.id}
                    onClick={() => goToStation(idx)}
                    onMouseEnter={() => setHoveredStation(idx)}
                    onMouseLeave={() => setHoveredStation(null)}
                    onFocus={() => setHoveredStation(idx)}
                    onBlur={() => setHoveredStation(null)}
                    className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black scale-110 shadow-md shadow-amber-500/30 ring-1 ring-amber-300'
                        : 'bg-emerald-950/70 text-emerald-200 hover:bg-emerald-800 hover:text-white font-semibold'
                    }`}
                    aria-label={`Jump to STATION ${idx + 1} OF ${stations.length}: ${stn.title}`}
                  >
                    <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                  </button>
                );
              })}
            </nav>

            {/* Floating Station Name Label on Hover / Focus */}
            {hoveredStation !== null && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 pointer-events-none z-50 whitespace-nowrap rounded-lg border border-amber-400/50 bg-[#06140d]/95 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-300 shadow-xl animate-in fade-in duration-100">
                <span>STATION {hoveredStation + 1} OF {stations.length}: </span>
                <span className="text-white">{stations[hoveredStation]?.title}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Controls: Audio | Mic Shortcut | View Switcher Dropdown | ONE Unified Menu Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Audio Toggle */}
          <AudioToggle />

          {/* Quick Mic Shortcut Button */}
          {!isDebugDisabled('voice') && (
            <button
              onClick={() => setVoiceModalOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/50 bg-[#061e15] text-amber-300 shadow-md hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer"
              title="Ask by Voice (Microphone Shortcut)"
              aria-label="Voice Assistant Shortcut"
            >
              <Mic className="h-4 w-4" />
            </button>
          )}

          {/* Camera View Switcher Menu */}
          <CameraViewDropdown />

          {/* ONE Unified Menu Button (Recruiter, Boarding Pass, Map, Contact, Settings) */}
          <UnifiedMenuDropdown />
        </div>
      </header>

      {/* ============================================================== */}
      {/* ZONE 2: STAGE (CENTRE) - NO UI ELEMENTS HERE                  */}
      {/* 100% clean view of 3D train, rails, and dynamic landscape      */}
      {/* ============================================================== */}
      <main className="flex-1 pointer-events-none relative" />

      {/* ============================================================== */}
      {/* ZONE 3: SIDE PANEL (STATION CARD)                             */}
      {/* Laptop = side panel (30%), phone portrait = bottom sheet       */}
      {/* ============================================================== */}
      {phase !== 'intro' && phase !== 'terminus' && (
        <>
          <StationDesktopPanel />
          <StationMobileSheet />
        </>
      )}

      {/* Tour Guide: Avatar + 1-Line Bubble that Auto-Collapses after 8s */}
      {phase !== 'intro' && phase !== 'terminus' && <GuideCard />}

      {/* ============================================================== */}
      {/* ZONE 4: BOTTOM DOCK                                           */}
      {/* View switcher, prev/next, and driver HUD in ONE single lane    */}
      {/* ============================================================== */}
      <BottomDock />
    </div>
  );
};
