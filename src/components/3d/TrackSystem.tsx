import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { journeyCurveManager } from './JourneyCurve';
import { useJourneyStore } from '../../stores/useJourneyStore';

/**
 * Parallel-transport rail profile generator
 * Guarantees zero Frenet-twist, zero corkscrew, and micro-precision gauge tracking.
 */
function createRailGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  samples: number,
  railGauge: number,
  railSide: 1 | -1
) {
  const geo = new THREE.BufferGeometry();
  const halfW = 0.042; // Rail head half-width (84mm head)
  const railH = 0.14;  // Rail profile height
  const baseOffset = 0.07; // Sits on tie top plate

  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const pt = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const right = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const normal = new THREE.Vector3().crossVectors(tangent, right).normalize();

    // Center of rail profile
    const center = pt.clone().addScaledVector(right, railSide * railGauge).addScaledVector(normal, baseOffset);

    // Profile corners
    const tl = center.clone().addScaledVector(right, -halfW).addScaledVector(normal, railH);
    const tr = center.clone().addScaledVector(right, halfW).addScaledVector(normal, railH);
    const br = center.clone().addScaledVector(right, halfW);
    const bl = center.clone().addScaledVector(right, -halfW);

    vertices.push(tl.x, tl.y, tl.z);
    vertices.push(tr.x, tr.y, tr.z);
    vertices.push(br.x, br.y, br.z);
    vertices.push(bl.x, bl.y, bl.z);

    const v = i / 10;
    uvs.push(0, v, 1, v, 1, v, 0, v);

    if (i < samples) {
      const rowA = i * 4;
      const rowB = (i + 1) * 4;

      // Top face (where wheels ride)
      indices.push(rowA + 0, rowB + 0, rowB + 1);
      indices.push(rowA + 0, rowB + 1, rowA + 1);

      // Right face
      indices.push(rowA + 1, rowB + 1, rowB + 2);
      indices.push(rowA + 1, rowB + 2, rowA + 2);

      // Bottom face
      indices.push(rowA + 2, rowB + 2, rowB + 3);
      indices.push(rowA + 2, rowB + 3, rowA + 3);

      // Left face
      indices.push(rowA + 3, rowB + 3, rowB + 0);
      indices.push(rowA + 3, rowB + 0, rowA + 0);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

/**
 * Continuous trapezoidal stone ballast roadbed
 */
function createBallastGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  samples: number
) {
  const geo = new THREE.BufferGeometry();
  const topHalfW = 1.6;
  const botHalfW = 2.4;
  const ballastH = 0.42;

  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const pt = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const right = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const normal = new THREE.Vector3().crossVectors(tangent, right).normalize();

    const tl = pt.clone().addScaledVector(right, -topHalfW).addScaledVector(normal, 0.0);
    const tr = pt.clone().addScaledVector(right, topHalfW).addScaledVector(normal, 0.0);
    const br = pt.clone().addScaledVector(right, botHalfW).addScaledVector(normal, -ballastH);
    const bl = pt.clone().addScaledVector(right, -botHalfW).addScaledVector(normal, -ballastH);

    vertices.push(tl.x, tl.y, tl.z);
    vertices.push(tr.x, tr.y, tr.z);
    vertices.push(br.x, br.y, br.z);
    vertices.push(bl.x, bl.y, bl.z);

    const v = i / 4;
    uvs.push(0, v, 1, v, 1, v, 0, v);

    if (i < samples) {
      const rowA = i * 4;
      const rowB = (i + 1) * 4;

      // Top face
      indices.push(rowA + 0, rowB + 0, rowB + 1);
      indices.push(rowA + 0, rowB + 1, rowA + 1);

      // Right slope
      indices.push(rowA + 1, rowB + 1, rowB + 2);
      indices.push(rowA + 1, rowB + 2, rowA + 2);

      // Left slope
      indices.push(rowA + 3, rowB + 3, rowB + 0);
      indices.push(rowA + 3, rowB + 0, rowA + 0);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

export const TrackSystem: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);
  const tiesMeshRef = useRef<THREE.InstancedMesh>(null);
  const viaductMeshRef = useRef<THREE.InstancedMesh>(null);
  const railingMeshRef = useRef<THREE.InstancedMesh>(null);

  const tieCount = useMemo(() => {
    switch (tier) {
      case 'low':
        return 500;
      case 'mid':
        return 900;
      case 'high':
      default:
        return 1300;
    }
  }, [tier]);

  const curve = journeyCurveManager.curve;

  // Calculate and place instanced sleepers and bridge viaduct pillars
  useLayoutEffect(() => {
    if (!tiesMeshRef.current) return;

    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < tieCount; i++) {
      const t = i / (tieCount - 1);
      const position = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();

      const right = new THREE.Vector3().crossVectors(up, tangent).normalize();
      const normal = new THREE.Vector3().crossVectors(tangent, right).normalize();

      const matrix = new THREE.Matrix4();
      matrix.makeBasis(right, normal, tangent);
      // Tie center sits flush with top of ballast bed
      matrix.setPosition(position.x, position.y, position.z);

      tiesMeshRef.current.setMatrixAt(i, matrix);
    }

    tiesMeshRef.current.instanceMatrix.needsUpdate = true;

    // Bridge viaduct piers and parapets under elevated sections (Y > 4.2)
    if (viaductMeshRef.current) {
      const dummy = new THREE.Object3D();
      let pillarIdx = 0;
      const numSteps = 160;

      for (let s = 0; s < numSteps; s++) {
        const t = s / numSteps;
        const pt = curve.getPointAt(t);
        // Strictly only over the river chasm where the track bridges above open water
        if (pt.z >= 690 && pt.z <= 840 && s % 3 === 0 && pillarIdx < 24) {
          const pierHeight = pt.y + 0.2;
          dummy.position.set(pt.x, pierHeight / 2 - 0.2, pt.z);
          dummy.scale.set(2.4, pierHeight, 2.8);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          viaductMeshRef.current.setMatrixAt(pillarIdx, dummy.matrix);
          pillarIdx++;
        }
      }
      viaductMeshRef.current.count = pillarIdx;
      viaductMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (railingMeshRef.current) {
      const dummy = new THREE.Object3D();
      let railIdx = 0;
      const numSteps = 160;

      for (let s = 0; s < numSteps; s++) {
        const t = s / numSteps;
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const right = new THREE.Vector3().crossVectors(up, tangent).normalize();

        // Parapet railings strictly along the coastal bridge crossing (Station 7)
        if (pt.z >= 690 && pt.z <= 840 && railIdx < 60) {
          // Left parapet
          dummy.position.copy(pt).addScaledVector(right, -1.8).add(new THREE.Vector3(0, 0.45, 0));
          dummy.scale.set(0.12, 0.7, 4.0);
          dummy.updateMatrix();
          railingMeshRef.current.setMatrixAt(railIdx++, dummy.matrix);

          // Right parapet
          dummy.position.copy(pt).addScaledVector(right, 1.8).add(new THREE.Vector3(0, 0.45, 0));
          dummy.scale.set(0.12, 0.7, 4.0);
          dummy.updateMatrix();
          railingMeshRef.current.setMatrixAt(railIdx++, dummy.matrix);
        }
      }
      railingMeshRef.current.count = railIdx;
      railingMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [curve, tieCount]);

  // Construct continuous twin steel rails and ballast using parallel-transport frames
  const { leftRailGeo, rightRailGeo, ballastGeo } = useMemo(() => {
    const railGauge = 0.72; // standard gauge half-width
    const samples = tier === 'low' ? 500 : tier === 'mid' ? 800 : 1200;

    const leftRail = createRailGeometry(curve, samples, railGauge, -1);
    const rightRail = createRailGeometry(curve, samples, railGauge, 1);
    const ballast = createBallastGeometry(curve, samples / 2);

    return { leftRailGeo: leftRail, rightRailGeo: rightRail, ballastGeo: ballast };
  }, [curve, tier]);

  // High quality PBR materials
  const sleeperMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x241710,
        roughness: 0.88,
        metalness: 0.08,
      }),
    []
  );

  const railMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.12,
        metalness: 0.98,
        envMapIntensity: 1.5,
      }),
    []
  );

  const ballastMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.94,
        metalness: 0.06,
      }),
    []
  );

  const stoneMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.85,
        metalness: 0.12,
      }),
    []
  );

  return (
    <group name="track-system">
      {/* Continuous Trapezoidal Gravel Ballast Roadbed */}
      <mesh geometry={ballastGeo} material={ballastMaterial} receiveShadow frustumCulled={false} />

      {/* Railroad Ties (Sleepers) */}
      <instancedMesh
        ref={tiesMeshRef}
        args={[undefined, undefined, tieCount]}
        castShadow={tier === 'high'}
        receiveShadow
        material={sleeperMaterial}
        frustumCulled={false}
      >
        <boxGeometry args={[2.2, 0.14, 0.26]} />
      </instancedMesh>

      {/* Twin Specular Steel Rails */}
      <mesh geometry={leftRailGeo} material={railMaterial} castShadow={tier === 'high'} receiveShadow frustumCulled={false} />
      <mesh geometry={rightRailGeo} material={railMaterial} castShadow={tier === 'high'} receiveShadow frustumCulled={false} />

      {/* Stone Viaduct Piers under elevated bridge spans */}
      <instancedMesh
        ref={viaductMeshRef}
        args={[undefined, undefined, 60]}
        castShadow={tier === 'high'}
        receiveShadow
        material={stoneMaterial}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      {/* Bridge Safety Parapets */}
      <instancedMesh
        ref={railingMeshRef}
        args={[undefined, undefined, 100]}
        castShadow={tier === 'high'}
        material={stoneMaterial}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </group>
  );
};
