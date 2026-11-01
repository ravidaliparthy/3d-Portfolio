import React, { useState, useEffect } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { portfolioData, type StoryEntry } from '../../data';
import {
  X,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Compass,
} from 'lucide-react';

const KIND_META: Record<
  string,
  { label: string; bg: string; border: string; text: string; icon: React.FC<{ className?: string }> }
> = {
  chance: {
    label: 'Real-World Scale',
    bg: 'bg-emerald-950/80',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    icon: Compass,
  },
  mistake: {
    label: 'Hard Technical Tradeoff',
    bg: 'bg-rose-950/80',
    border: 'border-rose-500/40',
    text: 'text-rose-300',
    icon: AlertTriangle,
  },
  think: {
    label: 'Deep Problem Solving',
    bg: 'bg-amber-950/80',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    icon: Lightbulb,
  },
  ownership: {
    label: 'Systems Engineering',
    bg: 'bg-cyan-950/80',
    border: 'border-cyan-500/40',
    text: 'text-cyan-300',
    icon: CheckCircle2,
  },
  care: {
    label: 'Engineering Integrity',
    bg: 'bg-indigo-950/80',
    border: 'border-indigo-500/40',
    text: 'text-indigo-300',
    icon: Sparkles,
  },
};

export const StoryLineModal: React.FC = () => {
  const isStoryModalOpen = useJourneyStore((s) => s.isStoryModalOpen);
  const activeStoryId = useJourneyStore((s) => s.activeStoryId);
  const setStoryModalOpen = useJourneyStore((s) => s.setStoryModalOpen);
  const goToStation = useJourneyStore((s) => s.goToStation);
  const stations = useJourneyStore((s) => s.stations);

  const stories: StoryEntry[] = portfolioData.story || [];

  const [selectedStoryId, setSelectedStoryId] = useState<string>(
    activeStoryId || stories[0]?.id || ''
  );

  useEffect(() => {
    if (activeStoryId) {
      setSelectedStoryId(activeStoryId);
    } else if (stories.length > 0 && !selectedStoryId) {
      setSelectedStoryId(stories[0].id);
    }
  }, [activeStoryId, stories]);

  useEffect(() => {
    if (!isStoryModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStoryModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStoryModalOpen, setStoryModalOpen]);

  if (!isStoryModalOpen || stories.length === 0) return null;

  const currentStory =
    stories.find((s) => s.id === selectedStoryId) || stories[0];

  const meta = KIND_META[currentStory.kind] || KIND_META.think;
  const MetaIcon = meta.icon;

  // Resolve linked station index if specified by hint or id
  const getLinkedStationIndex = (story: StoryEntry): number | null => {
    if (story.linkedStationId) {
      const idx = stations.findIndex((st) => st.id === story.linkedStationId);
      if (idx !== -1) return idx;
    }
    const hint = story.linkedStationHint?.toLowerCase() || '';
    if (hint.includes('hackathon') || story.id.includes('svamitva')) return 9; // Station 10 (idx 9)
    if (hint.includes('seismic') || story.id.includes('seismic')) return 5; // Station 6 (idx 5)
    if (hint.includes('rooftop') || story.id.includes('rooftop')) return 4; // Station 5 (idx 4)
    if (hint.includes('expense') || story.id.includes('expense')) return 6; // Station 7 (idx 6)
    return null;
  };

  const linkedIndex = getLinkedStationIndex(currentStory);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stories-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-3 sm:px-6 py-6 pointer-events-auto select-none backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] max-h-[800px] rounded-3xl border-2 border-amber-400/80 bg-[#04160e] shadow-[0_30px_90px_rgba(0,0,0,0.98)] text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-400/30 px-6 py-4 bg-[#061d13] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/60 bg-[#092c1b] text-amber-300 shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 id="stories-heading" className="text-sm sm:text-base font-black font-mono tracking-wide text-amber-300 uppercase">
                Engineering Stories & Deep Tradeoffs
              </h2>
              <p className="text-[11px] text-emerald-400 font-mono">
                Real Constraints • Algorithmic Decisions • Unvarnished Lessons
              </p>
            </div>
          </div>
          <button
            onClick={() => setStoryModalOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close stories modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Story Selector Pills */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-amber-400/20 bg-[#03130c] overflow-x-auto shrink-0 scrollbar-none">
          {stories.map((st, i) => {
            const isSelected = st.id === currentStory.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStoryId(st.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'border-emerald-500/30 bg-[#061d12] text-slate-300 hover:border-amber-400/50 hover:text-white'
                }`}
              >
                <span>{`0${i + 1}.`}</span>
                <span className="truncate max-w-[180px] sm:max-w-[220px]">{st.headline}</span>
              </button>
            );
          })}
        </div>

        {/* Story Detail Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Headline & Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono font-bold uppercase border ${meta.bg} ${meta.border} ${meta.text}`}
              >
                <MetaIcon className="h-3.5 w-3.5" />
                <span>{meta.label}</span>
              </span>

              {linkedIndex !== null && (
                <button
                  onClick={() => {
                    goToStation(linkedIndex);
                    setStoryModalOpen(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-[#092a1c] px-3 py-1 text-[11px] font-mono font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-colors cursor-pointer"
                >
                  <span>Linked to Station {linkedIndex + 1}: {stations[linkedIndex]?.title}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
              {currentStory.headline}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-300 font-medium leading-relaxed bg-[#061e14] p-3 rounded-xl border border-emerald-500/30">
              {currentStory.summary}
            </p>
          </div>

          {/* Deep Narrative Body */}
          <div className="rounded-2xl border border-amber-400/20 bg-[#051910] p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-slate-200 space-y-3">
            <h4 className="text-[11px] font-mono uppercase font-black tracking-wider text-amber-400">
              In-Depth Engineering Narrative & Tradeoffs
            </h4>
            <p className="whitespace-pre-line leading-relaxed font-normal">
              {currentStory.body}
            </p>
            {currentStory.aiNote && (
              <div className="mt-3 rounded-xl bg-[#092519] border border-amber-400/30 p-3 text-xs text-amber-200 font-medium flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{currentStory.aiNote}</span>
              </div>
            )}
          </div>

          {/* Takeaway Card */}
          <div className="rounded-2xl border border-amber-400/60 bg-gradient-to-r from-[#072418] to-[#041910] p-4 flex items-start gap-3 shadow-sm">
            <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-black block">
                The Core Principle
              </span>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                "{currentStory.takeaway}"
              </p>
            </div>
          </div>

          {/* Verified Evidence & GitHub Links */}
          {currentStory.evidence && currentStory.evidence.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Verified Code Repositories & Evidence
              </span>
              <div className="flex flex-wrap gap-2">
                {currentStory.evidence.map((ev, idx) => (
                  <a
                    key={idx}
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-[#072115] hover:border-amber-400 hover:bg-[#0c3321] px-3.5 py-2 text-xs font-bold text-amber-300 hover:text-white transition-all cursor-pointer shadow-xs"
                  >
                    <span>{ev.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-amber-400/30 px-6 py-3.5 bg-[#061d13] shrink-0">
          <span className="text-[11px] font-mono text-slate-400">
            Case Study {stories.findIndex((s) => s.id === currentStory.id) + 1} of {stories.length}
          </span>
          <div className="flex items-center gap-2">
            {linkedIndex !== null && (
              <button
                onClick={() => {
                  goToStation(linkedIndex);
                  setStoryModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer shadow-md"
              >
                <span>Travel to Station {linkedIndex + 1}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

