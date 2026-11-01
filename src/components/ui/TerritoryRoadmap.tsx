import React, { useState, useEffect, useRef } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import {
  Sparkles,
  Map,
  X,
  Train,
  GraduationCap,
  Brain,
  Code2,
  Trophy,
  Mail,
  ExternalLink,
  Award,
  Calendar,
  MapPin,
  Compass,
  FileText,
  Filter,
} from 'lucide-react';

export interface PortfolioStateInfo {
  id: string;
  stateNumber: number;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  biomeName: string;
  stationIndices: number[]; // 0-indexed station indices
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  facts: string[];
}

export const PORTFOLIO_STATES: PortfolioStateInfo[] = [
  {
    id: 'state-1',
    stateNumber: 1,
    name: 'State 1: Origin Concourse',
    shortName: '1. Origin',
    tagline: 'Executive Profile & Career Identity',
    description: 'Software & AI/ML Engineer focused on high-performance geospatial models, low-latency edge systems, and full-stack architecture.',
    biomeName: 'Concourse & Heritage Platform',
    stationIndices: [0], // Station 1
    icon: Sparkles,
    accentColor: '#f59e0b',
    facts: [
      'Published Researcher (IIT ISM Dhanbad SME-2025)',
      'National AI/ML Hackathon Finalist (Top 10% of ~400 Teams)',
      'SASTRA B.Tech ICT (CGPA 8.54 / 10, Top 10% of Department)',
      '0.867 IoU Rooftop Segmentation across 17,954 buildings',
    ],
  },
  {
    id: 'state-2',
    stateNumber: 2,
    name: 'State 2: Academic Foundations & Leadership',
    shortName: '2. Academics',
    tagline: 'MPC 97.8%, SASTRA Degree & Daksh Leadership',
    description: 'Analytical mathematics rigor, foundational computer systems engineering, and campus techno-management leadership.',
    biomeName: 'Meadow Plains & Campus Towers',
    stationIndices: [1, 2, 3], // Stations 2, 3, 4
    icon: GraduationCap,
    accentColor: '#10b981',
    facts: [
      'Narayana Junior College: 97.8% Board Score (JEE Main 90.4%ile)',
      'SASTRA Deemed University: B.Tech in ICT (CGPA 8.54, Top 10%)',
      'President, SASTRA Mathematics Club',
      'Core Member, Daksh Workshops (8+ events, 200+ strength)',
    ],
  },
  {
    id: 'state-3',
    stateNumber: 3,
    name: 'State 3: AI Research Province',
    shortName: '3. AI Research',
    tagline: 'Seismic Deep Learning & GeoAI Vision',
    description: 'Peer-reviewed research presented at IIT ISM Dhanbad and computer vision benchmarking over drone orthomosaics.',
    biomeName: 'Red Rock Canyon & Alpine Snow Peaks',
    stationIndices: [4, 5], // Stations 5, 6
    icon: Brain,
    accentColor: '#38bdf8',
    facts: [
      'Peer-Reviewed Paper: SME-2025 at IIT (ISM) Dhanbad',
      'Physics-guided CNN for seismic wave velocity inversion (99.05% in-sample)',
      'Drone Rooftop Segmentation: 0.867 IoU on 17,954 buildings in Nacala',
      'Extreme 56:1 class imbalance solved via dual-head hybrid loss',
    ],
  },
  {
    id: 'state-4',
    stateNumber: 4,
    name: 'State 4: Production Systems & Cloud',
    shortName: '4. Production',
    tagline: 'Live Edge AI, PWA & Distributed Web',
    description: 'Production applications deployed live on Cloudflare Workers, Vercel, and Render with real-time AI and offline synchronization.',
    biomeName: 'Ocean Coast & Stone Viaduct Span',
    stationIndices: [6, 7, 8], // Stations 7, 8, 9
    icon: Code2,
    accentColor: '#14b8a6',
    facts: [
      'Expense Tracker SPA: Angular 16 Signals, Express, Turso libSQL, Offline PWA',
      'Resume Agent: Cloudflare Workers AI, Llama 3.3 70B, Durable Objects (<180ms cold start)',
      'AI Technical Interviewer: Groq LPU (500+ tok/s), Next.js, FastAPI multi-language sandbox',
    ],
  },
  {
    id: 'state-5',
    stateNumber: 5,
    name: 'State 5: Hackathon & Industry Training',
    shortName: '5. Honors',
    tagline: 'IIT Tirupati Finalist & Corporate Leadership Cohort',
    description: 'Competitive national hackathon placement under IIT faculty alongside selective enterprise industry training programs.',
    biomeName: 'Golden Mountain Ridges & Peaks',
    stationIndices: [9, 10], // Stations 10, 11
    icon: Trophy,
    accentColor: '#eab308',
    facts: [
      'National AI/ML Hackathon 2026 Finalist (IIT Tirupati & Ministry of Panchayati Raj)',
      'Ranked in Top 10% of ~400 competing teams across India (40 of 400 selected)',
      'Matrimorphosis Industry Program: Top 250 / 3,000+ candidates (Matrimony.com 5-month cohort)',
      'Course Certifications & Internships: NilTech-Edu ML Course, TATA iQ, Sync Intern & Bharat Intern',
    ],
  },
  {
    id: 'state-6',
    stateNumber: 6,
    name: 'State 6: Grand Central Terminus',
    shortName: '6. Terminus',
    tagline: 'Contact Gate & Dispatch Lounge',
    description: 'Official departure concourse, verified credentials, direct EmailJS inquiries, and souvenir transit passes.',
    biomeName: 'Hyderabad Grand Central Terminus',
    stationIndices: [11], // Station 12
    icon: Mail,
    accentColor: '#f43f5e',
    facts: [
      'Direct Dispatch to ravidaliparthy@gmail.com via verified EmailJS service',
      'Verified Open-Source Repositories at github.com/ravidaliparthy',
      'Customizable 1200x580 PNG Souvenir Boarding Pass generator',
      'Location: Hyderabad, India • Open to Software & ML Engineering roles',
    ],
  },
];

