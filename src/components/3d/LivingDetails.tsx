import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useJourneyStore } from '../../stores/useJourneyStore';

export const LivingDetails: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);

  const birdFlockRef = useRef<THREE.Group>(null);
  const signalLightRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Bird flock circling gently
    if (birdFlockRef.current) {
      birdFlockRef.current.position.x = Math.sin(time * 0.15) * 80 + 40;
      birdFlockRef.current.position.z = Math.cos(time * 0.15) * 80 + 350;
      birdFlockRef.current.rotation.y = -time * 0.15 + Math.PI / 2;
    }

    // Signal light alternation
    if (signalLightRef.current) {
      const isGreen = Math.floor(time * 0.5) % 3 !== 0;
      signalLightRef.current.color.set(isGreen ? '#22c55e' : '#eab308');
      signalLightRef.current.emissive.set(isGreen ? '#22c55e' : '#eab308');
    }
  });

  return (
    <group name="living-details">
      {/* Bird flock in sky */}
      <group ref={birdFlockRef} position={[30, 45, 200]}>
        {[...Array(tier === 'low' ? 3 : 7)].map((_, i) => (
          <mesh key={i} position={[(i - 3) * 3, Math.sin(i) * 1.5, (i % 2) * 2]}>
            <coneGeometry args={[0.4, 0.8, 3]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        ))}
      </group>

      {/* Signal Gantry */}
      <group position={[2.6, 0, 180]}>
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 5.0, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 4.8, 0]}>
          <boxGeometry args={[0.4, 0.9, 0.3]} />
          <meshStandardMaterial color="#090d16" />
        </mesh>
        <mesh position={[0, 4.8, 0.16]}>
          <circleGeometry args={[0.14, 16]} />
          <meshStandardMaterial ref={signalLightRef} color="#22c55e" emissive="#22c55e" emissiveIntensity={1.5} />
        </mesh>
      </group>
    </group>
  );
};
