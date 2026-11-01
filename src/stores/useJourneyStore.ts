import { create } from 'zustand';
import { portfolioData, type Station, type GuideState, type Mood } from '../data';
import { journeyCurveManager } from '../components/3d/JourneyCurve';

export type JourneyPhase = 'loading' | 'intro' | 'boarding' | 'journey' | 'terminus';
export type QualityTier = 'low' | 'mid' | 'high';
export type QualityMode = 'auto' | 'low' | 'mid' | 'high';
export type MobileSheetMode = 'peek' | 'expanded' | 'closed';
export type PanelType = 'station' | 'qa' | 'ticket' | 'recruiter' | 'none';
export type CameraMode = 'driver' | 'cinematic';
export type CameraPresetView = 'chase' | 'cab' | 'window' | 'aerial' | 'station';
export type PanelHeight = 'peek' | 'half' | 'full' | 'closed';

export interface StationDwell {
  index: number;
  progress: number;
  station: Station;
}

interface JourneyStore {
  // State machine
  phase: JourneyPhase;
  tier: QualityTier;
  qualityMode: QualityMode;
  reduceEffects: boolean;
  isKeyboardHelpOpen: boolean;
  navigatingTargetIndex: number | null;
  
  // Progress & Movement
  progress: number;
  targetProgress: number;
  velocity: number;
  isMoving: boolean;
  lastDirectInputTime: number;
  
  // Stations
  stations: Station[];
  currentStationIndex: number;
  activeStation: Station;
  currentMood: Mood;
  
  // UI & Panels
  activePanel: PanelType;
  mobileSheetMode: MobileSheetMode;
  panelHeight: PanelHeight;
  isMenuOpen: boolean;
  isCameraMenuOpen: boolean;
  isRecruiterDrawerOpen: boolean;
  isPassModalOpen: boolean;
  isContactModalOpen: boolean;
  isRoadmapOpen: boolean;
  isConductorModalOpen: boolean;
  isVoiceModalOpen: boolean;
  isStoryModalOpen: boolean;
  activeStoryId: string | null;
  
  // Camera & View
  cameraMode: CameraMode;
  cameraPreset: CameraPresetView;
  isStationPanelCollapsed: boolean;

  // Tour Guide
  guideVisible: boolean;
  isGuideSpeechOpen: boolean;
  guideState: GuideState;
  currentGuideSpeech: string;
  guideTypingComplete: boolean;
  
  // Audio
  isMuted: boolean;
  isAudioInitialized: boolean;
  masterVolume: number;
  
  // Actions
  setPhase: (phase: JourneyPhase) => void;
  setTier: (tier: QualityTier) => void;
  setQualityMode: (mode: QualityMode) => void;
  setReduceEffects: (reduce: boolean) => void;
  setKeyboardHelpOpen: (open: boolean) => void;
  setProgress: (progress: number) => void;
  setTargetProgress: (target: number) => void;
  setVelocity: (velocity: number) => void;
  recordDirectInput: () => void;
  goToStation: (index: number) => void;
  onStationArrived: (index: number) => void;
  nextStation: () => void;
  prevStation: () => void;
  setActivePanel: (panel: PanelType) => void;
  setMobileSheetMode: (mode: MobileSheetMode) => void;
  setPanelHeight: (height: PanelHeight) => void;
  togglePanelHeight: () => void;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
  setCameraMenuOpen: (open: boolean) => void;
  toggleCameraMenu: () => void;
  setRecruiterDrawerOpen: (open: boolean) => void;
  setPassModalOpen: (open: boolean) => void;
  setContactModalOpen: (open: boolean) => void;
  setRoadmapOpen: (open: boolean) => void;
  setConductorModalOpen: (open: boolean) => void;
  setVoiceModalOpen: (open: boolean) => void;
  setStoryModalOpen: (open: boolean, storyId?: string) => void;
  setCameraMode: (mode: CameraMode) => void;
  toggleCameraMode: () => void;
  setCameraPreset: (preset: CameraPresetView) => void;
  cycleCameraPreset: () => void;
  setIsStationPanelCollapsed: (collapsed: boolean) => void;
  toggleStationPanel: () => void;
  setGuideSpeechOpen: (open: boolean) => void;
  setGuideState: (state: GuideState, speech?: string) => void;
  setGuideSpeech: (speech: string) => void;
  setGuideTypingComplete: (complete: boolean) => void;
  toggleGuideVisibility: () => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  initAudio: () => void;
}

const stations = portfolioData.stations;

const savedQualityMode =
  (typeof window !== 'undefined'
    ? (localStorage.getItem('portfolio_quality_mode') as QualityMode)
    : null) || 'auto';
