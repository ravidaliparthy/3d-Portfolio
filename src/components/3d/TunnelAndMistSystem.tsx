import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useJourneyStore } from '../../stores/useJourneyStore';

export const TunnelAndMistSystem: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);
  const mistMeshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (mistMeshRef.current) {
      mistMeshRef.current.children.forEach((child, idx) => {
        child.position.x += Math.sin(time * 0.4 + idx) * 0.05;
        child.position.z += Math.cos(time * 0.3 + idx) * 0.08;
      });
    }
  });

  return (
    <group name="tunnel-and-mist-system">
      {/* 1. Coastal Viaduct Mist Banks at Z ≈ 580 */}
      <group ref={mistMeshRef} position={[120, 16, 580]}>
        {[...Array(tier === 'low' ? 2 : 4)].map((_, i) => (
          <mesh
            key={i}
            position={[
              (i - 2) * 12 + Math.sin(i * 3) * 6,
              Math.sin(i * 2) * 2,
              (i % 2) * 14 - 10,
            ]}
          >
            <sphereGeometry args={[14 + (i % 2) * 4, 10, 10]} />
            <meshBasicMaterial
              color="#e2e8f0"
              transparent
              opacity={0.12}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
