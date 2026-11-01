import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useJourneyStore } from '../../stores/useJourneyStore';

export const PerfSampler: React.FC = () => {
  const { gl, scene } = useThree();
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);
  const lastStationRef = useRef(currentStationIndex);

  const frameTimes = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());
  const maxHitchRef = useRef(16.6);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__THREE_SCENE__ = scene;
    }
    // Prevent Three.js from wiping draw call counters before we can sample them
    gl.info.autoReset = false;
    return () => {
      gl.info.autoReset = true;
    };
  }, [gl]);

  useFrame(() => {
    const now = performance.now();
    const frameTime = Math.max(1, now - lastTimeRef.current);
    lastTimeRef.current = now;

    // Track frame times for rolling FPS
    frameTimes.current.push(frameTime);
    if (frameTimes.current.length > 20) {
      frameTimes.current.shift();
    }

    const avgFrameTime =
      frameTimes.current.reduce((a, b) => a + b, 0) / (frameTimes.current.length || 1);
    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 60;

    // First arrival hitch detection when reaching new station
    if (currentStationIndex !== lastStationRef.current) {
      lastStationRef.current = currentStationIndex;
      if (frameTime > maxHitchRef.current) {
        maxHitchRef.current = frameTime;
      }
    }

    // Sample the render calls from the last render pass
    const currentCalls = gl.info.render.calls;
    const currentTriangles = gl.info.render.triangles;
    const currentTextures = gl.info.memory.textures;
    const currentGeometries = gl.info.memory.geometries;

    // Reset counters for the upcoming frame render
    gl.info.reset();

    if (typeof window !== 'undefined') {
      window.__THREE_PERF__ = {
        calls: currentCalls,
        triangles: currentTriangles,
        textures: currentTextures,
        geometries: currentGeometries,
        fps,
        frameTimeMs: frameTime,
        maxHitchMs: maxHitchRef.current,
      };
    }
  });

  return null;
};
