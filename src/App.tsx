import React, { useEffect, useState } from 'react';
import { JourneyCanvas } from './components/3d/JourneyCanvas';
import { NavigationOverlay } from './components/ui/NavigationOverlay';
import { PerfOverlay } from './components/ui/PerfOverlay';
import { portfolioData } from './data';
import { useJourneyStore } from './stores/useJourneyStore';

export const App: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__JOURNEY_STORE__ = useJourneyStore;
    }
  }, []);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      setHasWebGL(gl);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // If user agent doesn't support WebGL, render high-speed accessible fallback view directly
  if (!hasWebGL) {
    return (
      <div className="h-full w-full overflow-y-auto bg-slate-950 p-6 text-slate-100">
        <header className="mb-8 border-b border-white/10 pb-4">
          <h1 className="text-3xl font-bold">{portfolioData.owner.name}</h1>
          <p className="text-amber-400 font-mono text-sm">{portfolioData.owner.title}</p>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">{portfolioData.owner.bioSummary}</p>
        </header>
        <div className="space-y-6 max-w-3xl">
          {portfolioData.stations.map((stn, idx) => (
            <div key={stn.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <span className="text-xs font-mono text-amber-400">Station {idx + 1} • {stn.period}</span>
              <h2 className="text-lg font-bold text-white mt-1">{stn.title}</h2>
              <p className="text-xs text-slate-400">{stn.organization} • {stn.location}</p>
              <p className="mt-2 text-sm text-slate-200">{stn.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {stn.metrics.map((m, i) => (
                  <span key={i} className="rounded bg-amber-500/10 px-2 py-1 text-xs font-mono text-amber-300 border border-amber-500/20">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c0e14]">
      {/* 3D WebGL Canvas Layer */}
      <JourneyCanvas />

      {/* 2D Interactive HUD & Overlay Layer */}
      <NavigationOverlay />

      {/* ?perf=1 Live Telemetry Overlay */}
      <PerfOverlay />
    </div>
  );
};
