import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { journeyCurveManager } from './JourneyCurve';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { getDebugSwitch } from '../../utils/debugSwitches';

function getTerrainElevationY(worldX: number, worldZ: number, trackY: number, dist: number): number {
  const lowHills = Math.sin(worldX * 0.009 + worldZ * 0.007) * Math.cos(worldZ * 0.006) * 11.0;
  const mediumDetail = Math.sin(worldX * 0.022 - worldZ * 0.016) * 3.5;
  let mountainHeight = 0;
  if (worldZ > 480 && worldZ < 680) {
    mountainHeight = Math.sin(worldX * 0.008) * Math.cos(worldZ * 0.007) * 38.0;
    if (Math.abs(worldX) > 45) mountainHeight += Math.abs(Math.sin(worldX * 0.012)) * 22.0;
  } else if (worldZ > 320 && worldZ <= 480) {
    mountainHeight = Math.sin(worldX * 0.006) * Math.cos(worldZ * 0.005) * 26.0;
  }
  let stationFlatten = 1.0;
  for (let s = 0; s < journeyCurveManager.stationPoints.length; s++) {
    const stn = journeyCurveManager.stationPoints[s];
    if (stn) {
      const d = Math.hypot(worldX - stn.x, worldZ - stn.z);
      if (d < 50.0) stationFlatten = Math.min(stationFlatten, Math.max(0.1, d / 50.0));
    }
  }
  const naturalHeight = (lowHills + mediumDetail + mountainHeight) * stationFlatten;
  const trackBedY = trackY - 0.38;

  const roadbedHalfWidth = 8.5;
  const maxSlopeDist = 36.0;
  const maxAllowedY = trackBedY + Math.max(0, (dist - roadbedHalfWidth) * 0.26);

  let terrainY = trackBedY + naturalHeight;
  if (dist <= roadbedHalfWidth) {
    terrainY = trackBedY;
  } else if (dist < maxSlopeDist) {
    const tClear = (dist - roadbedHalfWidth) / (maxSlopeDist - roadbedHalfWidth);
    const smoothClear = tClear * tClear * (3 - 2 * tClear);
    terrainY = trackBedY * (1 - smoothClear) + terrainY * smoothClear;
    terrainY = Math.min(terrainY, maxAllowedY);
  } else {
    terrainY = Math.min(terrainY, maxAllowedY);
  }

  if (dist < 22.0) {
    terrainY = Math.min(terrainY, trackBedY + Math.max(0, (dist - roadbedHalfWidth) * 0.22));
  }

  return terrainY;
}

