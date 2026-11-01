import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { journeyCurveManager } from './JourneyCurve';
import { portfolioData, type Mood } from '../../data';

interface MoodLightingConfig {
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  skyColor: string;
  groundColor: string;
  hemiIntensity: number;
  fogColor: string;
  fogDensity: number;
  turbidity: number;
  rayleigh: number;
}

const MOOD_PRESETS: Record<Mood, MoodLightingConfig> = {
  dawn: {
    sunColor: '#f97316',
    sunIntensity: 1.4,
    sunPosition: [80, 35, -60],
    skyColor: '#1e1b4b',
    groundColor: '#08140e',
    hemiIntensity: 0.55,
    fogColor: '#0b1120',
    fogDensity: 0.0014,
    turbidity: 5,
    rayleigh: 2.5,
  },
  day: {
    sunColor: '#fffbeb',
    sunIntensity: 1.6,
    sunPosition: [60, 85, 40],
    skyColor: '#0284c7',
    groundColor: '#061a12',
    hemiIntensity: 0.65,
    fogColor: '#0c2130',
    fogDensity: 0.0012,
    turbidity: 2,
    rayleigh: 1.1,
  },
  golden: {
    sunColor: '#fbbf24',
    sunIntensity: 1.7,
    sunPosition: [90, 38, 70],
    skyColor: '#1e3a8a',
    groundColor: '#0f172a',
    hemiIntensity: 0.6,
    fogColor: '#131428',
    fogDensity: 0.0015,
    turbidity: 3.5,
    rayleigh: 2.0,
  },
  dusk: {
    sunColor: '#e11d48',
    sunIntensity: 1.3,
    sunPosition: [90, 22, 90],
    skyColor: '#311042',
    groundColor: '#050912',
    hemiIntensity: 0.45,
    fogColor: '#120520',
    fogDensity: 0.0018,
    turbidity: 6,
    rayleigh: 4,
  },
  night: {
    sunColor: '#38bdf8',
    sunIntensity: 0.45,
    sunPosition: [-40, 70, -40],
    skyColor: '#020617',
    groundColor: '#01040a',
    hemiIntensity: 0.28,
    fogColor: '#020617',
    fogDensity: 0.0024,
    turbidity: 1,
    rayleigh: 0.2,
  },
};

