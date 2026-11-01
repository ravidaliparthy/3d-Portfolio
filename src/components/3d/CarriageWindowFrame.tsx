import React from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { useAudio } from '../../hooks/useAudio';

export const CarriageWindowFrame: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);
  const { playWhistle } = useAudio();

  // Low tier omits vignette frame to prioritize screen area and mobile performance
  if (tier === 'low') return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Top curved brass window header */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-slate-950/80 to-transparent border-b border-amber-900/30" />

      {/* Subtle glass reflection sheen across view */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-transparent pointer-events-none" />

      {/* Interactive Pull-Cord Whistle in top right corner */}
      <button
        onClick={playWhistle}
        className="pointer-events-auto absolute top-20 right-6 flex flex-col items-center group cursor-pointer"
        title="Pull Whistle Cord (Easter Egg)"
        aria-label="Pull whistle cord"
      >
        {/* Cord cordline */}
        <div className="w-0.5 h-10 bg-amber-600/70 group-hover:bg-amber-400 group-hover:h-12 transition-all" />
        {/* Brass wooden pull handle */}
        <div className="h-6 w-3 rounded-full bg-gradient-to-b from-amber-500 to-amber-700 shadow-md group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