export const FoliageSystem: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);
  const meadowTreesRef = useRef<THREE.InstancedMesh>(null);
  const desertCactiRef = useRef<THREE.InstancedMesh>(null);
  const alpinePinesRef = useRef<THREE.InstancedMesh>(null);
  const biomeRocksRef = useRef<THREE.InstancedMesh>(null);

  const curve = journeyCurveManager.curve;

  const countPerType = useMemo(() => {
    const isPropsLow = getDebugSwitch('props') === 'low';
    if (isPropsLow || tier === 'low') {
      return { trees: 110, cacti: 65, alpine: 110, rocks: 95 };
    }
    return { trees: 260, cacti: 150, alpine: 260, rocks: 220 };
  }, [tier]);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);

    // 1. MEADOW & VALLEY DECIDUOUS TREES (Z: -20 to 320 & 1100 to 1380)
    if (meadowTreesRef.current) {
      let idx = 0;
      const numT = countPerType.trees;
      for (let i = 0; i < numT; i++) {
        const zTarget = i % 2 === 0 ? (i / numT) * 320 : 1100 + (i / numT) * 280;
        const t = Math.max(0.01, Math.min(0.98, (zTarget - (-60)) / 1500));
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const right = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const dist = 8.5 + (i % 7) * 4.0;
        const posX = pt.x + right.x * dist * side + Math.sin(i * 13) * 2.5;
        const posZ = pt.z + right.z * dist * side + Math.cos(i * 17) * 2.5;
        const posY = getTerrainElevationY(posX, posZ, pt.y, dist);

        const scale = 0.8 + (i % 5) * 0.28;
        dummy.position.set(posX, posY + (3.8 * scale) * 0.45, posZ);
        dummy.scale.set(scale, scale * (1.0 + (i % 3) * 0.2), scale);
        dummy.rotation.set(0, (i * 37) % Math.PI, 0);
        dummy.updateMatrix();

        meadowTreesRef.current.setMatrixAt(idx++, dummy.matrix);
      }
      meadowTreesRef.current.count = idx;
      meadowTreesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. DESERT & CANYON SAGUARO CACTI & DRY SCRUB (Z: 330 to 480)
    if (desertCactiRef.current) {
      let idx = 0;
      const numC = countPerType.cacti;
      for (let i = 0; i < numC; i++) {
        const zTarget = 330 + (i / numC) * 150;
        const t = Math.max(0.01, Math.min(0.98, (zTarget - (-60)) / 1500));
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const right = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? -1 : 1;
        const dist = 8.5 + (i % 6) * 3.8;
        const posX = pt.x + right.x * dist * side + Math.sin(i * 7) * 2.0;
        const posZ = pt.z + right.z * dist * side + Math.cos(i * 11) * 2.0;
        const posY = getTerrainElevationY(posX, posZ, pt.y, dist);

        const scale = 0.75 + (i % 4) * 0.35;
        dummy.position.set(posX, posY + (2.8 * scale) * 0.45, posZ);
        dummy.scale.set(scale, scale * (1.2 + (i % 3) * 0.3), scale);
        dummy.rotation.set(0, (i * 29) % Math.PI, 0);
        dummy.updateMatrix();

        desertCactiRef.current.setMatrixAt(idx++, dummy.matrix);
      }
      desertCactiRef.current.count = idx;
      desertCactiRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. ALPINE MOUNTAIN EVERGREEN SNOW-FROSTED PINES (Z: 490 to 680)
    if (alpinePinesRef.current) {
      let idx = 0;
      const numA = countPerType.alpine;
      for (let i = 0; i < numA; i++) {
        const zTarget = 490 + (i / numA) * 190;
        const t = Math.max(0.01, Math.min(0.98, (zTarget - (-60)) / 1500));
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const right = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const dist = 8.0 + (i % 8) * 4.2;
        const posX = pt.x + right.x * dist * side + Math.sin(i * 19) * 2.0;
        const posZ = pt.z + right.z * dist * side + Math.cos(i * 23) * 2.0;
        const posY = getTerrainElevationY(posX, posZ, pt.y, dist);

        const scale = 0.9 + (i % 5) * 0.35;
        dummy.position.set(posX, posY + (4.6 * scale) * 0.45, posZ);
        dummy.scale.set(scale, scale * (1.3 + (i % 4) * 0.25), scale);
        dummy.rotation.set(0, (i * 41) % Math.PI, 0);
        dummy.updateMatrix();

        alpinePinesRef.current.setMatrixAt(idx++, dummy.matrix);
      }
      alpinePinesRef.current.count = idx;
      alpinePinesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. BIOME-SPECIFIC CRAGGY ROCKS & BOULDERS
    if (biomeRocksRef.current) {
      let idx = 0;
      const numR = countPerType.rocks;
      for (let j = 0; j < numR; j++) {
        const t = (j / numR) * 0.96 + 0.02;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const right = new THREE.Vector3().crossVectors(up, tangent).normalize();

        const side = j % 2 === 0 ? -1 : 1;
        const dist = 7.5 + (j % 5) * 4.0;
        const posX = pt.x + right.x * dist * side + Math.sin(j * 5) * 1.5;
        const posZ = pt.z + right.z * dist * side + Math.cos(j * 9) * 1.5;
        const posY = getTerrainElevationY(posX, posZ, pt.y, dist);

        const scale = 0.7 + (j % 4) * 0.5;
        dummy.position.set(posX, posY + 0.35 * scale, posZ);
        dummy.scale.set(scale, scale * (0.6 + (j % 3) * 0.4), scale * 1.2);
        dummy.rotation.set((j * 13) % Math.PI, (j * 23) % Math.PI, 0);
        dummy.updateMatrix();

        biomeRocksRef.current.setMatrixAt(idx++, dummy.matrix);
      }
      biomeRocksRef.current.count = idx;
      biomeRocksRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [countPerType, curve]);

  return (
    <group name="foliage-system">
      {/* 1. Meadow & Valley Deciduous Trees */}
      <instancedMesh
        ref={meadowTreesRef}
        args={[undefined, undefined, countPerType.trees]}
        castShadow={tier === 'high'}
        receiveShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.0, 1.4, 3.8, 7]} />
        <meshStandardMaterial
          color="#1e5c2d"
          roughness={0.88}
          metalness={0.05}
        />
      </instancedMesh>

      {/* 2. Desert Cacti */}
      <instancedMesh
        ref={desertCactiRef}
        args={[undefined, undefined, countPerType.cacti]}
        castShadow={tier === 'high'}
        receiveShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.3, 0.35, 2.8, 8]} />
        <meshStandardMaterial
          color="#4d7c0f"
          roughness={0.85}
          metalness={0.05}
        />
      </instancedMesh>

      {/* 3. Alpine Mountain Snow-Frosted Spruce Pines */}
      <instancedMesh
        ref={alpinePinesRef}
        args={[undefined, undefined, countPerType.alpine]}
        castShadow={tier === 'high'}
        receiveShadow
        frustumCulled={false}
      >
        <coneGeometry args={[1.5, 4.6, 7]} />
        <meshStandardMaterial
          color="#e2e8f0" // Snow-dusted frost pine foliage
          roughness={0.7}
          metalness={0.1}
        />
      </instancedMesh>

      {/* 4. Natural Rocks & Boulders */}
      <instancedMesh
        ref={biomeRocksRef}
        args={[undefined, undefined, countPerType.rocks]}
        castShadow={tier === 'high'}
        receiveShadow
        frustumCulled={false}
      >
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color="#475569"
          roughness={0.9}
          metalness={0.15}
        />
      </instancedMesh>
    </group>
  );
};
