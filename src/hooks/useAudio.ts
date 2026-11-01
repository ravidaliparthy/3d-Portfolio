import { useEffect } from 'react';
import { useJourneyStore } from '../stores/useJourneyStore';
import { trainAudio } from '../utils/audioSynthesizer';

export function useAudio() {
  const isMuted = useJourneyStore((s) => s.isMuted);
  const isAudioInitialized = useJourneyStore((s) => s.isAudioInitialized);
  const toggleMute = useJourneyStore((s) => s.toggleMute);
  const initAudio = useJourneyStore((s) => s.initAudio);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);

  useEffect(() => {
    if (isAudioInitialized) {
      trainAudio.setMuted(isMuted);
    }
  }, [isMuted, isAudioInitialized]);

  // Trigger station bell when reaching a new milestone
  useEffect(() => {
    if (isAudioInitialized && !isMuted) {
      trainAudio.playStationChime();
    }
  }, [currentStationIndex, isAudioInitialized, isMuted]);

  const handleUserGestureStart = () => {
    if (!isAudioInitialized) {
      const ok = trainAudio.init();
      if (ok) {
        initAudio();
        trainAudio.playWhistle();
      }
    } else {
      trainAudio.resume();
    }
  };

  return {
    isMuted,
    isAudioInitialized,
    toggleMute,
    handleUserGestureStart,
    playWhistle: () => trainAudio.playWhistle(),
  };
}

