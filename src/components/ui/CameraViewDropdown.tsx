import React, { useRef, useEffect } from 'react';
import { useJourneyStore, type CameraPresetView } from '../../stores/useJourneyStore';
import {
  Video,
  ChevronDown,
  Check,
  Eye,
  Train,
  Compass,
  Maximize2,
  Building2,
} from 'lucide-react';

interface PresetOption {
  id: CameraPresetView;
  label: string;
  tagline: string;
  icon: React.FC<{ className?: string }>;
  keyShortcut: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'chase',
    label: 'Chase Camera',
    tagline: 'Cinematic 3/4 trailing isometric view',
    icon: Train,
    keyShortcut: 'Preset 1',
  },
  {
    id: 'cab',
    label: 'Driver Cab Cockpit',
    tagline: 'Front locomotive throttle & dashboard',
    icon: Compass,
    keyShortcut: 'Preset 2',
  },
  {
    id: 'window',
    label: 'Passenger Window',
    tagline: 'Scenic coach side window panorama',
    icon: Eye,
    keyShortcut: 'Preset 3',
  },
  {
    id: 'aerial',
    label: 'Aerial Drone',
    tagline: 'High-altitude route overview',
    icon: Maximize2,
    keyShortcut: 'Preset 4',
  },
  {
    id: 'station',
    label: 'Station Platform',
    tagline: 'Conductor & architectural platform orbit',
    icon: Building2,
    keyShortcut: 'Preset 5',
  },
];

export const CameraViewDropdown: React.FC = () => {
  const isOpen = useJourneyStore((s) => s.isCameraMenuOpen);
  const setIsOpen = useJourneyStore((s) => s.setCameraMenuOpen);
  const toggleOpen = useJourneyStore((s) => s.toggleCameraMenu);
  const cameraPreset = useJourneyStore((s) => s.cameraPreset);
  const setCameraPreset = useJourneyStore((s) => s.setCameraPreset);
  const setPanelHeight = useJourneyStore((s) => s.setPanelHeight);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleSelect = (preset: CameraPresetView) => {
    setCameraPreset(preset);
    if (preset === 'station') {
      setPanelHeight('peek');
    } else {
      setPanelHeight('full');
    }
    setIsOpen(false);
  };

  const currentOption = PRESET_OPTIONS.find((p) => p.id === cameraPreset) || PRESET_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div ref={dropdownRef} data-menu="true" className="relative pointer-events-auto">
      {/* Camera Trigger Menu Button */}
      <button
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Camera viewpoints menu"
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono font-bold shadow-md transition-all cursor-pointer ${
          isOpen
            ? 'border-amber-400 bg-amber-400 text-slate-950 font-black shadow-amber-400/20'
            : 'border-amber-400/50 bg-[#020804] text-amber-300 hover:bg-amber-400 hover:text-slate-950'
        }`}
        title="Open Camera Viewpoints Menu (Chase, Driver Cab, Window, Aerial, Station) [Key V]"
      >
        <CurrentIcon className="h-3.5 w-3.5" />
        <span className="font-bold tracking-wide uppercase">{cameraPreset}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu Dropdown: Ultra-dark, 100% opaque, high-contrast */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          style={{ contain: 'layout paint' }}
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border-2 border-amber-400 bg-[#020804] p-2.5 shadow-[0_25px_80px_rgba(0,0,0,0.99)] z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-amber-400/20 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-black flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-amber-400" />
              <span>Camera Viewpoints</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Cycle [V]</span>
          </div>

          {/* Preset Options */}
          <div className="space-y-1.5">
            {PRESET_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = opt.id === cameraPreset;

              return (
                <button
                  key={opt.id}
                  role="menuitem"
                  onClick={() => handleSelect(opt.id)}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/15 shadow-sm ring-1 ring-amber-400/50'
                      : 'border-emerald-500/25 bg-[#05180f] hover:border-amber-400 hover:bg-[#092c1a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400 text-slate-950 font-black'
                          : 'border-amber-400/40 bg-[#020d07] text-amber-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                          {opt.label}
                        </span>
                        {isSelected && (
                          <span className="rounded bg-amber-400 px-1.5 py-0.2 text-[9px] font-black uppercase text-slate-950">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-300 leading-snug">
                        {opt.tagline}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-1">
                    {isSelected ? (
                      <Check className="h-4 w-4 text-amber-400" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">
                        {opt.keyShortcut}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