export const getPortfolioStateForStation = (stationIdx: number): PortfolioStateInfo => {
  const found = PORTFOLIO_STATES.find((st) => st.stationIndices.includes(stationIdx));
  return found || PORTFOLIO_STATES[0];
};

// Landscape Waypoint Coordinates (x: 0..1200, y: 0..380) along a scenic horizontal landscape path
export interface LandscapeWaypoint {
  index: number;
  stationNumber: number;
  title: string;
  org: string;
  stateNumber: number;
  x: number;
  y: number;
  biome: string;
}

export const LANDSCAPE_WAYPOINTS: LandscapeWaypoint[] = [
  { index: 0, stationNumber: 1, title: 'About Me', org: 'Executive Profile', stateNumber: 1, x: 70, y: 240, biome: 'Concourse' },
  { index: 1, stationNumber: 2, title: 'Narayana MPC', org: '97.8% Board Score', stateNumber: 2, x: 170, y: 210, biome: 'Meadow' },
  { index: 2, stationNumber: 3, title: 'SASTRA Univ', org: 'B.Tech ICT 8.54 CGPA', stateNumber: 2, x: 260, y: 260, biome: 'Campus' },
  { index: 3, stationNumber: 4, title: 'Leadership', org: 'Daksh Workshops', stateNumber: 2, x: 350, y: 235, biome: 'Forest' },
  { index: 4, stationNumber: 5, title: 'Nacala GeoAI', org: '0.867 IoU Segmentation', stateNumber: 3, x: 450, y: 175, biome: 'Canyon' },
  { index: 5, stationNumber: 6, title: 'IIT Dhanbad', org: 'SME-2025 Paper', stateNumber: 3, x: 550, y: 150, biome: 'Snow Mountain' },
  { index: 6, stationNumber: 7, title: 'Expense Tracker', org: 'Angular PWA', stateNumber: 4, x: 660, y: 245, biome: 'Viaduct' },
  { index: 7, stationNumber: 8, title: 'Resume Agent', org: 'Workers AI Edge', stateNumber: 4, x: 760, y: 215, biome: 'Coast' },
  { index: 8, stationNumber: 9, title: 'AI Interviewer', org: 'Groq LPU 500+ tok/s', stateNumber: 4, x: 860, y: 180, biome: 'Coast' },
  { index: 9, stationNumber: 10, title: 'National Hackathon', org: '40/400 Teams (Top 10%)', stateNumber: 5, x: 960, y: 165, biome: 'High Ridge' },
  { index: 10, stationNumber: 11, title: 'Industry Training', org: 'Matrimorphosis Top 250', stateNumber: 5, x: 1055, y: 220, biome: 'Highland' },
  { index: 11, stationNumber: 12, title: 'Grand Central', org: 'Contact Gate Terminus', stateNumber: 6, x: 1145, y: 200, biome: 'Terminus' },
];

