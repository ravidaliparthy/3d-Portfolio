import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useJourneyStore } from '../../stores/useJourneyStore';

interface ConductorCharan3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const ConductorCharan3D: React.FC<ConductorCharan3DProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const setConductorModalOpen = useJourneyStore((s) => s.setConductorModalOpen);
  const isConductorModalOpen = useJourneyStore((s) => s.isConductorModalOpen);
  const isMenuOpen = useJourneyStore((s) => s.isMenuOpen);
  const isCameraMenuOpen = useJourneyStore((s) => s.isCameraMenuOpen);
  const cameraPreset = useJourneyStore((s) => s.cameraPreset);
  const tier = useJourneyStore((s) => s.tier);
  const [hovered, setHovered] = useState(false);

  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  // Subtle breathing and idle animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 1.8) * 0.015;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8) * 0.08;
      headRef.current.rotation.x = Math.sin(t * 1.4) * 0.03;
    }
  });

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setConductorModalOpen(true);
      }}
    >
      {/* Interactive Speech & Boarding Indicator (Shown in Station View when inspecting platform, hidden during any menu/modal) */}
      {(cameraPreset === 'station' || hovered) && !isMenuOpen && !isCameraMenuOpen && !isConductorModalOpen && (
        <Html position={[0, 2.05, 0]} center distanceFactor={12} zIndexRange={[10, 0]}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConductorModalOpen(true);
            }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono font-black shadow-2xl transition-all cursor-pointer whitespace-nowrap ${
              hovered
                ? 'border-amber-300 bg-amber-400 text-slate-950 scale-110 shadow-amber-400/40'
                : 'border-amber-400/80 bg-[#041a10]/95 text-amber-300 hover:bg-amber-400 hover:text-slate-950 hover:scale-105'
            }`}
            title="Click to speak with Conductor Charan and board any State"
          >
            <span className="text-xs">🧑‍✈️</span>
            <span>Ask Conductor: Board State</span>
          </button>
        </Html>
      )}

      {/* Main Character Rig */}
      <group ref={bodyRef}>
        {/* Polished Black Boots */}
        <mesh position={[-0.12, 0.06, 0.02]} castShadow={tier === 'high'}>
          <boxGeometry args={[0.12, 0.12, 0.24]} />
          <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.06, 0.02]} castShadow={tier === 'high'}>
          <boxGeometry args={[0.12, 0.12, 0.24]} />
          <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Trousers (Navy with subtle golden side seam pinstripe) */}
        <mesh position={[-0.12, 0.42, 0]} castShadow={tier === 'high'}>
          <cylinderGeometry args={[0.075, 0.065, 0.65, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
        <mesh position={[0.12, 0.42, 0]} castShadow={tier === 'high'}>
          <cylinderGeometry args={[0.075, 0.065, 0.65, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>

        {/* Double-Breasted Conductor Navy Jacket */}
        <mesh position={[0, 0.98, 0]} castShadow={tier === 'high'}>
          <boxGeometry args={[0.42, 0.54, 0.26]} />
          <meshStandardMaterial color="#0a192f" roughness={0.65} />
        </mesh>

        {/* Golden Epaulettes on Shoulders */}
        <mesh position={[-0.22, 1.24, 0]}>
          <boxGeometry args={[0.08, 0.03, 0.14]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.22, 1.24, 0]}>
          <boxGeometry args={[0.08, 0.03, 0.14]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* 6 Polished Brass Front Buttons */}
        {[-0.06, 0.06].map((xOffset, cIdx) =>
          [0.85, 0.98, 1.11].map((yOffset, rIdx) => (
            <mesh key={`${cIdx}-${rIdx}`} position={[xOffset, yOffset, 0.134]}>
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
            </mesh>
          ))
        )}

        {/* Golden Pocket Watch Chain across Vest */}
        <mesh position={[-0.03, 0.88, 0.132]} rotation={[0, 0, -Math.PI / 8]}>
          <boxGeometry args={[0.14, 0.01, 0.01]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Shirt Collar & Burgundy Silk Tie */}
        <mesh position={[0, 1.22, 0.125]}>
          <boxGeometry args={[0.08, 0.06, 0.02]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.14, 0.13]}>
          <boxGeometry args={[0.04, 0.12, 0.015]} />
          <meshStandardMaterial color="#881337" roughness={0.6} />
        </mesh>

        {/* Left Arm with Official Clipboard / Manifest */}
        <group position={[-0.26, 1.0, 0.06]}>
          <mesh position={[0, -0.16, 0.08]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.045, 0.4, 10]} />
            <meshStandardMaterial color="#0a192f" roughness={0.65} />
          </mesh>
          {/* Clipboard Plaque */}
          <mesh position={[0, -0.32, 0.22]} rotation={[Math.PI / 3, 0, 0]}>
            <boxGeometry args={[0.16, 0.24, 0.02]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          {/* Paper Manifest */}
          <mesh position={[0, -0.315, 0.23]} rotation={[Math.PI / 3, 0, 0]}>
            <planeGeometry args={[0.13, 0.2]} />
            <meshBasicMaterial color="#fef3c7" />
          </mesh>
        </group>

        {/* Right Arm Greeting Hand */}
        <group position={[0.26, 1.0, 0]}>
          <mesh position={[0.04, -0.16, 0.04]} rotation={[0, 0, -Math.PI / 16]}>
            <cylinderGeometry args={[0.05, 0.045, 0.4, 10]} />
            <meshStandardMaterial color="#0a192f" roughness={0.65} />
          </mesh>
          {/* Hand */}
          <mesh position={[0.06, -0.36, 0.05]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color="#fbcfe8" roughness={0.7} />
          </mesh>
        </group>

        {/* Head, Face & Peaked Service Cap */}
        <group ref={headRef} position={[0, 1.42, 0]}>
          {/* Head */}
          <mesh castShadow={tier === 'high'}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color="#fbcfe8" roughness={0.65} />
          </mesh>

          {/* Glasses */}
          <mesh position={[0, 0.02, 0.125]}>
            <boxGeometry args={[0.16, 0.04, 0.02]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Official Peaked Conductor Service Cap */}
          <group position={[0, 0.1, 0]}>
            {/* Cap Crown (Navy Blue Fabric) */}
            <mesh position={[0, 0.05, -0.01]}>
              <cylinderGeometry args={[0.155, 0.135, 0.12, 16]} />
              <meshStandardMaterial color="#0a192f" roughness={0.6} />
            </mesh>
            {/* Golden Ribbon Band */}
            <mesh position={[0, 0.01, 0]}>
              <cylinderGeometry args={[0.142, 0.142, 0.035, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Front Brass Express Medallion / Badge */}
            <mesh position={[0, 0.04, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.015, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Black Polished Leather Visor */}
            <mesh position={[0, -0.015, 0.13]} rotation={[Math.PI / 8, 0, 0]}>
              <boxGeometry args={[0.17, 0.02, 0.1]} />
              <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