const savedReduceEffects =
  typeof window !== 'undefined' && localStorage.getItem('portfolio_reduce_effects') === 'true';

const initialTier: QualityTier =
  savedQualityMode === 'auto'
    ? typeof window !== 'undefined' && window.innerWidth < 768
      ? 'low'
      : 'mid'
    : savedQualityMode;

export const useJourneyStore = create<JourneyStore>((set, get) => ({
  phase: 'intro',
  tier: initialTier,
  qualityMode: savedQualityMode,
  reduceEffects: savedReduceEffects,
  isKeyboardHelpOpen: false,
  navigatingTargetIndex: null,
  
  progress: journeyCurveManager.getStationT(0),
  targetProgress: journeyCurveManager.getStationT(0),
  velocity: 0,
  isMoving: false,
  lastDirectInputTime: 0,
  
  stations,
  currentStationIndex: 0,
  activeStation: stations[0],
  currentMood: stations[0].mood,
  
  activePanel: 'station',
  mobileSheetMode: 'peek',
  panelHeight: 'full',
  isMenuOpen: false,
  isCameraMenuOpen: false,
  cameraMode: 'cinematic',
  cameraPreset: 'chase',
  isStationPanelCollapsed: false,
  isRecruiterDrawerOpen: false,
  isPassModalOpen: false,
  isContactModalOpen: false,
  isRoadmapOpen: false,
  isConductorModalOpen: false,
  isVoiceModalOpen: false,
  isStoryModalOpen: false,
  activeStoryId: null,
  
  guideVisible: true,
  isGuideSpeechOpen: true,
  guideState: 'greeting',
  currentGuideSpeech: portfolioData.guide.introLines[0] || 'Welcome aboard!',
  guideTypingComplete: false,
  
  isMuted: true,
  isAudioInitialized: false,
  masterVolume: 0.7,
  
  setPhase: (phase) => {
    set({ phase });
    if (phase === 'intro') {
      set({
        navigatingTargetIndex: null,
        guideState: 'greeting',
        currentGuideSpeech: portfolioData.guide.introLines[0],
        currentStationIndex: 0,
        activeStation: stations[0],
        currentMood: stations[0].mood,
        progress: journeyCurveManager.getStationT(0),
        targetProgress: journeyCurveManager.getStationT(0),
      });
    } else if (phase === 'terminus') {
      const terminusIdx = stations.length - 1;
      set({
        navigatingTargetIndex: null,
        guideState: 'celebrating',
        currentGuideSpeech: portfolioData.guide.outroLines[0],
        currentStationIndex: terminusIdx,
        activeStation: stations[terminusIdx],
        currentMood: 'night',
        progress: journeyCurveManager.getStationT(terminusIdx),
        targetProgress: journeyCurveManager.getStationT(terminusIdx),
      });
    }
  },
  
  setTier: (tier) => set({ tier }),
  
  setQualityMode: (mode) => {
    try {
      localStorage.setItem('portfolio_quality_mode', mode);
    } catch (_) {}
    if (mode === 'auto') {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      set({ qualityMode: 'auto', tier: isMobile ? 'low' : 'mid' });
    } else {
      set({ qualityMode: mode, tier: mode });
    }
  },

  setReduceEffects: (reduce) => {
    try {
      localStorage.setItem('portfolio_reduce_effects', String(reduce));
    } catch (_) {}
    set({ reduceEffects: reduce });
  },

  setKeyboardHelpOpen: (open) => set({ isKeyboardHelpOpen: open }),
  
  setProgress: (progress) => {
    const clamped = Math.max(0, Math.min(1, progress));
    const targetIndex = get().navigatingTargetIndex;
    
    // When navigating programmatically to a station, DO NOT change card until train physically halts at destination!
    if (targetIndex !== null) {
      set({ progress: clamped });
      return;
    }

    // Dynamic scrubbing / free wheeling: compute closest station
    const stationCount = stations.length;
    let closestIndex = get().currentStationIndex;
    let minDiff = Infinity;
    for (let i = 0; i < stationCount; i++) {
      const stnT = journeyCurveManager.getStationT(i);
      const diff = Math.abs(clamped - stnT);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    if (closestIndex !== get().currentStationIndex && minDiff < 0.008) {
      const activeStation = stations[closestIndex];
      const isTerminus = closestIndex === stations.length - 1;
      set({
        progress: clamped,
        currentStationIndex: closestIndex,
        activeStation,
        currentMood: activeStation.mood,
        guideState: closestIndex === 0 ? 'greeting' : isTerminus ? 'celebrating' : 'pointing',
        currentGuideSpeech: activeStation.guideLines[0] || `Arriving at ${activeStation.title}`,
      });
    } else {
      set({ progress: clamped });
    }
  },
  
  setTargetProgress: (targetProgress) => {
    const clamped = Math.max(0, Math.min(1, targetProgress));
    set({ targetProgress: clamped, navigatingTargetIndex: null });
  },
  
  setVelocity: (velocity) => {
    set({ velocity, isMoving: Math.abs(velocity) > 0.0001 });
  },

  recordDirectInput: () => {
    set({ lastDirectInputTime: performance.now(), navigatingTargetIndex: null });
  },
  
  goToStation: (index) => {
    const safeIndex = Math.max(0, Math.min(stations.length - 1, index));
    const newProgress = journeyCurveManager.getStationT(safeIndex);
    const station = stations[safeIndex];
    const isTerminus = safeIndex === stations.length - 1;
    const isAlreadyThere = Math.abs(get().progress - newProgress) < 0.0015;
    
    if (isAlreadyThere) {
      set({
        phase: 'journey',
        cameraPreset: 'chase',
        panelHeight: 'full',
        progress: newProgress,
        targetProgress: newProgress,
        navigatingTargetIndex: null,
        currentStationIndex: safeIndex,
        activeStation: station,
        currentMood: station.mood,
        guideState: safeIndex === 0 ? 'greeting' : isTerminus ? 'celebrating' : 'pointing',
        currentGuideSpeech: station.guideLines[0] || `Welcome to ${station.title}`,
        guideTypingComplete: false,
        isGuideSpeechOpen: false,
        mobileSheetMode: 'peek',
      });
    } else {
      // In transit: Keep current station card visible until arrival!
      set({
        phase: 'journey',
        cameraPreset: 'chase',
        panelHeight: 'full',
        targetProgress: newProgress,
        navigatingTargetIndex: safeIndex,
        isMoving: true,
      });
    }
  },

  onStationArrived: (index) => {
    const safeIndex = Math.max(0, Math.min(stations.length - 1, index));
    const station = stations[safeIndex];
    const isTerminus = safeIndex === stations.length - 1;
    set({
      currentStationIndex: safeIndex,
      activeStation: station,
      currentMood: station.mood,
      navigatingTargetIndex: null,
      isMoving: false,
      guideState: safeIndex === 0 ? 'greeting' : isTerminus ? 'celebrating' : 'pointing',
      currentGuideSpeech: station.guideLines[0] || `Welcome to ${station.title}!`,
      guideTypingComplete: false,
      isGuideSpeechOpen: true,
    });
  },
  
  nextStation: () => {
    const { currentStationIndex, navigatingTargetIndex } = get();
    const fromIndex = navigatingTargetIndex !== null ? navigatingTargetIndex : currentStationIndex;
    if (fromIndex < stations.length - 1) {
      get().goToStation(fromIndex + 1);
    } else {
      set({ phase: 'terminus' });
    }
  },
  
  prevStation: () => {
    const { currentStationIndex, navigatingTargetIndex } = get();
    const fromIndex = navigatingTargetIndex !== null ? navigatingTargetIndex : currentStationIndex;
    if (fromIndex > 0) {
      get().goToStation(fromIndex - 1);
    }
  },
  
  setActivePanel: (activePanel) => set({ activePanel }),
  setMobileSheetMode: (mobileSheetMode) => set({ mobileSheetMode }),
  setPanelHeight: (panelHeight) => {
    // Single-primary-panel rule: if panel expands to full, collapse guide speech to avoid crowding
    if (panelHeight === 'full') {
      set({ panelHeight, isGuideSpeechOpen: false, isStationPanelCollapsed: false });
    } else {
      set({ panelHeight, isStationPanelCollapsed: panelHeight === 'closed' });
    }
  },
  togglePanelHeight: () => {
    set((state) => {
      const order: PanelHeight[] = ['peek', 'half', 'full'];
      const nextIdx = (order.indexOf(state.panelHeight) + 1) % order.length;
      const nextHeight = order[nextIdx];
      return {
        panelHeight: nextHeight,
        isStationPanelCollapsed: nextHeight === 'closed',
        isGuideSpeechOpen: nextHeight === 'full' ? false : state.isGuideSpeechOpen,
      };
    });
  },
  setMenuOpen: (isMenuOpen) => {
    if (isMenuOpen) {
      set({ isMenuOpen: true, isCameraMenuOpen: false, isGuideSpeechOpen: false });
    } else {
      set({ isMenuOpen: false });
    }
  },
  toggleMenu: () =>
    set((state) => {
      const next = !state.isMenuOpen;
      return next
        ? { isMenuOpen: true, isCameraMenuOpen: false, isGuideSpeechOpen: false }
        : { isMenuOpen: false };
    }),
  setCameraMenuOpen: (isCameraMenuOpen) => {
    if (isCameraMenuOpen) {
      set({ isCameraMenuOpen: true, isMenuOpen: false, isGuideSpeechOpen: false });
    } else {
      set({ isCameraMenuOpen: false });
    }
  },
  toggleCameraMenu: () =>
    set((state) => {
      const next = !state.isCameraMenuOpen;
      return next
        ? { isCameraMenuOpen: true, isMenuOpen: false, isGuideSpeechOpen: false }
        : { isCameraMenuOpen: false };
    }),
  setRecruiterDrawerOpen: (isRecruiterDrawerOpen) =>
    set({ isRecruiterDrawerOpen, isMenuOpen: false, isCameraMenuOpen: false, isGuideSpeechOpen: false }),
  setPassModalOpen: (isPassModalOpen) =>
    set({ isPassModalOpen, isMenuOpen: false, isCameraMenuOpen: false, isGuideSpeechOpen: false }),
  setContactModalOpen: (isContactModalOpen) =>
    set({ isContactModalOpen, isMenuOpen: false, isCameraMenuOpen: false, isGuideSpeechOpen: false }),
  setRoadmapOpen: (isRoadmapOpen) =>
    set({ isRoadmapOpen, isMenuOpen: false, isCameraMenuOpen: false, isGuideSpeechOpen: false }),
  setConductorModalOpen: (isConductorModalOpen) =>
    set({ isConductorModalOpen, isMenuOpen: false, isCameraMenuOpen: false, isGuideSpeechOpen: false }),
  setVoiceModalOpen: (isVoiceModalOpen) =>
    set({ isVoiceModalOpen, isMenuOpen: false, isCameraMenuOpen: false, isGuideSpeechOpen: false }),
  setStoryModalOpen: (isStoryModalOpen, activeStoryId) =>
    set({
      isStoryModalOpen,
      activeStoryId: activeStoryId || null,
      isMenuOpen: false,
      isCameraMenuOpen: false,
      isGuideSpeechOpen: false,
    }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setCameraPreset: (cameraPreset) =>
    set({
      cameraPreset,
      cameraMode: cameraPreset === 'cab' ? 'driver' : 'cinematic',
    }),
  cycleCameraPreset: () =>
    set((state) => {
      const presets: CameraPresetView[] = ['chase', 'cab', 'window', 'aerial', 'station'];
      const nextIdx = (presets.indexOf(state.cameraPreset) + 1) % presets.length;
      const nextPreset = presets[nextIdx];
      return {
        cameraPreset: nextPreset,
        cameraMode: nextPreset === 'cab' ? 'driver' : 'cinematic',
      };
    }),
  toggleCameraMode: () =>
    set((state) => {
      const presets: CameraPresetView[] = ['chase', 'cab', 'window', 'aerial', 'station'];
      const nextIdx = (presets.indexOf(state.cameraPreset) + 1) % presets.length;
      const nextPreset = presets[nextIdx];
      return {
        cameraPreset: nextPreset,
        cameraMode: nextPreset === 'cab' ? 'driver' : 'cinematic',
      };
    }),
  setIsStationPanelCollapsed: (isStationPanelCollapsed) => set({ isStationPanelCollapsed }),
  toggleStationPanel: () => set((state) => ({ isStationPanelCollapsed: !state.isStationPanelCollapsed })),
  setGuideSpeechOpen: (isGuideSpeechOpen) => set({ isGuideSpeechOpen }),
  
  setGuideState: (guideState, speech) => {
    set((state) => ({
      guideState,
      currentGuideSpeech: speech ?? state.currentGuideSpeech,
      guideTypingComplete: speech ? false : state.guideTypingComplete,
    }));
  },
  
  setGuideSpeech: (currentGuideSpeech) => set({ currentGuideSpeech, guideTypingComplete: false }),
  setGuideTypingComplete: (guideTypingComplete) => set({ guideTypingComplete }),
  toggleGuideVisibility: () => set((s) => ({ guideVisible: !s.guideVisible })),
  
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setMuted: (isMuted) => set({ isMuted }),
  initAudio: () => set({ isAudioInitialized: true, isMuted: false }),
}));

if (typeof window !== 'undefined') {
  (window as any).__JOURNEY_STORE__ = useJourneyStore;
}


