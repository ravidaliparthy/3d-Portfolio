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
      {/* 1. Mountain Tunnel Portal over track between Station 4 & Station 5 at Z ≈ 394 */}
      <group position={[101, 7.0, 394]} rotation={[0, 0.28, 0]}>
        {/* Left Masonry Portal Pier */}
        <mesh position={[-3.2, 3.2, 0]} castShadow={tier === 'high'} receiveShadow>
          <boxGeometry args={[1.6, 6.4, 2.2]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>

        {/* Right Masonry Portal Pier */}
        <mesh position={[3.2, 3.2, 0]} castShadow={tier === 'high'} receiveShadow>
          <boxGeometry args={[1.6, 6.4, 2.2]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>

        {/* Overhead Spanning Stone Arch Lintel */}
        <mesh position={[0, 5.8, 0]} castShadow={tier === 'high'}>
          <boxGeometry args={[8.0, 1.4, 2.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.75} />
        </mesh>

        {/* Tunnel Keystone Inscription Badge */}
        <mesh position={[0, 6.7, 1.25]}>
          <boxGeometry args={[2.4, 0.6, 0.15]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>

      {/* 2. Coastal Viaduct Mist Banks at Z ≈ 580 */}
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
