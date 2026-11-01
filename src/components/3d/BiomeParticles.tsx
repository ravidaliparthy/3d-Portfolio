import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { journeyCurveManager } from './JourneyCurve';
import { getDebugSwitch, isDebugDisabled } from '../../utils/debugSwitches';

function getParticleCircleTexture(): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.7)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const BiomeParticles: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);
  const isOff = isDebugDisabled('particles');
  const isLegacy = getDebugSwitch('particles') === 'legacy';
  const pointsRef = useRef<THREE.Points>(null);
  const circleMap = useMemo(() => (isLegacy ? null : getParticleCircleTexture()), [isLegacy]);

  if (isOff) return null;

  const particleCount = tier === 'low' ? 60 : tier === 'mid' ? 140 : 240;

  const [positions, initialY] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const origY = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 44;
      pos[i * 3 + 1] = Math.random() * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 44;
      origY[i] = pos[i * 3 + 1];
    }

    return [pos, origY];
  }, [particleCount]);

  // Pre-calculate track station biome anchors for continuous particle color blending
  const biomeAnchors = useMemo(() => {
    const BIOME_COLORS: Record<string, string> = {
      snow: '#f8fafc',       // Crisp falling snow flurries
      mountains: '#e2e8f0',  // Alpine mountain mist
      forest: '#fef08a',     // Glowing fireflies
      canyon: '#f59e0b',     // Desert sand dust
      coast: '#7dd3fc',      // Sea spray mist
      viaduct: '#f1f5f9',    // High-altitude atmospheric mist
      meadows: '#f1f5f9',    // Morning atmospheric pollen
    };
    return (useJourneyStore.getState().stations || []).map((stn, idx) => ({
      t: journeyCurveManager.getStationT(idx),
      color: new THREE.Color(BIOME_COLORS[stn.biome] || '#f1f5f9'),
      biome: stn.biome,
    }));
  }, []);

  const curColor = useRef(new THREE.Color('#f1f5f9'));
  const targetCol = useRef(new THREE.Color('#f1f5f9'));

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current) return;
    const time = clock.getElapsedTime();
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const array = posAttr.array as Float32Array;

    // Smooth continuous color transition
    const p = THREE.MathUtils.clamp(useJourneyStore.getState().progress, 0, 1);
    const activeStn = useJourneyStore.getState().activeStation;

    if (biomeAnchors.length > 1) {
      let idx0 = 0;
      let idx1 = 1;
      for (let i = 0; i < biomeAnchors.length - 1; i++) {
        if (p >= biomeAnchors[i].t && p <= biomeAnchors[i + 1].t) {
          idx0 = i;
          idx1 = i + 1;
          break;
        }
      }
      const b0 = biomeAnchors[idx0];
      const b1 = biomeAnchors[idx1];
      const span = Math.max(0.0001, b1.t - b0.t);
      const alpha = THREE.MathUtils.clamp((p - b0.t) / span, 0, 1);
      targetCol.current.copy(b0.color).lerp(b1.color, alpha);
    }

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    if (mat) {
      curColor.current.lerp(targetCol.current, delta * 3.5);
      mat.color.copy(curColor.current);
    }

    // Follow train position
    const trainPt = journeyCurveManager.getPointAt(p);
    pointsRef.current.position.set(trainPt.x, trainPt.y, trainPt.z);

    const curBiome = activeStn?.biome || 'meadows';
    for (let i = 0; i < particleCount; i++) {
      if (curBiome === 'snow') {
        // High alpine snowfall: steady downward swirl with gentle lateral wind drift
        array[i * 3 + 1] -= 0.12;
        if (array[i * 3 + 1] < 0) array[i * 3 + 1] = 18;
        array[i * 3] += Math.sin(time * 1.8 + i) * 0.04 - 0.015;
        array[i * 3 + 2] += Math.cos(time * 1.4 + i) * 0.03;
      } else if (curBiome === 'mountains') {
        // Alpine mist
        array[i * 3 + 1] -= 0.07;
        if (array[i * 3 + 1] < 0) array[i * 3 + 1] = 18;
        array[i * 3] += Math.sin(time + i) * 0.02;
      } else if (curBiome === 'canyon') {
        // Blowing desert sand dust
        array[i * 3] += 0.08;
        if (array[i * 3] > 22) array[i * 3] = -22;
        array[i * 3 + 1] = initialY[i] + Math.sin(time * 2.0 + i) * 0.4;
      } else if (curBiome === 'forest') {
        // Floating evening fireflies
        array[i * 3 + 1] = initialY[i] + Math.sin(time * 1.2 + i * 0.5) * 0.6;
        array[i * 3] += Math.sin(time * 0.8 + i) * 0.015;
        array[i * 3 + 2] += Math.cos(time * 0.9 + i) * 0.015;
      } else if (curBiome === 'coast') {
        // Sea spray rising
        array[i * 3 + 1] += 0.04;
        if (array[i * 3 + 1] > 18) array[i * 3 + 1] = 0;
        array[i * 3] += Math.sin(time + i) * 0.02;
      } else {
        // Gentle meadow pollen
        array[i * 3 + 1] = initialY[i] + Math.sin(time * 0.7 + i) * 0.25;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={tier === 'low' ? 0.32 : 0.52}
        map={circleMap}
        color="#f1f5f9"
        transparent
        opacity={tier === 'low' ? 0.55 : 0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
