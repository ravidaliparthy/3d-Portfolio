import React, { useState } from 'react';
import { useJourneyStore, type PanelHeight } from '../../stores/useJourneyStore';
import { useViewport } from '../../hooks/useViewport';
import { getSkillById } from '../../data';
import { getPortfolioStateForStation } from './TerritoryRoadmap';
import { isDebugDisabled } from '../../utils/debugSwitches';
import {
  ExternalLink,
  HelpCircle,
  Award,
  Calendar,
  MapPin,
  Ticket as TicketIcon,
  ChevronRight,
  Share2,
  Check,
  Globe,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Building2,
  Eye,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { portfolioData } from '../../data';

export const StationDesktopPanel: React.FC = React.memo(() => {
  const activeStation = useJourneyStore((s) => s.activeStation);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);
  const navigatingTargetIndex = useJourneyStore((s) => s.navigatingTargetIndex);
  const stations = useJourneyStore((s) => s.stations);
  const nextStation = useJourneyStore((s) => s.nextStation);
  const prevStation = useJourneyStore((s) => s.prevStation);
  const activePanel = useJourneyStore((s) => s.activePanel);
  const setActivePanel = useJourneyStore((s) => s.setActivePanel);
  const panelHeight = useJourneyStore((s) => s.panelHeight);
  const setPanelHeight = useJourneyStore((s) => s.setPanelHeight);
  const setPassModalOpen = useJourneyStore((s) => s.setPassModalOpen);
  const setRoadmapOpen = useJourneyStore((s) => s.setRoadmapOpen);
  const cameraPreset = useJourneyStore((s) => s.cameraPreset);
  const { isMobile, isPortrait } = useViewport();

  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'qa' | 'ticket'>('overview');
  const [copied, setCopied] = useState(false);

  // Sync tab with store activePanel
  React.useEffect(() => {
    if (activePanel === 'qa') setActiveTab('qa');
    else if (activePanel === 'ticket') setActiveTab('ticket');
    else if (activePanel === 'station') setActiveTab('overview');
  }, [activePanel]);

  if (!activeStation || panelHeight === 'closed') return null;

  const hasChallenges = Boolean(activeStation.challenges && activeStation.challenges.length > 0);
  const liveLink = activeStation.links.find((l) => l.type === 'live' || l.label.toLowerCase().includes('live'));

  const matchingStory = (portfolioData.story || []).find((s) => {
    if (s.linkedStationId === activeStation.id) return true;
    if (activeStation.id === 'station-05-drone-rooftop' && s.id.includes('rooftop')) return true;
    if (activeStation.id === 'station-06-iit-dhanbad-paper' && s.id.includes('seismic')) return true;
    if (activeStation.id === 'station-07-expense-tracker' && s.id.includes('expense')) return true;
    if (activeStation.id === 'station-10-hackathon-finalist' && s.id.includes('svamitva')) return true;
    return false;
  });
  const currentState = getPortfolioStateForStation(currentStationIndex);

  const handleShareTicket = () => {
    const url = `${window.location.origin}/#${activeStation.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Station ${currentStationIndex + 1} of ${stations.length}: ${activeStation.title}`,
        text: `Inspect Daliparthy Ravi Krishna Charan's verified milestone: ${activeStation.title}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine height based on peek / half / full
  const heightClass =
    panelHeight === 'peek'
      ? 'h-[160px]'
      : panelHeight === 'full'
      ? 'h-[calc(100dvh-100px)]'
      : cameraPreset === 'cab'
      ? 'h-[52dvh] min-h-[400px] max-h-[540px]'
      : 'h-[62dvh] min-h-[460px] max-h-[640px]';

  // Responsive layout: Mobile portrait handled by StationMobileSheet
  if (isMobile && isPortrait) return null;

  const isGlassOff = isDebugDisabled('glass');

  return (
    <aside
      data-no-drag="true"
      className={`pointer-events-auto fixed left-4 sm:left-6 top-[68px] z-20 flex w-[380px] sm:w-[410px] md:w-[420px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border-2 border-amber-400/60 ${isGlassOff ? 'bg-[#04180f]' : 'bg-[#04180f]/88 backdrop-blur-md'} text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-[height] duration-300 ease-out ${heightClass}`}
      aria-label={`Milestone Details: ${activeStation.title}`}
    >
      {/* Header - Perfectly Aligned, Uncongested Structure */}
      <div className="border-b border-amber-400/30 p-3.5 sm:p-4 bg-[#04180f]/80 shrink-0 space-y-2.5">
        
        {/* Row 1: State/Station Badge (Left) + Viewport Height Switcher (Right) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setRoadmapOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-sm hover:from-amber-300 hover:to-amber-400 transition-colors cursor-pointer group shrink-0"
              title="Open 6-State Landscape Roadmap"
            >
              <span>{currentState.shortName}</span>
              <span className="text-slate-950/40">•</span>
              <span>STN {currentStationIndex + 1}/{stations.length}</span>
            </button>

            {navigatingTargetIndex !== null ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/90 border border-amber-400/80 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 animate-pulse shadow-sm">
                <span>Traveling to STN {navigatingTargetIndex + 1}...</span>
              </span>
            ) : currentStationIndex < stations.length - 1 ? (
              <button
                onClick={nextStation}
                className="flex items-center gap-1 rounded-full border border-amber-400/60 bg-[#0a2419] hover:bg-amber-400 hover:text-slate-950 px-2.5 py-0.5 text-[10px] font-mono font-black text-amber-300 transition-all cursor-pointer shadow-xs"
                title="Advance directly to Next Station"
              >
                <span>Next →</span>
              </button>
            ) : (
              <button
                onClick={() => useJourneyStore.getState().setPhase('terminus')}
                className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-2.5 py-0.5 text-[10px] font-mono font-black text-slate-950 transition-all cursor-pointer shadow-xs"
                title="Open Terminus Outro Board"
              >
                <span>Terminus 🏁</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Milestone Deep Link Share Button */}
            <button
              onClick={handleShareTicket}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-amber-400/40 bg-[#0a2419] text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-colors cursor-pointer"
              title={copied ? 'Link Copied!' : 'Copy deep link to this station'}
              aria-label="Share station deep link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            </button>

            {/* Height Switcher Pill: Peek / Half / Full */}
            <div className="flex items-center rounded-lg border border-amber-400/40 bg-[#0a2419] p-0.5 shadow-inner shrink-0">
              {(['peek', 'half', 'full'] as PanelHeight[]).map((h) => (
                <button
                  key={h}
                  onClick={() => setPanelHeight(h)}
                  className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded transition-colors cursor-pointer shrink-0 ${
                    panelHeight === h
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-amber-300/80 hover:text-white'
                  }`}
                  title={`Set panel height to ${h}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Station Action Bar */}
        <button
          onClick={() => {
            useJourneyStore.getState().setCameraPreset('station');
            setPanelHeight('peek');
          }}
          className="w-full flex items-center justify-between rounded-xl border border-amber-400/50 bg-[#0a2419] hover:bg-[#0f3424] hover:border-amber-400 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-sm transition-all cursor-pointer group"
          title="Hides the train and positions camera to explore the station platform, flowers, lamps, and landmark architecture"
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-mono">View Station Platform</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 bg-amber-400/15 px-2 py-0.5 rounded border border-amber-400/30 whitespace-nowrap">
            Hide Train & Orbit 3D
          </span>
        </button>

        {/* Milestone Title & Metadata Details */}
        <div>
          <h2 className="text-base sm:text-lg font-black leading-snug text-white tracking-tight drop-shadow-sm truncate">
            {activeStation.title}
          </h2>

          {/* Metadata Details Strip (Organization, Location, Date) */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-300 font-semibold">
            <div className="flex items-center gap-1 text-emerald-300 font-bold truncate">
              <Building2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{activeStation.organization}</span>
            </div>
            <span className="text-amber-400/60">•</span>
            <div className="flex items-center gap-1 text-slate-200 truncate">
              <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>{activeStation.location}</span>
            </div>
            <span className="text-amber-400/60">•</span>
            <div className="flex items-center gap-1 text-amber-300 font-mono font-bold shrink-0">
              <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>{activeStation.period}</span>
            </div>
          </div>
        </div>

        {/* Optional Live System Button */}
        {panelHeight !== 'peek' && liveLink && (
          <div>
            <a
              href={liveLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Visit Live Deployed System</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* Linked In-Depth Story & Hard Tradeoffs */}
        {panelHeight !== 'peek' && matchingStory && (
          <div>
            <button
              onClick={() => useJourneyStore.getState().setStoryModalOpen(true, matchingStory.id)}
              className="inline-flex w-full items-center justify-between rounded-xl border border-amber-400/60 bg-gradient-to-r from-[#072418] to-[#0a3322] px-3.5 py-2 text-xs font-bold text-amber-300 shadow-sm hover:border-amber-300 hover:text-white transition-all cursor-pointer group"
              title="Read the deep engineering case study, trade-offs, and algorithms behind this project"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">Story & Tradeoffs: {matchingStory.headline}</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            </button>
          </div>
        )}

        {/* Tab Navigation Switcher */}
        {panelHeight !== 'peek' && (
          <div className="flex rounded-xl bg-[#0a2419] p-1 border border-amber-400/30 gap-1">
            <button
              onClick={() => {
                setActiveTab('overview');
                setActivePanel('station');
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all text-center ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-amber-200/80 hover:text-white'
              }`}
            >
              Overview
            </button>
            {hasChallenges && (
              <button
                onClick={() => setActiveTab('challenges')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'challenges'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-amber-300 hover:text-white bg-amber-400/10'
                }`}
                title="Inspect real engineering difficulties, tradeoffs & decisions"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Tradeoffs ({activeStation.challenges?.length})</span>
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('qa');
                setActivePanel('qa');
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'qa'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-amber-200/80 hover:text-white'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Q&A</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ticket');
                setActivePanel('ticket');
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ticket'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-amber-200/80 hover:text-white'
              }`}
            >
              <TicketIcon className="h-3.5 w-3.5" />
              <span>Ticket</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content Area with Fluid, Runny Native Scrolling */}
      {panelHeight !== 'peek' && (
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 text-xs text-slate-100">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <p className="leading-relaxed text-slate-200 font-normal text-[13px]">
                {activeStation.summary}
              </p>

              {/* Verified Metrics Cards: Spacious, Unified Background */}
              {activeStation.metrics.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                  {activeStation.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-[#0a2419] p-3 text-xs font-mono text-amber-300 font-bold shadow-xs leading-snug"
                    >
                      <Award className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Accomplishments */}
              <div className="pt-1">
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Key Accomplishments
                </h3>
                <ul className="space-y-2 leading-relaxed">
                  {activeStation.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-200 text-xs">
                      <ChevronRight className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Stack */}
              <div className="pt-1">
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Technical Stack
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeStation.skillIds.map((skillId) => {
                    const skill = getSkillById(skillId);
                    return (
                      <span
                        key={skillId}
                        className="rounded-lg border border-emerald-500/30 bg-[#0a2419] px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-300 shadow-xs"
                      >
                        {skill?.name || skillId}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHALLENGES & TRADEOFFS */}
          {activeTab === 'challenges' && hasChallenges && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-amber-400/40 bg-[#0a2419] p-3 text-[11px] text-amber-200 font-semibold leading-relaxed">
                <span className="font-black text-amber-300">Engineering Realities:</span> Real technical hurdles, constraints, and architecture trade-offs encountered while building this system.
              </div>

              {activeStation.challenges?.map((ch, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-emerald-500/30 bg-[#0a2419] p-3.5 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-xs">
                        {ch.title}
                      </h4>
                      <p className="mt-1 text-slate-200 leading-relaxed font-normal">
                        {ch.theObstacle}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#061a12] border border-emerald-500/30 p-2.5 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Architecture Decision & Resolution</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-normal">
                      {ch.decisionAndTradeoff}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-emerald-900/60">
                    <span className="text-slate-300 font-mono">Outcome:</span>
                    <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      {ch.outcomeMetric}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: RECRUITER Q&A */}
          {activeTab === 'qa' && (
            <div className="space-y-3.5">
              {activeStation.qa.map((qa, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-emerald-500/30 bg-[#0a2419] p-3.5 shadow-xs space-y-2"
                >
                  <h4 className="font-black text-white text-xs flex items-start gap-2 leading-snug">
                    <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{qa.question}</span>
                  </h4>
                  <p className="text-slate-200 leading-relaxed font-normal pl-6 text-[11px]">
                    {qa.answer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SOUVENIR TICKET */}
          {activeTab === 'ticket' && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-amber-400/40 bg-[#0a2419] p-4 text-center space-y-2.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                  Official Transit Record
                </span>
                <div className="text-base font-black text-white">
                  STATION {currentStationIndex + 1} OF {stations.length}
                </div>
                <div className="text-xs text-emerald-300 font-bold">
                  {activeStation.organization}
                </div>
                <button
                  onClick={() => setPassModalOpen(true)}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-xs font-black text-slate-950 hover:from-amber-300 hover:to-amber-400 shadow-sm transition-colors cursor-pointer"
                >
                  Generate High-Res Boarding Pass (1200×580)
                </button>
              </div>

              <button
                onClick={handleShareTicket}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-[#0a2419] py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                <span>{copied ? 'Link Copied to Clipboard!' : 'Share Milestone Deep Link'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sticky Prev/Next Station Footer */}
      {panelHeight !== 'peek' && (
        <div className="border-t border-amber-400/30 p-3 sm:px-4 flex items-center justify-between gap-2 bg-[#04180f]/80 shrink-0">
          <button
            onClick={prevStation}
            disabled={currentStationIndex === 0}
            className="rounded-xl border border-amber-400/40 bg-[#0a2419] px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shrink-0"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-amber-300 font-black tracking-wider whitespace-nowrap text-center">
            STATION {currentStationIndex + 1} OF {stations.length}
          </span>
          {currentStationIndex < stations.length - 1 ? (
            <button
              onClick={nextStation}
              className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:from-amber-300 hover:to-amber-400 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Proceed to Next Station"
            >
              <span className="whitespace-nowrap">Next Station</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => useJourneyStore.getState().setPhase('terminus')}
              className="rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:from-amber-300 hover:to-amber-400 transition-all shadow-md cursor-pointer flex items-center gap-1 shrink-0"
              title="Open Terminus Concourse & Contact Gate"
            >
              <span className="whitespace-nowrap">Terminus Board</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
});
