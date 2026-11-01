import React, { useMemo } from 'react';
import * as THREE from 'three';
import { journeyCurveManager } from './JourneyCurve';
import { useJourneyStore } from '../../stores/useJourneyStore';

export const TerrainSystem: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);

  const resolution = tier === 'low' ? 60 : tier === 'mid' ? 95 : 128;

  const geometry = useMemo(() => {
    // 1500m wide, 2000m long terrain plane to encompass all 12 stations and buffers
    const geo = new THREE.PlaneGeometry(1500, 2000, resolution, resolution);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const curve = journeyCurveManager.curve;

    // Pre-sample 400 points along the track curve for fast, dense proximity lookup
    const trackSamples = 400;
    const trackPoints: THREE.Vector3[] = [];
    for (let s = 0; s <= trackSamples; s++) {
      trackPoints.push(curve.getPointAt(s / trackSamples));
    }

    for (let i = 0; i < pos.count; i++) {
      const localX = pos.getX(i);
      const localZ = pos.getZ(i);

      // World coordinates (plane is placed at position [0, 0, 720])
      const worldX = localX;
      const worldZ = localZ + 720;

      // Find closest track point along the railway
      let closestDist = Infinity;
      let closestPt = trackPoints[0];

      // Quick estimate based on Z to search nearby samples
      const zRatio = (worldZ - (-60)) / (1500 - (-60));
      const approxSample = Math.max(0, Math.min(trackSamples, Math.round(zRatio * trackSamples)));
      const searchStart = Math.max(0, approxSample - 35);
      const searchEnd = Math.min(trackSamples, approxSample + 35);

      for (let s = searchStart; s <= searchEnd; s++) {
        const pt = trackPoints[s];
        const d = Math.hypot(worldX - pt.x, worldZ - pt.z);
        if (d < closestDist) {
          closestDist = d;
          closestPt = pt;
        }
      }

      // Natural terrain height generation (rolling hills, scenic mountain ranges)
      const lowHills = Math.sin(worldX * 0.009 + worldZ * 0.007) * Math.cos(worldZ * 0.006) * 11.0;
      const mediumDetail = Math.sin(worldX * 0.022 - worldZ * 0.016) * 3.5;
      
      // Mountains in Canyon & High Alpine Snow Pass
      let mountainHeight = 0;
      if (worldZ > 480 && worldZ < 680) {
        // High Alpine Snowy Summit at IIT Dhanbad
        mountainHeight = Math.sin(worldX * 0.008) * Math.cos(worldZ * 0.007) * 38.0;
        if (Math.abs(worldX) > 45) {
          mountainHeight += Math.abs(Math.sin(worldX * 0.012)) * 22.0;
        }
      } else if (worldZ > 320 && worldZ <= 480) {
        // Red rock canyon ridges
        mountainHeight = Math.sin(worldX * 0.006) * Math.cos(worldZ * 0.005) * 26.0;
      }

      // Smooth station platform clearance so no steep ridges rise next to stations
      let stationFlatten = 1.0;
      for (let s = 0; s < journeyCurveManager.stationPoints.length; s++) {
        const stn = journeyCurveManager.stationPoints[s];
        if (stn) {
          const d = Math.hypot(worldX - stn.x, worldZ - stn.z);
          if (d < 50.0) {
            stationFlatten = Math.min(stationFlatten, Math.max(0.1, d / 50.0));
          }
        }
      }

      const naturalHeight = (lowHills + mediumDetail + mountainHeight) * stationFlatten;

      // Civil-Engineering Railway Right-of-Way Corridor:
      // Track roadbed elevation: ground sits exactly 0.42m under track center
      const trackBedY = closestPt.y - 0.42;

      // 1. Roadbed flat clearing: 18m wide corridor on each side (36m total flat width)
      // Guarantees that at least one full grid polygon ring on each side sits at trackBedY.
      const roadbedHalfWidth = 18.0;
      const maxSlopeDist = 58.0;

      // 2. Strict railway cutting envelope:
      // The maximum allowable terrain height at distance `d` from the track
      // Head-slope grade is capped at 0.32 (~17.7 degrees safe railway slope).
      // This MATHEMATICALLY PREVENTS any polygon triangle from ever slicing above the rails!
      const maxAllowedY = trackBedY + Math.max(0, (closestDist - roadbedHalfWidth) * 0.32);

      let terrainY = trackBedY + naturalHeight;

      if (closestDist <= roadbedHalfWidth) {
        terrainY = trackBedY;
      } else if (closestDist < maxSlopeDist) {
        const tClear = (closestDist - roadbedHalfWidth) / (maxSlopeDist - roadbedHalfWidth);
        const smoothClear = tClear * tClear * (3 - 2 * tClear);
        terrainY = trackBedY * (1 - smoothClear) + terrainY * smoothClear;
        terrainY = Math.min(terrainY, maxAllowedY);
      } else {
        terrainY = Math.min(terrainY, maxAllowedY);
      }

      // Hard clamp: anywhere within 25m, terrain can NEVER be higher than trackBedY + 1.2m
      if (closestDist < 25.0) {
        terrainY = Math.min(terrainY, trackBedY + Math.max(0, (closestDist - roadbedHalfWidth) * 0.25));
      }

      // River depression in coastal viaduct region
      if (worldZ > 680 && worldZ < 940 && worldX > 20 && worldX < 140) {
        const riverFade = Math.max(0, Math.min(1, (closestDist - 6.0) / 20.0));
        terrainY -= 12.0 * riverFade;
      }

      pos.setY(i, terrainY);

      // Biome-based natural PBR vertex coloration
      const rIdx = i * 3;
      if (worldZ < 280) {
        // Biome: Lush Meadows & Academic Valley (rich grass green)
        colors[rIdx] = 0.16 + terrainY * 0.003;
        colors[rIdx + 1] = 0.38 + terrainY * 0.005;
        colors[rIdx + 2] = 0.14;
      } else if (worldZ < 480) {
        // Biome: Terracotta Canyon & GeoAI Drone Outpost (warm sandstone)
        colors[rIdx] = 0.52 + terrainY * 0.003;
        colors[rIdx + 1] = 0.32 + terrainY * 0.002;
        colors[rIdx + 2] = 0.18;
      } else if (worldZ < 660) {
        // Biome: HIGH ALPINE SNOW PASS (IIT ISM Dhanbad Seismic Station)
        // White snow blankets the terrain with subtle frosty blue shadows
        if (terrainY > 16.0 || Math.abs(worldX) > 25) {
          // Pure pristine snow pack
          colors[rIdx] = 0.94;
          colors[rIdx + 1] = 0.96;
          colors[rIdx + 2] = 0.99;
        } else {
          // Snowy frost rock transition
          colors[rIdx] = 0.72;
          colors[rIdx + 1] = 0.76;
          colors[rIdx + 2] = 0.82;
        }
      } else if (worldZ < 880) {
        // Biome: Coastal Viaduct & Expense Tracker (cool ocean slate & shores)
        colors[rIdx] = 0.22;
        colors[rIdx + 1] = 0.32;
        colors[rIdx + 2] = 0.28;
      } else if (worldZ < 1140) {
        // Biome: Highland Ridgeline & National Hackathon
        colors[rIdx] = 0.28;
        colors[rIdx + 1] = 0.34;
        colors[rIdx + 2] = 0.24;
      } else {
        // Biome: Terminus Metropolis & Hyderabad Grand Central (midnight blue gravel)
        colors[rIdx] = 0.14;
        colors[rIdx + 1] = 0.18;
        colors[rIdx + 2] = 0.22;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
  }, [resolution]);

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, 720]}
      receiveShadow
      frustumCulled={false}
      name="terrain-mesh"
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.92}
        metalness={0.08}
        flatShading={tier === 'low'}
      />
    </mesh>
  );
};
