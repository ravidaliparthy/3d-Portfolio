import React, { useEffect } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { X, Keyboard, ArrowRight, ArrowLeft, Volume2, Video, Mic, Menu, CornerDownLeft } from 'lucide-react';

export const KeyboardHelpModal: React.FC = () => {
  const isKeyboardHelpOpen = useJourneyStore((s) => s.isKeyboardHelpOpen);
  const setKeyboardHelpOpen = useJourneyStore((s) => s.setKeyboardHelpOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle help with '?' key when not typing in an input
      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setKeyboardHelpOpen(!isKeyboardHelpOpen);
        return;
      }
      if (e.key === 'Escape' && isKeyboardHelpOpen) {
        setKeyboardHelpOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isKeyboardHelpOpen, setKeyboardHelpOpen]);

  if (!isKeyboardHelpOpen) return null;

  const SHORTCUTS = [
    { key: '→ / D / Space', desc: 'Advance train to Next Station', icon: ArrowRight },
    { key: '← / A', desc: 'Reverse train to Previous Station', icon: ArrowLeft },
    { key: '1 – 9, 0', desc: 'Direct station selector (Milestones 1–10)', icon: CornerDownLeft },
    { key: 'C', desc: 'Cycle camera viewports (Chase, Cab, Window, Aerial, Station)', icon: Video },
    { key: 'M', desc: 'Toggle journey sound & train engine SFX', icon: Volume2 },
    { key: 'V', desc: 'Open Voice Assistant & Fast Router', icon: Mic },
    { key: 'Esc', desc: 'Close open overlay or modal', icon: Menu },
    { key: '?', desc: 'Toggle this keyboard shortcut guide', icon: Keyboard },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 pointer-events-auto select-none backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-3xl border-2 border-amber-400/80 bg-[#04160e] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-400/30 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/60 bg-[#092c1b] text-amber-300">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black font-mono tracking-wide text-amber-300 uppercase">
                Keyboard Shortcuts
              </h2>
              <p className="text-[11px] text-emerald-400 font-mono">
                Hands-Free Navigation & Camera Controls
              </p>
            </div>
          </div>
          <button
            onClick={() => setKeyboardHelpOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close shortcuts modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="space-y-2">
          {SHORTCUTS.map((sc, i) => {
            const Icon = sc.icon;
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-[#061d12] px-3.5 py-2 text-xs"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <Icon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{sc.desc}</span>
                </div>
                <kbd className="rounded-lg border border-amber-400/40 bg-[#031109] px-2 py-0.5 font-mono text-[11px] font-bold text-amber-300 shadow-inner">
                  {sc.key}
                </kbd>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-amber-400/20 text-center">
          <span className="text-[11px] font-mono text-slate-400">
            Press <kbd className="text-amber-300 font-bold">Esc</kbd> or click outside to dismiss.
          </span>
        </div>
      </div>
    </div>
  );
};

