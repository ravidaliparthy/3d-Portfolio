import React, { useRef, useEffect } from 'react';
import { useJourneyStore, type CameraPresetView } from '../../stores/useJourneyStore';
import {
  Menu,
  X,
  Briefcase,
  Ticket,
  Map,
  Mail,
  Video,
  Train,
  Eye,
  Maximize2,
  Building2,
  Compass,
  FileText,
  Sliders,
  HelpCircle,
  Zap,
} from 'lucide-react';

const CAMERA_VIEWS: { id: CameraPresetView; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'chase', label: 'Chase', icon: Train },
  { id: 'cab', label: 'Driver', icon: Compass },
  { id: 'window', label: 'Window', icon: Eye },
  { id: 'aerial', label: 'Aerial', icon: Maximize2 },
  { id: 'station', label: 'Station', icon: Building2 },
];

export const UnifiedMenuDropdown: React.FC = () => {
  const isMenuOpen = useJourneyStore((s) => s.isMenuOpen);
  const setMenuOpen = useJourneyStore((s) => s.setMenuOpen);
  const toggleMenu = useJourneyStore((s) => s.toggleMenu);
  const setRecruiterDrawerOpen = useJourneyStore((s) => s.setRecruiterDrawerOpen);
  const setPassModalOpen = useJourneyStore((s) => s.setPassModalOpen);
  const setRoadmapOpen = useJourneyStore((s) => s.setRoadmapOpen);
  const goToStation = useJourneyStore((s) => s.goToStation);
  const stations = useJourneyStore((s) => s.stations);
  const cameraPreset = useJourneyStore((s) => s.cameraPreset);
  const setCameraPreset = useJourneyStore((s) => s.setCameraPreset);
  const setPanelHeight = useJourneyStore((s) => s.setPanelHeight);
  const qualityMode = useJourneyStore((s) => s.qualityMode);
  const tier = useJourneyStore((s) => s.tier);
  const setQualityMode = useJourneyStore((s) => s.setQualityMode);
  const reduceEffects = useJourneyStore((s) => s.reduceEffects);
  const setReduceEffects = useJourneyStore((s) => s.setReduceEffects);
  const setKeyboardHelpOpen = useJourneyStore((s) => s.setKeyboardHelpOpen);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, setMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, setMenuOpen]);

  const handleAction = (callback: () => void) => {
    callback();
    setMenuOpen(false);
  };

  const handleSelectCamera = (preset: CameraPresetView) => {
    setCameraPreset(preset);
    if (preset === 'station') {
      setPanelHeight('peek');
    } else {
      setPanelHeight('full');
    }
  };

  return (
    <div ref={menuRef} data-menu="true" className="relative pointer-events-auto">
      {/* ONE Menu Button */}
      <button
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        aria-label="Navigation and system menu"
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono font-bold shadow-md transition-all cursor-pointer ${isMenuOpen
            ? 'border-amber-400 bg-amber-400 text-slate-950 font-black shadow-amber-400/20'
            : 'border-amber-400/50 bg-[#020804] text-amber-300 hover:bg-amber-400 hover:text-slate-950'
          }`}
        title="Open Central Menu (Recruiter, Boarding Pass, Map, Contact, Camera Views, Settings)"
      >
        {isMenuOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
        <span className="font-bold tracking-wide">Menu</span>
      </button>

      {/* Popover Menu Dropdown: Ultra-dark, 100% opaque obsidian background to guarantee high readability */}
      {isMenuOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          style={{ contain: 'layout paint', backgroundColor: '#020603', opacity: 1 }}
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border-2 border-amber-400 p-3 shadow-[0_30px_90px_rgba(0,0,0,1)] z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white"
        >
          {/* Header Title */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-amber-400/20 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-black">
              Expedition Controls
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">12 Milestones</span>
          </div>

          <div className="space-y-1.5">
            {/* Conductor State Boarding */}
            <button
              role="menuitem"
              onClick={() => handleAction(() => useJourneyStore.getState().setConductorModalOpen(true))}
              className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/30 bg-[#05180f] p-2.5 text-xs hover:border-amber-400 hover:bg-[#092c1a] transition-all cursor-pointer text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/50 bg-[#020d07] text-lg">
                🧑‍✈️
              </div>
              <div className="flex flex-col">
                <span className="font-black text-amber-300 text-xs">Conductor: Board State</span>
                <span className="text-[10px] text-slate-300">Directly jump to any of 6 states</span>
              </div>
            </button>

            {/* Download Resume PDF */}
            <a
              role="menuitem"
              href="/Daliparthy_Ravi_Krishna_Charan_Resume.pdf"
              download="Daliparthy_Ravi_Krishna_Charan_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl border border-amber-400/50 bg-[#072417] p-2.5 text-xs hover:border-amber-300 hover:bg-[#0c3824] transition-all cursor-pointer text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/60 bg-[#020d07] text-amber-300">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-amber-300 text-xs">Download Resume PDF</span>
                <span className="text-[10px] text-slate-300">Official verified master CV</span>
              </div>
            </a>

            {/* Recruiter Dossier */}
            <button
              role="menuitem"
              onClick={() => handleAction(() => setRecruiterDrawerOpen(true))}
              className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/30 bg-[#05180f] p-2.5 text-xs hover:border-amber-400 hover:bg-[#092c1a] transition-all cursor-pointer text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/50 bg-[#020d07] text-amber-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-xs">Recruiter Dossier</span>
                <span className="text-[10px] text-slate-300">ATS summary & key skills</span>
              </div>
            </button>

            {/* Souvenir Boarding Pass */}
            <button
              role="menuitem"
              onClick={() => handleAction(() => setPassModalOpen(true))}
              className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/30 bg-[#05180f] p-2.5 text-xs hover:border-amber-400 hover:bg-[#092c1a] transition-all cursor-pointer text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/50 bg-[#020d07] text-amber-400">
                <Ticket className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-xs">Souvenir Boarding Pass</span>
                <span className="text-[10px] text-slate-300">Printable official pass</span>
              </div>
            </button>

            {/* Territory Roadmap */}
            <button
              role="menuitem"
              onClick={() => handleAction(() => setRoadmapOpen(true))}
              className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/30 bg-[#05180f] p-2.5 text-xs hover:border-amber-400 hover:bg-[#092c1a] transition-all cursor-pointer text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/50 bg-[#020d07] text-amber-400">
                <Map className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-xs">Territory Roadmap</span>
                <span className="text-[10px] text-slate-300">6-State landscape map</span>
              </div>
            </button>

            {/* Contact Station */}
            <button
              role="menuitem"
              onClick={() => handleAction(() => goToStation(stations.length - 1))}
              className="flex w-full items-center gap-3 rounded-xl border border-emerald-500/30 bg-[#05180f] p-2.5 text-xs hover:border-amber-400 hover:bg-[#092c1a] transition-all cursor-pointer text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-400/50 bg-[#020d07] text-amber-400">
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-xs">Contact Station</span>
                <span className="text-[10px] text-slate-300">Message & terminus platform</span>
              </div>
            </button>
          </div>

          {/* Camera Viewpoints Menu Section */}
          <div className="mt-2.5 pt-2 border-t border-amber-400/20 px-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-300 flex items-center gap-1 font-bold">
                <Video className="h-3 w-3 text-amber-400" />
                <span>Camera Views</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">{cameraPreset}</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {CAMERA_VIEWS.map((cv) => {
                const Icon = cv.icon;
                const isSelected = cameraPreset === cv.id;
                return (
                  <button
                    key={cv.id}
                    onClick={() => handleSelectCamera(cv.id)}
                    className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1 px-1 text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${isSelected
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-[#05180f] text-slate-300 hover:bg-[#092c1a] hover:text-white border border-emerald-500/30'
                      }`}
                    title={`Switch to ${cv.label} camera`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="truncate">{cv.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Graphics Quality & Performance Section */}
          <div className="mt-2.5 pt-2 border-t border-amber-400/20 px-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-300 flex items-center gap-1 font-bold">
                <Sliders className="h-3 w-3 text-amber-400" />
                <span>Graphics Quality</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                {qualityMode === 'auto' ? `Auto (${tier})` : qualityMode}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {(['auto', 'low', 'mid', 'high'] as const).map((mode) => {
                const isSelected = qualityMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setQualityMode(mode)}
                    className={`rounded-lg py-1 px-1 text-[9px] font-mono font-bold uppercase transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-[#05180f] text-slate-300 hover:bg-[#092c1a] hover:text-white border border-emerald-500/30'
                    }`}
                    title={`Set graphics tier to ${mode}`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>

            {/* Reduce Effects & Keyboard Shortcuts Actions */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => setReduceEffects(!reduceEffects)}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  reduceEffects
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                    : 'bg-[#05180f] text-slate-300 hover:text-white border-emerald-500/30'
                }`}
                title="Reduce complex post effects and cap resolution for maximum battery/frame rate"
              >
                <Zap className="h-3 w-3" />
                <span>{reduceEffects ? 'Effects: Min' : 'Reduce FX'}</span>
              </button>

              <button
                onClick={() => handleAction(() => setKeyboardHelpOpen(true))}
                className="flex items-center justify-center gap-1 rounded-lg py-1.5 px-2.5 text-[10px] font-mono font-bold bg-[#05180f] text-amber-300 hover:bg-[#092c1a] hover:text-amber-200 transition-all cursor-pointer border border-amber-400/30"
                title="View keyboard shortcut references"
              >
                <HelpCircle className="h-3 w-3" />
                <span>Keys (?)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
