import { useState, useEffect } from 'react';
import { useJourneyStore, type QualityTier } from '../stores/useJourneyStore';

export interface ViewportInfo {
  width: number;
  height: number;
  aspect: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  tier: QualityTier;
  hasTouch: boolean;
  prefersReducedMotion: boolean;
}

export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'mid';

  // 1. Honor prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'low';
  }

  const cores = navigator.hardwareConcurrency || 4;
  // @ts-expect-error deviceMemory is supported in Chromium browsers
  const memory = navigator.deviceMemory || 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );

  // 2. Mobile devices default to balanced mid or low tier
  if (isMobile) {
    return cores >= 8 && memory >= 6 ? 'mid' : 'low';
  }

  // 3. Desktop / Laptop hardware evaluation (pure zero-WebGL overhead)
  if (cores >= 8 && memory >= 6) {
    return 'high';
  }
  if (cores <= 4 || memory < 4) {
    return 'low';
  }

  return 'high';
}

export function useViewport(): ViewportInfo {
  const storeTier = useJourneyStore((s) => s.tier);
  const setStoreTier = useJourneyStore((s) => s.setTier);

  const [state, setState] = useState<ViewportInfo>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const h = typeof window !== 'undefined' ? window.innerHeight : 720;
    const aspect = w / (h || 1);
    const isMobile = w < 768;
    const isTablet = w >= 768 && w < 1024;
    const isDesktop = w >= 1024;
    const isPortrait = h > w;
    const isLandscape = !isPortrait;
    const hasTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const prefersReducedMotion =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
    const initialTier = detectQualityTier();

    return {
      width: w,
      height: h,
      aspect,
      isMobile,
      isTablet,
      isDesktop,
      isPortrait,
      isLandscape,
      tier: initialTier,
      hasTouch,
      prefersReducedMotion,
    };
  });

  useEffect(() => {
    const initialTier = detectQualityTier();
    setStoreTier(initialTier);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / (h || 1);
      const isMobile = w < 768;
      const isTablet = w >= 768 && w < 1024;
      const isDesktop = w >= 1024;
      const isPortrait = h > w;
      const isLandscape = !isPortrait;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setState({
        width: w,
        height: h,
        aspect,
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        isLandscape,
        tier: storeTier,
        hasTouch,
        prefersReducedMotion,
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [setStoreTier, storeTier]);

  return { ...state, tier: storeTier };
}