export const EnvironmentRig: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);
  const { scene } = useThree();

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const skyRef = useRef<any>(null);
  const starsGroupRef = useRef<THREE.Group>(null);

  // Cached Three.js objects for continuous zero-allocation interpolation
  const cSunA = useRef(new THREE.Color());
  const cSunB = useRef(new THREE.Color());
  const curSunColor = useRef(new THREE.Color());

  const cSkyA = useRef(new THREE.Color());
  const cSkyB = useRef(new THREE.Color());
  const curSkyColor = useRef(new THREE.Color());

  const cGndA = useRef(new THREE.Color());
  const cGndB = useRef(new THREE.Color());
  const curGroundColor = useRef(new THREE.Color());

  const cFogA = useRef(new THREE.Color());
  const cFogB = useRef(new THREE.Color());
  const curFogColor = useRef(new THREE.Color());

  const curSunPos = useRef(new THREE.Vector3());
  const targetSunPos = useRef(new THREE.Vector3());
  const curTurbidity = useRef(2.5);
  const curRayleigh = useRef(1.2);
  const curFogDensity = useRef(0.0014);

  const frostGroundRef = useRef(new THREE.Color('#e2e8f0'));
  const frostFogRef = useRef(new THREE.Color('#c7d2fe'));

  // Pre-calculate track station climate anchors
  const anchors = useMemo(() => {
    return portfolioData.stations.map((stn, idx) => {
      const t = journeyCurveManager.getStationT(idx);
      const mood = stn.mood || 'day';
      const config = MOOD_PRESETS[mood] || MOOD_PRESETS.day;
      return {
        t,
        mood,
        biome: stn.biome,
        config,
      };
    });
  }, []);

  useFrame((_, delta) => {
    // 1. Find surrounding weather anchors along track progress (imperative read to avoid React re-renders)
    const p = THREE.MathUtils.clamp(useJourneyStore.getState().progress, 0, 1);
    let idx0 = 0;
    let idx1 = 1;

    for (let i = 0; i < anchors.length - 1; i++) {
      if (p >= anchors[i].t && p <= anchors[i + 1].t) {
        idx0 = i;
        idx1 = i + 1;
        break;
      } else if (p > anchors[anchors.length - 1].t) {
        idx0 = anchors.length - 2;
        idx1 = anchors.length - 1;
      }
    }

    const a0 = anchors[idx0];
    const a1 = anchors[idx1];
    const tSpan = Math.max(0.0001, a1.t - a0.t);
    const rawAlpha = THREE.MathUtils.clamp((p - a0.t) / tSpan, 0, 1);
    // Smoothstep interpolation for seamless continuous transition
    const alpha = rawAlpha * rawAlpha * (3 - 2 * rawAlpha);

    // 2. Interpolate base mood lighting parameters
    cSunA.current.set(a0.config.sunColor);
    cSunB.current.set(a1.config.sunColor);
    curSunColor.current.copy(cSunA.current).lerp(cSunB.current, alpha);

    cSkyA.current.set(a0.config.skyColor);
    cSkyB.current.set(a1.config.skyColor);
    curSkyColor.current.copy(cSkyA.current).lerp(cSkyB.current, alpha);

    cGndA.current.set(a0.config.groundColor);
    cGndB.current.set(a1.config.groundColor);
    curGroundColor.current.copy(cGndA.current).lerp(cGndB.current, alpha);

    cFogA.current.set(a0.config.fogColor);
    cFogB.current.set(a1.config.fogColor);
    curFogColor.current.copy(cFogA.current).lerp(cFogB.current, alpha);

    const targetSunIntensity = THREE.MathUtils.lerp(a0.config.sunIntensity, a1.config.sunIntensity, alpha);
    const targetHemiIntensity = THREE.MathUtils.lerp(a0.config.hemiIntensity, a1.config.hemiIntensity, alpha);
    const targetDensity = THREE.MathUtils.lerp(a0.config.fogDensity, a1.config.fogDensity, alpha);
    const targetTurbidity = THREE.MathUtils.lerp(a0.config.turbidity, a1.config.turbidity, alpha);
    const targetRayleigh = THREE.MathUtils.lerp(a0.config.rayleigh, a1.config.rayleigh, alpha);

    targetSunPos.current.set(
      THREE.MathUtils.lerp(a0.config.sunPosition[0], a1.config.sunPosition[0], alpha),
      THREE.MathUtils.lerp(a0.config.sunPosition[1], a1.config.sunPosition[1], alpha),
      THREE.MathUtils.lerp(a0.config.sunPosition[2], a1.config.sunPosition[2], alpha)
    );

    // 3. Subtle Biome Climate Modifiers
    // Check proximity to snow station (Station 6, IIT Dhanbad)
    const snowStationT = anchors[5]?.t ?? 0.45;
    const distToSnow = Math.abs(p - snowStationT);
    const snowInfluence = THREE.MathUtils.clamp(1.0 - distToSnow / 0.045, 0, 1);

    if (snowInfluence > 0) {
      // Gentle blend into high alpine frosty ground and mist (zero allocation)
      curGroundColor.current.lerp(frostGroundRef.current, snowInfluence * 0.7);
      curFogColor.current.lerp(frostFogRef.current, snowInfluence * 0.65);
    }

    // 4. Smooth continuous frame damping with adaptive speed for cruise mode
    // When train is cruising fast (velocity > 0.02), weather and lighting transition swiftly to prevent lag
    const trainVel = Math.abs(useJourneyStore.getState().velocity);
    const lerpSpeed = Math.min(1.0, delta * (trainVel > 0.02 ? 10.0 : 4.5));
    curSunPos.current.lerp(targetSunPos.current, lerpSpeed);
    curTurbidity.current = THREE.MathUtils.lerp(curTurbidity.current, targetTurbidity, lerpSpeed);
    curRayleigh.current = THREE.MathUtils.lerp(curRayleigh.current, targetRayleigh, lerpSpeed);
    curFogDensity.current = THREE.MathUtils.lerp(curFogDensity.current, targetDensity, lerpSpeed);

    // Update Three.js linear scene fog (razor-sharp near train, soft natural horizon blend)
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(curFogColor.current, lerpSpeed);
      scene.fog.near = 140;
      scene.fog.far = 950;
    } else {
      scene.fog = new THREE.Fog(curFogColor.current, 140, 950);
    }

    // Directional Sun tracking the train position with dynamic shadows
    const trainPt = journeyCurveManager.getPointAt(p);

    if (sunRef.current) {
      sunRef.current.color.lerp(curSunColor.current, lerpSpeed);
      sunRef.current.intensity = THREE.MathUtils.lerp(sunRef.current.intensity, targetSunIntensity, lerpSpeed);

      sunRef.current.position.set(
        trainPt.x + curSunPos.current.x,
        trainPt.y + curSunPos.current.y,
        trainPt.z + curSunPos.current.z
      );
      sunRef.current.target.position.set(trainPt.x, trainPt.y, trainPt.z);
      sunRef.current.target.updateMatrixWorld();
    }

    if (hemiRef.current) {
      hemiRef.current.color.lerp(curSkyColor.current, lerpSpeed);
      hemiRef.current.groundColor.lerp(curGroundColor.current, lerpSpeed);
      hemiRef.current.intensity = THREE.MathUtils.lerp(
        hemiRef.current.intensity,
        targetHemiIntensity + snowInfluence * 0.4,
        lerpSpeed
      );
    }

    // Update Drei Sky sphere to follow train position so sky dome stays centered
    if (skyRef.current) {
      skyRef.current.position.set(trainPt.x, 0, trainPt.z);
      const mat = (skyRef.current as any).material;
      if (mat?.uniforms) {
        if (mat.uniforms.turbidity) mat.uniforms.turbidity.value = curTurbidity.current;
        if (mat.uniforms.rayleigh) mat.uniforms.rayleigh.value = curRayleigh.current;
        if (mat.uniforms.sunPosition) mat.uniforms.sunPosition.value.copy(curSunPos.current);
      }
    }

    // Stars visibility near Terminus
    if (starsGroupRef.current) {
      starsGroupRef.current.visible = p > 0.82;
    }
  });

  // Calculate initial sky defaults from first station
  const initialConfig = anchors[0]?.config || MOOD_PRESETS.dawn;

  return (
    <group name="environment-rig">
      {/* Dynamic Sky Simulation with Direct Uniform Tracking */}
      <Sky
        ref={skyRef}
        sunPosition={initialConfig.sunPosition}
        turbidity={initialConfig.turbidity}
        rayleigh={initialConfig.rayleigh}
        azimuth={180}
        distance={2000}
      />

      {/* Night Sky Stars with Smooth Opacity/Visibility Ramp near Terminus */}
      <group ref={starsGroupRef} visible={false}>
        <Stars radius={250} depth={80} count={1200} factor={4} saturation={0.5} fade speed={1} />
      </group>

      {/* Directional Sun with Dynamic Train Shadow Tracking */}
      <directionalLight
        ref={sunRef}
        position={initialConfig.sunPosition}
        intensity={initialConfig.sunIntensity}
        castShadow={tier === 'high'}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={260}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-bias={-0.0003}
      />

      {/* Ambient Sky / Ground Hemisphere */}
      <hemisphereLight
        ref={hemiRef}
        args={[initialConfig.skyColor, initialConfig.groundColor, initialConfig.hemiIntensity]}
      />
    </group>
  );
};
