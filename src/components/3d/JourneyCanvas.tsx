import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { TrackSystem } from './TrackSystem';
import { TerrainSystem } from './TerrainSystem';
import { TrainRig } from './TrainRig';
import { EnvironmentRig } from './EnvironmentRig';
import { PostProcessingRig } from './PostProcessingRig';
import { WaterSystem } from './WaterSystem';
import { FoliageSystem } from './FoliageSystem';
import { TunnelAndMistSystem } from './TunnelAndMistSystem';
import { StationLandmarks } from './StationLandmarks';
import { BiomeParticles } from './BiomeParticles';
import { LivingDetails } from './LivingDetails';
import { PerfSampler } from './PerfSampler';
import { useJourneyStore } from '../../stores/useJourneyStore';

export const JourneyCanvas: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);
  const setTier = useJourneyStore((s) => s.setTier);
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [dprTarget, setDprTarget] = useState(1.5);

  const deviceDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const currentDpr = Math.max(1.0, Math.min(deviceDpr, dprTarget, 1.5));

  useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('[WebGL] Context lost. Recovering hardware context automatically.');
      setContextLost(true);
    };

    const handleContextRestored = () => {
      console.info('[WebGL] Hardware context restored successfully.');
      setContextLost(false);
      setCanvasKey((k) => k + 1);
    };

    window.addEventListener('webglcontextlost', handleContextLost, false);
    window.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      window.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  return (
    <div id="canvas-container" className="absolute inset-0 h-full w-full overflow-hidden bg-[#0c0e14]">
      {contextLost && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-amber-500/90 px-4 py-1.5 text-xs font-mono font-bold text-slate-950 shadow-lg">
          Restoring 3D Graphics Hardware Context...
        </div>
      )}
      <Canvas
        key={canvasKey}
        camera={{ position: [0, 5, -10], fov: 45, near: 0.1, far: 2400 }}
        dpr={currentDpr}
        gl={{
          antialias: tier !== 'low',
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
          alpha: false,
        }}
        onCreated={({ gl, scene, camera }) => {
          (window as any).__THREE_SCENE__ = scene;
          const domEl = gl.domElement;
          const onLost = (e: Event) => {
            e.preventDefault();
            console.warn('[WebGL] Canvas context lost.');
            setContextLost(true);
          };
          const onRestored = () => {
            console.info('[WebGL] Canvas context restored.');
            setContextLost(false);
          };
          domEl.addEventListener('webglcontextlost', onLost, false);
          domEl.addEventListener('webglcontextrestored', onRestored, false);

          // Step 4: Upfront asynchronous shader and material compilation to prevent first-arrival hitches
          try {
            if ('compileAsync' in gl) {
              (gl as any).compileAsync(scene, camera).catch(() => {});
            } else if ('compile' in gl) {
              (gl as any).compile(scene, camera);
            }
          } catch {
            // Non-blocking fallback
          }
        }}
        shadows={tier === 'high'}
      >
        <PerformanceMonitor
          onDecline={() => {
            setDprTarget((prev) => Math.max(1.0, prev - 0.25));
            if (tier === 'high') setTier('mid');
            else if (tier === 'mid') setTier('low');
          }}
          onIncline={() => {
            if (tier === 'low') setTier('mid');
          }}
        />

        <Suspense fallback={null}>
          <EnvironmentRig />
          <TerrainSystem />
          <TrackSystem />
          <FoliageSystem />
          <WaterSystem />
          <TunnelAndMistSystem />
          <StationLandmarks />
          <LivingDetails />
          <TrainRig />
          <BiomeParticles />
          <PostProcessingRig />
          <PerfSampler />
        </Suspense>
      </Canvas>
    </div>
  );
};
