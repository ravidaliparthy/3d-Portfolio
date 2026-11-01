import React, { useEffect, useRef } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { X, MessageSquare, Ticket, Mail, Sparkles } from 'lucide-react';

const GuideSpeechBox = React.memo<{ text: string }>(({ text }) => {
  return (
    <div className="my-2.5 rounded-xl border border-emerald-500/30 bg-[#061c13]/90 p-2.5 shadow-inner">
      <p className="text-xs font-medium leading-relaxed text-slate-100 min-h-[44px]">
        {text}
      </p>
    </div>
  );
});

export const GuideCard: React.FC = React.memo(() => {
  const activeStation = useJourneyStore((s) => s.activeStation);
  const currentGuideSpeech = useJourneyStore((s) => s.currentGuideSpeech);
  const isGuideSpeechOpen = useJourneyStore((s) => s.isGuideSpeechOpen);
  const setGuideSpeechOpen = useJourneyStore((s) => s.setGuideSpeechOpen);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);
  const setActivePanel = useJourneyStore((s) => s.setActivePanel);
  const setPanelHeight = useJourneyStore((s) => s.setPanelHeight);
  const setPassModalOpen = useJourneyStore((s) => s.setPassModalOpen);
  const setContactModalOpen = useJourneyStore((s) => s.setContactModalOpen);
  const guideState = useJourneyStore((s) => s.guideState);
  const isMenuOpen = useJourneyStore((s) => s.isMenuOpen);
  const isCameraMenuOpen = useJourneyStore((s) => s.isCameraMenuOpen);
  const isConductorModalOpen = useJourneyStore((s) => s.isConductorModalOpen);
  const isPassModalOpen = useJourneyStore((s) => s.isPassModalOpen);
  const isContactModalOpen = useJourneyStore((s) => s.isContactModalOpen);
  const isRoadmapOpen = useJourneyStore((s) => s.isRoadmapOpen);
  const isRecruiterDrawerOpen = useJourneyStore((s) => s.isRecruiterDrawerOpen);
  const isMoving = useJourneyStore((s) => s.isMoving);
  const navigatingTargetIndex = useJourneyStore((s) => s.navigatingTargetIndex);

  const isTraveling = isMoving || navigatingTargetIndex !== null;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userManuallyToggledRef = useRef(false);

  // While travelling or when ANY menu/modal is open, conductor MUST disappear completely
  const isAnyMenuOrModalOpen =
    isTraveling ||
    isMenuOpen ||
    isCameraMenuOpen ||
    isConductorModalOpen ||
    isPassModalOpen ||
    isContactModalOpen ||
    isRoadmapOpen ||
    isRecruiterDrawerOpen;

  const targetSpeech =
    currentGuideSpeech ||
    activeStation?.guideLines?.[0] ||
    'Welcome aboard the Central Milestone Express!';

  // Initial auto-preview upon station arrival: auto-collapses after 8s
  const startCollapseTimer = () => {
    if (userManuallyToggledRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setGuideSpeechOpen(false);
    }, 8000);
  };

  const cancelCollapseTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (isTraveling) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    userManuallyToggledRef.current = false;
    // Display conductor speech message upon arriving at any station and auto-collapse after 8s
    setGuideSpeechOpen(true);
    startCollapseTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStationIndex, targetSpeech, isTraveling, setGuideSpeechOpen]);

  // Toggle button handler
  const handleToggleAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) clearTimeout(timerRef.current);
    userManuallyToggledRef.current = true;
    setGuideSpeechOpen(!isGuideSpeechOpen);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) clearTimeout(timerRef.current);
    userManuallyToggledRef.current = true;
    setGuideSpeechOpen(false);
  };

  const handleOpenQA = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGuideSpeechOpen(false);
    useJourneyStore.getState().setCameraPreset('chase');
    setActivePanel('qa');
    setPanelHeight('full');
  };

  const badgeText =
    guideState === 'greeting'
      ? 'WELCOMING'
      : guideState === 'pointing'
      ? 'POINTING AT LANDMARK'
      : guideState === 'celebrating'
      ? 'CELEBRATING'
      : 'MILESTONE INSIGHT';

  if (isAnyMenuOrModalOpen) {
    return null;
  }

  return (
    <div
      data-no-drag="true"
      className="pointer-events-auto fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-30 flex flex-col items-end select-none"
      onMouseEnter={cancelCollapseTimer}
      onMouseLeave={startCollapseTimer}
    >
      {/* Rich Conductor Guide Speech Card */}
      {isGuideSpeechOpen && (
        <div className="mb-2 w-[310px] sm:w-[380px] rounded-2xl border-2 border-amber-400/70 bg-[#04180f]/95 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Header Row: Avatar Thumbnail, Conductor Info, Close Button */}
          <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-amber-400/25">
            <div className="flex items-center gap-2.5">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border-2 border-amber-400 bg-[#0a2419] shadow-md">
                <img
                  src="/assets/guide/guide_reference.jpg"
                  alt="Conductor Charan"
                  className="h-full w-full object-cover object-top"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/guide/charan_avatar.jpg';
                  }}
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#061a12]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-black text-amber-300">
                    Charan (Journey Conductor)
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-400 border border-amber-400/40">
                    <Sparkles className="h-2.5 w-2.5" />
                    {badgeText}
                  </span>
                </div>
                {activeStation && (
                  <p className="text-[10px] font-mono text-emerald-400 font-bold truncate max-w-[210px] mt-0.5">
                    {activeStation.title}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleClose}
              type="button"
              className="rounded-lg p-1 text-amber-400/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close tour commentary"
              aria-label="Close commentary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Speech Dialogue Box isolated in memoized component */}
          <GuideSpeechBox text={targetSpeech} />

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={handleOpenQA}
              type="button"
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/15 py-1.5 px-2 text-[11px] font-mono font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-colors cursor-pointer"
              title="Open Recruiter Q&A for this station"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Ask Q&A</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setGuideSpeechOpen(false);
                setPassModalOpen(true);
              }}
              type="button"
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 py-1.5 px-2 text-[11px] font-mono font-bold text-emerald-300 hover:bg-emerald-400 hover:text-slate-950 transition-colors cursor-pointer"
              title="Open Souvenir Boarding Pass"
            >
              <Ticket className="h-3 w-3" />
              <span>Boarding Pass</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setGuideSpeechOpen(false);
                setContactModalOpen(true);
              }}
              type="button"
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-teal-500/40 bg-teal-500/15 py-1.5 px-2 text-[11px] font-mono font-bold text-teal-300 hover:bg-teal-400 hover:text-slate-950 transition-colors cursor-pointer"
              title="Send direct transmission"
            >
              <Mail className="h-3 w-3" />
              <span>Contact</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Conductor Avatar Beacon */}
      <button
        onClick={handleToggleAvatar}
        className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-[#0a2419] to-[#061a12] shadow-[0_8px_30px_rgba(0,0,0,0.9)] hover:scale-105 hover:border-amber-300 transition-all cursor-pointer overflow-hidden"
        title="Charan (Journey Conductor) — Click to open/close tour commentary"
        aria-label="Conductor Charan"
      >
        <img
          src="/assets/guide/guide_reference.jpg"
          alt="Charan"
          className="h-full w-full object-cover object-top"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/assets/guide/charan_avatar.jpg';
          }}
        />
        {/* Glowing online indicator */}
        <span className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#061a12]">
          <span className="h-2 w-2 rounded-full bg-white" />
        </span>
      </button>
    </div>
  );
});