interface TerritoryRoadmapProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TerritoryRoadmap: React.FC<TerritoryRoadmapProps> = ({ isOpen, onClose }) => {
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);
  const goToStation = useJourneyStore((s) => s.goToStation);
  const phase = useJourneyStore((s) => s.phase);
  const stations = useJourneyStore((s) => s.stations);

  const [selectedStationIndex, setSelectedStationIndex] = useState<number>(currentStationIndex);
  const [recruiterFilter, setRecruiterFilter] = useState<'all' | 'ai' | 'production' | 'leadership' | 'academics'>('all');
  const [transitionNotification, setTransitionNotification] = useState<{
    fromState: PortfolioStateInfo;
    toState: PortfolioStateInfo;
  } | null>(null);

  const lastStateNumberRef = useRef<number>(1);
  const isFirstMountRef = useRef<boolean>(true);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync selected station with current station index
  useEffect(() => {
    setSelectedStationIndex(currentStationIndex);
  }, [currentStationIndex]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Monitor state transitions:
  // Timer-managed notification that checks active station continuously
  useEffect(() => {
    const currentState = getPortfolioStateForStation(currentStationIndex);

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      lastStateNumberRef.current = currentState.stateNumber;
      return;
    }

    const prevNum = lastStateNumberRef.current;
    const currNum = currentState.stateNumber;

    // Check station: if a notification is currently showing, verify the station still belongs to target state
    if (transitionNotification) {
      if (!transitionNotification.toState.stationIndices.includes(currentStationIndex)) {
        if (notificationTimerRef.current) {
          clearTimeout(notificationTimerRef.current);
          notificationTimerRef.current = null;
        }
        setTransitionNotification(null);
      }
    }

    if (phase === 'journey') {
      // Trigger notification when topic actually advances forward to a new state
      if (currNum > prevNum) {
        const fromState = PORTFOLIO_STATES.find((s) => s.stateNumber === prevNum) || PORTFOLIO_STATES[0];
        
        setTransitionNotification({
          fromState,
          toState: currentState,
        });

        if (notificationTimerRef.current) {
          clearTimeout(notificationTimerRef.current);
        }

        notificationTimerRef.current = setTimeout(() => {
          setTransitionNotification(null);
          notificationTimerRef.current = null;
        }, 3600);
      } else if (currNum < prevNum) {
        // Navigating backwards: immediately clear any transition notification
        if (notificationTimerRef.current) {
          clearTimeout(notificationTimerRef.current);
          notificationTimerRef.current = null;
        }
        setTransitionNotification(null);
      }
      lastStateNumberRef.current = currNum;
    } else {
      lastStateNumberRef.current = currNum;
    }
  }, [currentStationIndex, phase, transitionNotification]);

  const handleDismissNotification = () => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
    setTransitionNotification(null);
  };

  const activeState = getPortfolioStateForStation(currentStationIndex);
  const selectedWaypoint = LANDSCAPE_WAYPOINTS[selectedStationIndex] || LANDSCAPE_WAYPOINTS[0];
  const selectedStationData = stations[selectedStationIndex] || stations[0];
  const selectedStationState = getPortfolioStateForStation(selectedStationIndex);

  // Calculate current locomotive position along the landscape track
  const currentWaypoint = LANDSCAPE_WAYPOINTS[currentStationIndex] || LANDSCAPE_WAYPOINTS[0];

  const isWaypointHighlighted = (wpIndex: number) => {
    if (recruiterFilter === 'all') return true;
    if (recruiterFilter === 'ai') return [4, 5].includes(wpIndex);
    if (recruiterFilter === 'production') return [6, 7, 8].includes(wpIndex);
    if (recruiterFilter === 'leadership') return [3, 9, 10].includes(wpIndex);
    if (recruiterFilter === 'academics') return [1, 2].includes(wpIndex);
    return true;
  };

  return (
    <>
      {/* Ambient State Boundary Crossing Notification Banner:
          Appears ONLY when entering a new topic/state forward, NEVER between stations of the same topic */}
      {transitionNotification && (
        <div
          className="fixed top-16 right-4 sm:right-8 z-50 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-300 max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-[#04160e] via-[#082218] to-[#04160e] p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.95),0_0_25px_rgba(245,158,11,0.3)]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shadow-md mt-0.5">
              <Train className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="rounded bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-slate-950 uppercase tracking-wider">
                  New Topic
                </span>
                <span className="text-[10px] font-mono text-emerald-300 font-bold truncate">
                  Finished {transitionNotification.fromState.shortName}
                </span>
              </div>
              <h4 className="text-xs font-black text-white tracking-wide truncate">
                Entering {transitionNotification.toState.name}
              </h4>
              <p className="text-[10px] text-amber-200 font-medium truncate mt-0.5">
                {transitionNotification.toState.tagline}
              </p>
            </div>

            <button
              onClick={handleDismissNotification}
              className="text-amber-200/80 hover:text-white p-1 cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Widescreen Landscape Transit Route Map Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center bg-black/95 p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-label="Landscape Journey Route Map"
        >
          <div className="relative w-full max-w-6xl my-auto overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-[#020b06] p-5 sm:p-7 shadow-[0_0_90px_rgba(0,0,0,1)] text-left flex flex-col gap-4">
            
            {/* Landscape Map Top Navigation Ribbon */}
            <div className="flex flex-wrap items-center justify-between border-b border-amber-400/25 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black shadow-md">
                  <Map className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-widest">
                      Landscape Route Map
                    </span>
                    <span className="text-[11px] font-mono text-emerald-300 font-bold">
                      6 Portfolio States • 12 Continuous Stations
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                    The Ravi Express Landscape Expedition
                  </h3>
                </div>
              </div>

              {/* State Pills Quick Navigation */}
              <div className="hidden lg:flex items-center gap-1.5 bg-[#03130c] p-1.5 rounded-2xl border border-amber-400/25">
                {PORTFOLIO_STATES.map((st) => {
                  const isActive = st.id === activeState.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        goToStation(st.stationIndices[0]);
                        setSelectedStationIndex(st.stationIndices[0]);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {st.shortName}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2 text-amber-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                aria-label="Close landscape map"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Technical Recruiter Filter & Fast-Track Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-emerald-500/30 bg-[#04160f]/90 p-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 mr-1">
                  <Filter className="h-3 w-3 text-amber-400" />
                  <span>Recruiter Focus:</span>
                </span>
                {[
                  { key: 'all', label: 'All Milestones (12)' },
                  { key: 'ai', label: '🧠 AI Research (Stn 5-6)' },
                  { key: 'production', label: '⚡ Production Systems (Stn 7-9)' },
                  { key: 'leadership', label: '🏆 Leadership & Hackathons (Stn 4, 10-11)' },
                  { key: 'academics', label: '🎓 Academics (Stn 2-3)' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setRecruiterFilter(f.key as any);
                      if (f.key === 'ai') setSelectedStationIndex(4);
                      else if (f.key === 'production') setSelectedStationIndex(7);
                      else if (f.key === 'leadership') setSelectedStationIndex(9);
                      else if (f.key === 'academics') setSelectedStationIndex(1);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      recruiterFilter === f.key
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-102'
                        : 'border border-white/10 bg-[#062015] text-slate-200 hover:border-amber-400/50 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Fast Recruiter Direct Actions */}
              <div className="flex items-center gap-2">
                <a
                  href="/Daliparthy_Ravi_Krishna_Charan_Resume.pdf"
                  download="Daliparthy_Ravi_Krishna_Charan_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Resume PDF</span>
                </a>
                <button
                  onClick={() => {
                    onClose();
                    useJourneyStore.getState().setContactModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-200 hover:bg-emerald-400 hover:text-slate-950 transition-all cursor-pointer shadow-sm"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Direct Message</span>
                </button>
              </div>
            </div>

            {/* Panoramic Landscape SVG Canvas Container with Horizontal Scroll fallback */}
            <div className="relative w-full overflow-x-auto rounded-2xl border-2 border-amber-400/30 bg-gradient-to-b from-[#071d14] via-[#04140e] to-[#010805] shadow-inner select-none">
              <div className="min-w-[960px] lg:min-w-full relative h-[310px] sm:h-[350px]">
                
                {/* SVG Landscape Canvas */}
                <svg
                  viewBox="0 0 1200 360"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Sky Gradient */}
                    <linearGradient id="landscapeSky" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0d2c1f" />
                      <stop offset="25%" stopColor="#0a2e21" />
                      <stop offset="45%" stopColor="#22170b" />
                      <stop offset="65%" stopColor="#0d2433" />
                      <stop offset="85%" stopColor="#1f1807" />
                      <stop offset="100%" stopColor="#06120b" />
                    </linearGradient>

                    {/* Terrain Silhouette Gradient */}
                    <linearGradient id="terrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0d3526" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#020d08" stopOpacity="0.95" />
                    </linearGradient>

                    {/* Active Track Gold Glow */}
                    <filter id="trackGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* 1. Atmospheric Sky Wash */}
                  <rect x="0" y="0" width="1200" height="360" fill="url(#landscapeSky)" />

                  {/* 2. Background Topographical Mountain & Canyon Silhouettes */}
                  {/* Rolling Hills (State 1-2) */}
                  <path
                    d="M 0,360 L 0,220 Q 80,170 180,200 Q 280,230 380,180 L 380,360 Z"
                    fill="#08251a"
                    opacity="0.4"
                  />
                  {/* Red Rock Canyon Cliffs (State 3) */}
                  <path
                    d="M 370,360 L 370,160 L 420,130 L 460,170 L 510,120 L 580,190 L 580,360 Z"
                    fill="#1f140b"
                    opacity="0.35"
                  />
                  {/* Snow-Capped Alpine Mountain Peaks (State 3: IIT Dhanbad) */}
                  <path
                    d="M 500,360 L 550,80 L 610,210 L 650,110 L 720,240 L 720,360 Z"
                    fill="#0a2636"
                    opacity="0.4"
                  />
                  {/* Coastal Ocean Sea Baseline (State 4) */}
                  <path
                    d="M 700,360 L 700,230 Q 780,210 860,230 Q 940,250 1000,220 L 1000,360 Z"
                    fill="#06222b"
                    opacity="0.35"
                  />
                  {/* Golden Summit Ridges (State 5: Hackathons) */}
                  <path
                    d="M 920,360 L 960,100 L 1010,190 L 1060,120 L 1120,220 L 1120,360 Z"
                    fill="#241b07"
                    opacity="0.4"
                  />
                  {/* Terminus Terminal Arch Silhouette (State 6) */}
                  <path
                    d="M 1100,360 L 1100,160 Q 1150,130 1200,160 L 1200,360 Z"
                    fill="#140a08"
                    opacity="0.5"
                  />

                  {/* 3. Landscape Dual Steel Railway Track */}
                  {/* Track Ballast Bed */}
                  <path
                    d="M 50,240 C 180,180 260,280 390,235 C 500,190 540,140 650,240 C 760,300 840,160 970,160 C 1050,160 1100,240 1170,195"
                    fill="none"
                    stroke="#020a06"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Railroad Ties (Sleepers Simulation) */}
                  <path
                    d="M 50,240 C 180,180 260,280 390,235 C 500,190 540,140 650,240 C 760,300 840,160 970,160 C 1050,160 1100,240 1170,195"
                    fill="none"
                    stroke="#3f3f46"
                    strokeWidth="10"
                    strokeDasharray="3 7"
                  />
                  {/* Continuous Steel Rail Line */}
                  <path
                    d="M 50,240 C 180,180 260,280 390,235 C 500,190 540,140 650,240 C 760,300 840,160 970,160 C 1050,160 1100,240 1170,195"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    filter="url(#trackGlow)"
                  />

                  {/* 4. State Territory Vertical Division Guidelines */}
                  <line x1="120" y1="40" x2="120" y2="330" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />
                  <line x1="400" y1="40" x2="400" y2="330" stroke="#10b981" strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />
                  <line x1="600" y1="40" x2="600" y2="330" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />
                  <line x1="910" y1="40" x2="910" y2="330" stroke="#14b8a6" strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />
                  <line x1="1100" y1="40" x2="1100" y2="330" stroke="#eab308" strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />

                  {/* Territory Overhead Banners in Landscape Sky */}
                  <text x="70" y="32" fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STATE 1: ORIGIN</text>
                  <text x="260" y="32" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STATE 2: ACADEMICS</text>
                  <text x="500" y="32" fill="#7dd3fc" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STATE 3: AI RESEARCH</text>
                  <text x="760" y="32" fill="#2dd4bf" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STATE 4: PRODUCTION</text>
                  <text x="1005" y="32" fill="#fde047" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STATE 5: HONORS & TRAINING</text>
                  <text x="1145" y="32" fill="#fda4af" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">STATE 6: TERMINUS</text>

                  {/* 5. Station Waypoint Markers */}
                  {LANDSCAPE_WAYPOINTS.map((wp) => {
                    const isStationActive = wp.index === currentStationIndex;
                    const isStationSelected = wp.index === selectedStationIndex;
                    const isPast = wp.index < currentStationIndex;
                    const stateObj = getPortfolioStateForStation(wp.index);
                    const isHighlighted = isWaypointHighlighted(wp.index);

                    return (
                      <g
                        key={wp.index}
                        onClick={() => {
                          setSelectedStationIndex(wp.index);
                          goToStation(wp.index);
                        }}
                        opacity={isHighlighted ? 1 : 0.28}
                        className="cursor-pointer group transition-opacity duration-200"
                      >
                        {/* Recruiter Focus Target Pulse Ring */}
                        {recruiterFilter !== 'all' && isHighlighted && (
                          <circle
                            cx={wp.x}
                            cy={wp.y}
                            r="17"
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                            opacity="0.85"
                          />
                        )}

                        {/* Hover / Active Pulse Ring */}
                        {isStationActive && (
                          <circle
                            cx={wp.x}
                            cy={wp.y}
                            r="16"
                            fill="#f59e0b"
                            fillOpacity="0.25"
                            className=""
                          />
                        )}

                        {/* Station Milestone Circle Badge */}
                        <circle
                          cx={wp.x}
                          cy={wp.y}
                          r={isStationSelected ? '12' : '9'}
                          fill={isStationActive ? '#f59e0b' : isPast ? '#059669' : '#0f172a'}
                          stroke={isStationSelected ? '#ffffff' : stateObj.accentColor}
                          strokeWidth={isStationSelected ? '2.5' : '2'}
                          className="transition-all"
                        />

                        {/* Station Number inside Circle */}
                        <text
                          x={wp.x}
                          y={wp.y + 3.5}
                          textAnchor="middle"
                          fill={isStationActive || isPast ? '#020617' : '#f8fafc'}
                          fontSize={isStationSelected ? '9' : '8'}
                          fontWeight="900"
                          fontFamily="monospace"
                        >
                          {wp.stationNumber}
                        </text>

                        {/* Waypoint Label */}
                        <text
                          x={wp.x}
                          y={wp.y > 210 ? wp.y + 24 : wp.y - 18}
                          textAnchor="middle"
                          fill={isStationSelected ? '#ffffff' : '#e2e8f0'}
                          fontSize="9.5"
                          fontWeight={isStationSelected ? '800' : '600'}
                          fontFamily="sans-serif"
                        >
                          {wp.title}
                        </text>

                        {/* Sub-label Organization */}
                        <text
                          x={wp.x}
                          y={wp.y > 210 ? wp.y + 36 : wp.y - 6}
                          textAnchor="middle"
                          fill={stateObj.accentColor}
                          fontSize="8"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {wp.org}
                        </text>
                      </g>
                    );
                  })}

                  {/* 6. Active Train Locomotive on Landscape Track */}
                  <g transform={`translate(${currentWaypoint.x}, ${currentWaypoint.y - 12})`}>
                    {/* Steam Puffs */}
                    <circle cx="-12" cy="-8" r="4" fill="#ffffff" opacity="0.6" className="" />
                    <circle cx="-18" cy="-14" r="3" fill="#ffffff" opacity="0.4" />
                    {/* Train Locomotive Pin Badge */}
                    <rect x="-14" y="-22" width="28" height="15" rx="4" fill="#f59e0b" stroke="#000" strokeWidth="1.5" />
                    <text x="0" y="-12" textAnchor="middle" fontSize="9" fontWeight="900" fill="#000">
                      🚂
                    </text>
                  </g>
                </svg>

                {/* Landscape Map Compass & Biome Weather Watermark */}
                <div className="absolute bottom-2.5 left-4 flex items-center gap-2 text-[10px] font-mono text-emerald-300/80 bg-[#020a06]/85 px-3 py-1.5 rounded-xl border border-white/10">
                  <Compass className="h-3.5 w-3.5 text-amber-400" />
                  <span>CONTINUOUS RAIL PROFILE: SEA LEVEL (0m) ➔ ALPINE SUMMIT (2,400m)</span>
                </div>
              </div>
            </div>

            {/* Selected Station Inspector Strip in Landscape Layout */}
            <div className="rounded-2xl border-2 border-amber-400/40 bg-gradient-to-r from-[#061e14] via-[#092a1c] to-[#04160e] p-4.5 text-xs text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-amber-400 px-2.5 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-wider">
                    {selectedStationState.name}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-300 font-bold">
                    Station {selectedWaypoint.stationNumber} of 12 • {selectedStationData.type.toUpperCase()}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-400" />
                    {selectedStationData.period}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>{selectedStationData.title}</span>
                  <span className="text-amber-400 text-xs font-normal">({selectedStationData.organization})</span>
                </h4>

                <p className="text-slate-100 font-medium text-xs leading-relaxed line-clamp-2">
                  {selectedStationData.summary}
                </p>

                {/* Metrics Highlights */}
                {selectedStationData.metrics.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {selectedStationData.metrics.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="inline-flex items-center gap-1 rounded-md bg-[#020b07] px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-400/30"
                      >
                        <Award className="h-3 w-3 text-amber-400" />
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
                <button
                  onClick={() => {
                    goToStation(selectedStationIndex);
                    onClose();
                  }}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer"
                >
                  <Train className="h-4 w-4" />
                  <span>Steam to Station {selectedWaypoint.stationNumber}</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-slate-300 font-mono border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>Click any platform marker on the landscape track to inspect and board.</span>
              </span>
              <a
                href="https://github.com/ravidaliparthy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Verified with github.com/ravidaliparthy</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
