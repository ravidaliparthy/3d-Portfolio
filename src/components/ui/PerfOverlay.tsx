import React, { useEffect, useState } from 'react';
import { useJourneyStore } from '../../stores/useJourneyStore';

declare global {
  interface Window {
    __THREE_PERF__?: {
      calls: number;
      triangles: number;
      textures: number;
      geometries: number;
      fps: number;
      frameTimeMs: number;
      maxHitchMs: number;
      lastHitchStation?: string;
    };
  }
}

export const PerfOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState({
    fps: 60,
    frameTimeMs: 16.6,
    maxHitchMs: 16.6,
    calls: 0,
    triangles: 0,
    textures: 0,
    geometries: 0,
    heapMb: 0,
    dpr: 1,
  });

  const tier = useJourneyStore((s) => s.tier);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);

  useEffect(() => {
    const isPerf =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('perf') === '1';
    setVisible(isPerf);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      const p = window.__THREE_PERF__ || {
        calls: 0,
        triangles: 0,
        textures: 0,
        geometries: 0,
        fps: 0,
        frameTimeMs: 0,
        maxHitchMs: 0,
      };

      const heap =
        (window.performance as any)?.memory?.usedJSHeapSize
          ? Math.round((window.performance as any).memory.usedJSHeapSize / (1024 * 1024))
          : 0;

      setStats({
        fps: Math.round(p.fps || 0),
        frameTimeMs: Math.round((p.frameTimeMs || 0) * 10) / 10,
        maxHitchMs: Math.round((p.maxHitchMs || 0) * 10) / 10,
        calls: p.calls || 0,
        triangles: p.triangles || 0,
        textures: p.textures || 0,
        geometries: p.geometries || 0,
        heapMb: heap,
        dpr: Math.round((window.devicePixelRatio || 1) * 100) / 100,
      });
    }, 250);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{ contain: 'layout paint' }}
      className="pointer-events-none fixed top-16 right-4 z-50 rounded-xl border border-amber-400/80 bg-slate-950/90 px-3.5 py-2.5 font-mono text-xs text-amber-300 shadow-2xl"
    >
      <div className="flex items-center justify-between gap-4 border-b border-amber-400/30 pb-1.5 mb-1.5">
        <span className="font-black text-white">?perf=1 ENGINE TELEMETRY</span>
        <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
          TIER: {tier} • DPR: {stats.dpr}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <div>
          <span className="text-slate-400">FPS: </span>
          <span
            className={`font-black ${
              stats.fps >= 55 ? 'text-emerald-400' : stats.fps >= 30 ? 'text-yellow-400' : 'text-red-400'
            }`}
          >
            {stats.fps}
          </span>
        </div>

        <div>
          <span className="text-slate-400">Frame: </span>
          <span className="font-bold text-white">{stats.frameTimeMs} ms</span>
        </div>

        <div>
          <span className="text-slate-400">Max Hitch: </span>
          <span
            className={`font-bold ${
              stats.maxHitchMs <= 33 ? 'text-emerald-400' : stats.maxHitchMs <= 50 ? 'text-yellow-400' : 'text-rose-400'
            }`}
          >
            {stats.maxHitchMs} ms
          </span>
        </div>

        <div>
          <span className="text-slate-400">Station: </span>
          <span className="font-bold text-amber-200">#{currentStationIndex + 1} / 12</span>
        </div>

        <div className="col-span-2 border-t border-slate-800 pt-1 mt-0.5 grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <span className="text-slate-400">Draw Calls: </span>
            <span
              className={`font-bold ${
                stats.calls <= 100 ? 'text-emerald-400' : stats.calls <= 150 ? 'text-yellow-400' : 'text-rose-400'
              }`}
            >
              {stats.calls}
            </span>
          </div>

          <div>
            <span className="text-slate-400">Triangles: </span>
            <span className="font-bold text-slate-200">{stats.triangles.toLocaleString()}</span>
          </div>

          <div>
            <span className="text-slate-400">Textures: </span>
            <span className="font-bold text-slate-200">{stats.textures}</span>
          </div>

          <div>
            <span className="text-slate-400">JS Heap: </span>
            <span className="font-bold text-slate-200">{stats.heapMb ? `${stats.heapMb} MB` : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
