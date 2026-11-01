import { useEffect, useRef, useState, useCallback } from 'react';
import { useJourneyStore } from '../stores/useJourneyStore';
import { portfolioData } from '../data';

interface TrainControlsState {
  isDragging: boolean;
  isCruising: boolean;
  speedKmh: number;
  toggleCruise: () => void;
  brake: () => void;
  cruiseForward: () => void;
  cruiseReverse: () => void;
}

export function useTrainControls(): TrainControlsState {
  const phase = useJourneyStore((s) => s.phase);
  const setTargetProgress = useJourneyStore((s) => s.setTargetProgress);
  const nextStation = useJourneyStore((s) => s.nextStation);
  const prevStation = useJourneyStore((s) => s.prevStation);
  const isRecruiterDrawerOpen = useJourneyStore((s) => s.isRecruiterDrawerOpen);

  const [isDragging, setIsDragging] = useState(false);
  const [isCruising, setIsCruising] = useState(false);
  const [speedKmh, setSpeedKmh] = useState(0);

  // Active key state for continuous keyboard driving
  const keysDown = useRef<Set<string>>(new Set());
  const keyDownTimestamp = useRef<Map<string, number>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  // Pointer drag state
  const dragStartRef = useRef<{ x: number; y: number; progress: number } | null>(null);

  // Throttled speedometer updates (10fps instead of 60fps React re-render thrashing)
  useEffect(() => {
    const interval = setInterval(() => {
      const v = useJourneyStore.getState().velocity;
      const curSpeed = Math.round(Math.abs(v) * 1200 * 3.6);
      setSpeedKmh((prev) => (Math.abs(prev - curSpeed) >= 2 ? curSpeed : prev));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const brake = useCallback(() => {
    setIsCruising(false);
    setTargetProgress(useJourneyStore.getState().progress);
  }, [setTargetProgress]);

  const toggleCruise = useCallback(() => {
    setIsCruising((prev) => !prev);
  }, []);

  const cruiseForward = useCallback(() => {
    setIsCruising(false);
    nextStation();
  }, [nextStation]);

  const cruiseReverse = useCallback(() => {
    setIsCruising(false);
    prevStation();
  }, [prevStation]);

  // 1. Mouse Pointer Drag Controller (Desktop Mouse & Touchpad Dragging on 3D Canvas)
  useEffect(() => {
    if (phase === 'intro' || isRecruiterDrawerOpen) return;

    const isInteractiveUI = (target: HTMLElement | null): boolean => {
      if (!target) return false;
      return !!(
        target.closest('#navigation-overlay') ||
        target.closest('header') ||
        target.closest('aside') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('[role="dialog"]') ||
        target.closest('[role="region"]') ||
        target.closest('[role="menu"]') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[data-menu="true"]') ||
        target.closest('.overflow-y-auto') ||
        target.closest('.overflow-x-auto') ||
        target.closest('[data-no-drag="true"]')
      );
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Only respond to primary left button click
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;
      // Do not initiate train drag if clicking on interactive UI elements or scrollable areas
      if (isInteractiveUI(target)) {
        return;
      }

      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        progress: useJourneyStore.getState().targetProgress,
      };
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return;

      useJourneyStore.getState().recordDirectInput();

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = dragStartRef.current.y - e.clientY; // inverted Y

      // Horizontal scrub combined with subtle vertical scrub
      const sensitivity = 0.00085;
      const progressDelta = (deltaX + deltaY * 0.3) * sensitivity;
      const newProgress = Math.max(0, Math.min(1, dragStartRef.current.progress + progressDelta));

      setTargetProgress(newProgress);
    };

    const handlePointerUp = () => {
      if (dragStartRef.current) {
        dragStartRef.current = null;
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [phase, isRecruiterDrawerOpen, setTargetProgress]);

  // 2. Mouse Wheel Controller (RAF-batched for buttery 60/120fps scrolling without micro-stutters)
  useEffect(() => {
    if (phase === 'intro' || isRecruiterDrawerOpen) return;

    let accumulatedDelta = 0;
    let rafId: number | null = null;

    const flushWheel = () => {
      rafId = null;
      if (Math.abs(accumulatedDelta) < 0.00001) return;
      useJourneyStore.getState().recordDirectInput();
      const currentTarget = useJourneyStore.getState().targetProgress;
      const newTarget = Math.max(0, Math.min(1, currentTarget + accumulatedDelta));
      accumulatedDelta = 0;
      setTargetProgress(newTarget);
    };

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('#navigation-overlay') ||
        target.closest('header') ||
        target.closest('aside') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('[role="dialog"]') ||
        target.closest('[role="region"]') ||
        target.closest('[role="menu"]') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[data-menu="true"]') ||
        target.closest('.overflow-y-auto') ||
        target.closest('.overflow-x-auto') ||
        target.closest('[data-no-drag="true"]')
      ) {
        return;
      }

      e.preventDefault();

      let deltaY = e.deltaY;
      if (e.deltaMode === 1) deltaY *= 28; // lines
      if (e.deltaMode === 2) deltaY *= 500; // pages

      // Balanced responsiveness without overshooting or stutter
      const sensitivity = 0.00075;
      accumulatedDelta += deltaY * sensitivity;

      if (!rafId) {
        rafId = requestAnimationFrame(flushWheel);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [phase, isRecruiterDrawerOpen, setTargetProgress]);

  // 3. Continuous Keyboard Driving & Hotkey Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const code = e.code;
      if (!keysDown.current.has(code)) {
        keysDown.current.add(code);
        keyDownTimestamp.current.set(code, Date.now());
      }

      // Single-action shortcut keys
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        useJourneyStore.getState().nextStation();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        useJourneyStore.getState().prevStation();
      } else if (e.key === 'v' || e.key === 'V' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        useJourneyStore.getState().cycleCameraPreset();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        useJourneyStore.getState().toggleStationPanel();
      } else if (e.key === ' ' || code === 'Space') {
        e.preventDefault();
        // Space bar: toggle auto cruise or emergency brake
        const curVel = useJourneyStore.getState().velocity;
        if (Math.abs(curVel) > 0.005) {
          brake();
        } else {
          toggleCruise();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        useJourneyStore.getState().toggleMute();
      } else if (e.key === 'Escape') {
        useJourneyStore.getState().setMenuOpen(false);
        useJourneyStore.getState().setRecruiterDrawerOpen(false);
        useJourneyStore.getState().setPassModalOpen(false);
        useJourneyStore.getState().setContactModalOpen(false);
        useJourneyStore.getState().setRoadmapOpen(false);
        useJourneyStore.getState().setConductorModalOpen(false);
      } else if (code === 'Home' || e.key === '1') {
        useJourneyStore.getState().goToStation(0);
      } else if (code === 'End' || e.key === '0') {
        useJourneyStore.getState().goToStation(portfolioData.stations.length - 1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const code = e.code;
      const pressDuration = Date.now() - (keyDownTimestamp.current.get(code) || 0);
      keysDown.current.delete(code);
      keyDownTimestamp.current.delete(code);

      // Short tap (< 250ms): step to next/prev station cleanly
      if (pressDuration < 250) {
        if (code === 'ArrowRight' || code === 'KeyD' || code === 'KeyW') {
          nextStation();
        } else if (code === 'ArrowLeft' || code === 'KeyA' || code === 'KeyS') {
          prevStation();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    nextStation,
    prevStation,
    brake,
    toggleCruise,
  ]);

  // 4. Smooth continuous frame loop for held keys and auto-cruise
  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaSec = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const activeKeys = keysDown.current;
      const hasDriveForward =
        activeKeys.has('ArrowRight') ||
        activeKeys.has('KeyD') ||
        activeKeys.has('KeyW');
      const hasDriveReverse =
        activeKeys.has('ArrowLeft') ||
        activeKeys.has('KeyA') ||
        activeKeys.has('KeyS');

      if (hasDriveForward || hasDriveReverse || isCruising) {
        const currentTarget = useJourneyStore.getState().targetProgress;
        let deltaProgress = 0;

        if (hasDriveForward) {
          useJourneyStore.getState().recordDirectInput();
          deltaProgress += 0.16 * deltaSec; // Responsive drive forward speed
        }
        if (hasDriveReverse) {
          useJourneyStore.getState().recordDirectInput();
          deltaProgress -= 0.16 * deltaSec; // Responsive reverse speed
        }
        if (isCruising && !hasDriveReverse) {
          useJourneyStore.getState().recordDirectInput();
          deltaProgress += 0.08 * deltaSec; // Smooth automated cruise speed
        }

        if (deltaProgress !== 0) {
          const nextTarget = Math.max(0, Math.min(1, currentTarget + deltaProgress));
          setTargetProgress(nextTarget);

          // Stop cruise if reached terminus
          if (nextTarget >= 1 && isCruising) {
            setIsCruising(false);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCruising, setTargetProgress]);

  return {
    isDragging,
    isCruising,
    speedKmh,
    toggleCruise,
    brake,
    cruiseForward,
    cruiseReverse,
  };
}
