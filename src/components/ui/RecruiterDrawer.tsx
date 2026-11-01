import React from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { portfolioData } from '../../data';
import {
  X,
  Mail,
  Linkedin,
  Github,
  Code2,
  Send,
  FileText,
} from 'lucide-react';

export const RecruiterDrawer: React.FC = () => {
  const isRecruiterDrawerOpen = useJourneyStore((s) => s.isRecruiterDrawerOpen);
  const setRecruiterDrawerOpen = useJourneyStore((s) => s.setRecruiterDrawerOpen);
  const goToStation = useJourneyStore((s) => s.goToStation);
  const setContactModalOpen = useJourneyStore((s) => s.setContactModalOpen);

  if (!isRecruiterDrawerOpen) return null;

  const { owner, stations, skills, howBuilt } = portfolioData;

  const handleStationJump = (idx: number) => {
    goToStation(idx);
    setRecruiterDrawerOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto flex justify-end bg-black/95 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Executive Portfolio Summary"
    >
        <div
          className="flex h-full w-full max-w-2xl flex-col bg-[#020b06] border-l-2 border-amber-400/40 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6 bg-[#04140b]">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{owner.name}</h2>
              <p className="text-xs font-mono text-amber-400">{owner.title}</p>
            </div>
            <button
              onClick={() => setRecruiterDrawerOpen(false)}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close summary drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Summary Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 text-sm text-slate-100">
            {/* Executive Contact & Resume Bar */}
            <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 space-y-3 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Direct Contact & Dossier
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setContactModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-300 cursor-pointer shadow-sm"
                  >
                    <Send className="h-3 w-3" />
                    <span>Send Message</span>
                  </button>
                  <a
                    href="/Daliparthy_Ravi_Krishna_Charan_Resume.pdf"
                    download="Daliparthy_Ravi_Krishna_Charan_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-300 shadow-sm"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Download Resume PDF</span>
                  </a>
                  <a
                    href={owner.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#062014] border border-amber-400/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-[#0a301e] shadow-sm"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>GitHub Repositories</span>
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-medium">
                <a
                  href={`mailto:${owner.email}`}
                  className="flex items-center gap-1.5 text-white hover:text-amber-300"
                >
                  <Mail className="h-3.5 w-3.5 text-amber-400" />
                  <span>{owner.email}</span>
                </a>
                <a
                  href={owner.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white hover:text-amber-300"
                >
                  <Linkedin className="h-3.5 w-3.5 text-sky-400" />
                  <span>LinkedIn Profile</span>
                </a>
                <a
                  href={owner.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white hover:text-amber-300"
                >
                  <Github className="h-3.5 w-3.5 text-amber-300" />
                  <span>github.com/ravidaliparthy</span>
                </a>
              </div>
            </div>

            {/* Quick Station Navigation */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Chronological Milestones (Click to Jump In-World)
              </h3>
              <div className="space-y-2">
                {stations.map((stn, idx) => (
                  <div
                    key={stn.id}
                    onClick={() => handleStationJump(idx)}
                    className="group flex cursor-pointer items-start justify-between rounded-xl border border-white/10 bg-[#061e14] p-3.5 transition-all hover:border-amber-400/50 hover:bg-[#092a1d] shadow-sm"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-amber-500/25 border border-amber-400/40 px-2 py-0.5 text-[10px] font-mono font-black text-amber-300">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          {stn.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 line-clamp-1">{stn.summary}</p>
                    </div>
                    <span className="text-[11px] font-mono text-amber-200 font-bold shrink-0 mt-0.5">
                      {stn.period}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehensive Skills Matrix */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Technical Competencies & Verified Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-lg border border-emerald-500/40 bg-[#062017] px-3 py-1.5 text-xs font-mono font-semibold text-emerald-200 shadow-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* How This Was Built Block */}
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Code2 className="h-4 w-4" />
                <span>HOW THIS PORTFOLIO WAS BUILT</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {howBuilt.stackSummary}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {howBuilt.architectureNotes}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};
