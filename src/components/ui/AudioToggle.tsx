import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export const AudioToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isMuted, isAudioInitialized, toggleMute, handleUserGestureStart } = useAudio();

  const handleClick = () => {
    if (!isAudioInitialized) {
      handleUserGestureStart();
    } else {
      toggleMute();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-md transition-all hover:border-amber-500/40 hover:bg-slate-800 ${className}`}
      aria-label={isMuted ? 'Unmute Audio & Music' : 'Mute Audio & Music'}
      title="Toggle Audio (Press M)"
    >
      {isMuted ? (
        <>
          <VolumeX className="h-4 w-4 text-slate-400" />
          <span className="hidden sm:inline text-slate-400">Audio Muted</span>
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4 text-amber-400" />
          {/* Animated audio equalizer bars */}
          <div className="flex h-3 items-end gap-0.5">
            <span className="w-0.5 animate-[pulse_0.6s_ease-in-out_infinite] bg-amber-400 h-2.5" />
            <span className="w-0.5 animate-[pulse_0.8s_ease-in-out_infinite_0.2s] bg-amber-400 h-3" />
            <span className="w-0.5 animate-[pulse_0.7s_ease-in-out_infinite_0.4s] bg-amber-400 h-1.5" />
          </div>
        </>
      )}
    </button>
  );
};

