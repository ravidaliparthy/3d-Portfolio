import React from 'react';
import * as THREE from 'three';
import { portfolioData } from '../../data';
import { journeyCurveManager } from './JourneyCurve';
import { useJourneyStore } from '../../stores/useJourneyStore';
import {
  PlatformStationSignboard,
  PlatformStationTotem,
  RailwayClockFaceMaterial,
} from './PlatformStationSignboard';
import { ConductorCharan3D } from './ConductorCharan3D';

export const StationLandmarks: React.FC = () => {
  const tier = useJourneyStore((s) => s.tier);
  const currentStationIndex = useJourneyStore((s) => s.currentStationIndex);
  const navigatingTargetIndex = useJourneyStore((s) => s.navigatingTargetIndex);
  const stations = portfolioData.stations;

  return (
    <group name="station-landmarks">
      {stations.map((stn, idx) => {
        const isNearby =
          Math.abs(idx - currentStationIndex) <= 1 ||
          (navigatingTargetIndex !== null && Math.abs(idx - navigatingTargetIndex) <= 1);
        const isCurrent = idx === currentStationIndex;
        const t = journeyCurveManager.getStationT(idx);
        const pt = journeyCurveManager.getPointAt(t);
        const tangent = journeyCurveManager.getTangentAt(t).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(up, tangent).normalize();
        const normal = new THREE.Vector3().crossVectors(tangent, right).normalize();

        // Exact right-handed rotation matrix to align with track
        const rotMatrix = new THREE.Matrix4().makeBasis(right, normal, tangent);
        const quat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

        // Platform sits cleanly to the left of the track (-X direction in local frame)
        // Center of platform is at -3.4m, leaving a 0.8m safety clearance to the left rail
        const platformPos = pt.clone().addScaledVector(right, -3.4);

        return (
          <group
            key={stn.id}
            position={[platformPos.x, platformPos.y, platformPos.z]}
            quaternion={quat}
          >
            {/* Passenger Station Platform (Stone Paved) */}
            <mesh position={[0, 0.4, 0]} receiveShadow castShadow={tier === 'high' && isNearby}>
              <boxGeometry args={[3.4, 0.8, 18.0]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? '#334155' : '#3f3f46'}
                roughness={0.88}
                metalness={0.12}
              />
            </mesh>

            {/* Platform Tactile Warning Edge (Luminous Amber Safety Tiles) */}
            <mesh position={[1.58, 0.81, 0]}>
              <boxGeometry args={[0.24, 0.04, 18.0]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#d97706"
                emissiveIntensity={0.5}
                roughness={0.35}
              />
            </mesh>

            {/* Platform Amber Safety Underglow Strip */}
            <mesh position={[1.68, 0.4, 0]}>
              <boxGeometry args={[0.04, 0.1, 18.0]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>

            {isNearby && (
              <>
                {isCurrent && (
                  <pointLight position={[1.8, 0.4, 0]} color="#fbbf24" intensity={1.5} distance={8} />
                )}

                {/* Platform Heritage Station Brass Medallion */}
            <mesh position={[0, 0.81, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.65, 32]} />
              <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.25} />
            </mesh>

            {/* Platform Heritage Garden Planter Boxes with Colorful Blooming Flowers (rendered on active platform) */}
            {isCurrent && (
              <>
                {[-6.0, 0.0, 6.0].map((pz, pIdx) => (
                  <group key={`planter-${pIdx}`} position={[-1.4, 0.8, pz]}>
                    {/* Cedar Wood Box */}
                    <mesh position={[0, 0.22, 0]} castShadow={tier === 'high'}>
                      <boxGeometry args={[0.65, 0.44, 2.4]} />
                      <meshStandardMaterial color="#451a03" roughness={0.75} />
                    </mesh>
                    {/* Brass Corner Straps */}
                    <mesh position={[0, 0.22, 0]}>
                      <boxGeometry args={[0.67, 0.46, 0.06]} />
                      <meshStandardMaterial color="#d97706" metalness={0.8} />
                    </mesh>
                    {/* Rich Soil Bed */}
                    <mesh position={[0, 0.44, 0]}>
                      <boxGeometry args={[0.55, 0.05, 2.2]} />
                      <meshStandardMaterial color="#1c1917" roughness={0.9} />
                    </mesh>
                    {/* Lush Foliage Bush */}
                    <mesh position={[0, 0.58, 0]}>
                      <sphereGeometry args={[0.34, 12, 10]} />
                      <meshStandardMaterial color="#15803d" roughness={0.8} />
                    </mesh>
                    {/* Colorful Flower Blossoms (Golden Marigold, Lavender, Ruby Rose) */}
                    {[-0.8, -0.4, 0.0, 0.4, 0.8].map((fz, fIdx) => (
                      <group key={fIdx} position={[(fIdx % 2 === 0 ? 0.08 : -0.08), 0.72, fz]}>
                        <mesh>
                          <sphereGeometry args={[0.09, 8, 8]} />
                          <meshStandardMaterial
                            color={fIdx % 3 === 0 ? '#f59e0b' : fIdx % 3 === 1 ? '#a855f7' : '#f43f5e'}
                            roughness={0.4}
                            emissive={fIdx % 3 === 0 ? '#f59e0b' : fIdx % 3 === 1 ? '#a855f7' : '#f43f5e'}
                            emissiveIntensity={0.25}
                          />
                        </mesh>
                      </group>
                    ))}
                  </group>
                ))}

                {/* Twin Heritage Platform End Victorian Gaslamps */}
                {[-7.8, 7.8].map((lz, lIdx) => (
                  <group key={`lamp-${lIdx}`} position={[-1.2, 0.8, lz]}>
                    <mesh position={[0, 0.3, 0]}>
                      <cylinderGeometry args={[0.16, 0.24, 0.6, 12]} />
                      <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
                    </mesh>
                    <mesh position={[0, 2.2, 0]}>
                      <cylinderGeometry args={[0.07, 0.1, 3.4, 12]} />
                      <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
                    </mesh>
                    <mesh position={[0, 3.7, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
                      <meshStandardMaterial color="#d97706" metalness={0.9} />
                    </mesh>
                    <group position={[-0.6, 3.5, 0]}>
                      <mesh>
                        <cylinderGeometry args={[0.14, 0.1, 0.28, 6]} />
                        <meshStandardMaterial color="#0f172a" metalness={0.9} />
                      </mesh>
                      <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[0.12, 10, 10]} />
                        <meshBasicMaterial color="#fef08a" />
                      </mesh>
                      <pointLight color="#fef08a" intensity={1.5} distance={10} />
                    </group>
                    <group position={[0.6, 3.5, 0]}>
                      <mesh>
                        <cylinderGeometry args={[0.14, 0.1, 0.28, 6]} />
                        <meshStandardMaterial color="#0f172a" metalness={0.9} />
                      </mesh>
                      <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[0.12, 10, 10]} />
                        <meshBasicMaterial color="#fef08a" />
                      </mesh>
                      <pointLight color="#fef08a" intensity={1.5} distance={10} />
                    </group>
                  </group>
                ))}
              </>
            )}

            {/* 3D Interactive Conductor Charan on Platform (Rendered on Active Platform for Silky 120 FPS) */}
            {isCurrent && (
              <ConductorCharan3D position={[-0.1, 0.8, 0.0]} rotation={[0, Math.PI / 4, 0]} />
            )}

            {/* Platform Heritage Shelter Canopy & Ambient Lanterns */}
            <group position={[-0.8, 0.8, 0]}>
              {/* Pillars with Ornamental Iron Brackets */}
              {[-5.0, 0, 5.0].map((pz, pIdx) => (
                <group key={`col-${pIdx}`} position={[0, 0, pz]}>
                  <mesh position={[0, 1.8, 0]} castShadow={tier === 'high' && isNearby}>
                    <cylinderGeometry args={[0.08, 0.11, 3.6, 12]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
                  </mesh>
                  {/* Victorian Arch Filigree Brace */}
                  <mesh position={[0.4, 3.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
                    <boxGeometry args={[0.8, 0.04, 0.04]} />
                    <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
                  </mesh>
                </group>
              ))}

              {/* Sloped Roof Canopy with Cedar Wood Rafters */}
              <mesh position={[0.4, 3.7, 0]} rotation={[0, 0, -Math.PI / 16]} castShadow={tier === 'high' && isNearby}>
                <boxGeometry args={[2.7, 0.12, 12.4]} />
                <meshStandardMaterial color="#0b1320" roughness={0.65} metalness={0.7} />
              </mesh>
              {/* Polished Brass Roof Edge Trim */}
              <mesh position={[1.72, 3.58, 0]}>
                <boxGeometry args={[0.05, 0.08, 12.4]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* Suspended Victorian Double-Sided Railway Station Clock */}
              <group position={[0.4, 3.2, 0]}>
                {/* Hanging Brass Rod */}
                <mesh position={[0, 0.22, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.9} />
                </mesh>
                {/* Clock Housing */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <cylinderGeometry args={[0.32, 0.32, 0.14, 24]} />
                  <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.25} />
                </mesh>
                {/* Brass Outer Bezel */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <torusGeometry args={[0.32, 0.025, 8, 32]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
                </mesh>
                {/* Clock Face Front */}
                <mesh position={[0, 0, 0.072]}>
                  <circleGeometry args={[0.29, 24]} />
                  <RailwayClockFaceMaterial />
                </mesh>
                {/* Clock Face Back */}
                <mesh position={[0, 0, -0.072]} rotation={[0, Math.PI, 0]}>
                  <circleGeometry args={[0.29, 24]} />
                  <RailwayClockFaceMaterial />
                </mesh>
              </group>

              {/* Warm Canopy Lantern Lamps with Cast Light */}
              {[-3.0, 3.0].map((lz, lIdx) => (
                <group key={lIdx} position={[0.4, 3.4, lz]}>
                  <mesh>
                    <sphereGeometry args={[0.16, 12, 12]} />
                    <meshBasicMaterial color="#fef08a" />
                  </mesh>
                  {isNearby && <pointLight color="#fef08a" intensity={2.0} distance={10} />}
                </group>
              ))}
            </group>

            {/* Platform Passenger Waiting Benches */}
            {isCurrent && [-1.8, 1.8].map((bz, bIdx) => (
              <group key={bIdx} position={[-0.8, 0.8, bz]}>
                {/* Wood seat */}
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[0.55, 0.06, 1.6]} />
                  <meshStandardMaterial color="#78350f" roughness={0.7} />
                </mesh>
                {/* Wood backrest */}
                <mesh position={[-0.24, 0.65, 0]}>
                  <boxGeometry args={[0.06, 0.45, 1.6]} />
                  <meshStandardMaterial color="#78350f" roughness={0.7} />
                </mesh>
                {/* Cast-iron legs */}
                <mesh position={[0, 0.17, -0.7]}>
                  <boxGeometry args={[0.5, 0.35, 0.06]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.17, 0.7]}>
                  <boxGeometry args={[0.5, 0.35, 0.06]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.8} />
                </mesh>
              </group>
            ))}

            {/* Upgraded Procedural Railway Platform Signboard (Crisp dynamic typography & overhead brass lamps) */}
            <PlatformStationSignboard station={stn} index={idx} tier={tier} />

            {/* Upgraded Platform Conductor Information Totem (Live departure timetable display) */}
            {isCurrent && <PlatformStationTotem station={stn} index={idx} tier={tier} />}

            {/* ============================================================== */}
            {/* PER-STATION ARCHITECTURAL MILESTONE MONUMENTS (12 STATIONS)    */}
            {/* ============================================================== */}

            {/* Station 01: ORIGIN RAILWAY STATION CONCOURSE & TRAIN SHED       */}
            {stn.id === 'station-01-about-me' && (
              <group position={[0, 0, 0]}>
                {/* 1. Grand Victorian Steel Arched Train Shed Canopies spanning over track & platform */}
                {[-6.0, 0, 6.0].map((zPos, idx) => (
                  <group key={idx} position={[1.7, 0, zPos]}>
                    {/* Arch rib */}
                    <mesh position={[0, 4.8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={tier === 'high'}>
                      <torusGeometry args={[5.2, 0.16, 8, 24, Math.PI]} />
                      <meshStandardMaterial color="#0f291e" metalness={0.85} roughness={0.25} />
                    </mesh>
                    {/* Support Columns on far side of track */}
                    <mesh position={[5.2, 2.4, 0]}>
                      <cylinderGeometry args={[0.14, 0.16, 4.8, 12]} />
                      <meshStandardMaterial color="#0f291e" metalness={0.85} />
                    </mesh>
                    {/* Lanterns suspended from center of shed */}
                    <group position={[0, 4.8, 0]}>
                      <mesh>
                        <sphereGeometry args={[0.2, 12, 12]} />
                        <meshBasicMaterial color="#fef08a" />
                      </mesh>
                      {isCurrent && <pointLight color="#fef08a" intensity={2.0} distance={15} />}
                    </group>
                  </group>
                ))}

                {/* Platform Luggage Trolley with Stacked Vintage Leather Trunks */}
                <group position={[-0.9, 0.8, -4.2]}>
                  <mesh position={[0, 0.12, 0]}>
                    <boxGeometry args={[0.9, 0.08, 1.4]} />
                    <meshStandardMaterial color="#78350f" roughness={0.6} />
                  </mesh>
                  <mesh position={[-0.45, 0.08, -0.5]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.06, 12]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} />
                  </mesh>
                  <mesh position={[0.45, 0.08, -0.5]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.06, 12]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} />
                  </mesh>
                  <mesh position={[-0.45, 0.08, 0.5]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.06, 12]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} />
                  </mesh>
                  <mesh position={[0.45, 0.08, 0.5]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.06, 12]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} />
                  </mesh>
                  <mesh position={[0, 0.32, -0.1]}>
                    <boxGeometry args={[0.7, 0.32, 1.0]} />
                    <meshStandardMaterial color="#92400e" roughness={0.5} />
                  </mesh>
                  <mesh position={[0, 0.58, -0.1]}>
                    <boxGeometry args={[0.55, 0.22, 0.8]} />
                    <meshStandardMaterial color="#b45309" roughness={0.5} />
                  </mesh>
                </group>

                {/* Hanging Double-Sided Railway Station Clock */}
                <group position={[1.7, 4.6, 0]}>
                  <mesh position={[0, 0.6, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.9} />
                  </mesh>
                  {/* Clock body */}
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.65, 0.65, 0.25, 24]} />
                    <meshStandardMaterial color="#0a2318" metalness={0.8} />
                  </mesh>
                  {/* Clock Face 1 (Towards Train arrival) */}
                  <mesh position={[0, 0, 0.13]}>
                    <circleGeometry args={[0.55, 24]} />
                    <RailwayClockFaceMaterial />
                  </mesh>
                  {/* Clock Face 2 */}
                  <mesh position={[0, 0, -0.13]} rotation={[0, Math.PI, 0]}>
                    <circleGeometry args={[0.55, 24]} />
                    <RailwayClockFaceMaterial />
                  </mesh>
                </group>

                {/* Track 01 Departure Signal Lantern */}
                <group position={[3.6, 0.8, 8.5]}>
                  <mesh position={[0, 1.5, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 3.0, 10]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.9} />
                  </mesh>
                  {/* Signal Box */}
                  <mesh position={[0, 2.7, 0]}>
                    <boxGeometry args={[0.3, 0.6, 0.3]} />
                    <meshStandardMaterial color="#0a0f18" roughness={0.3} />
                  </mesh>
                  {/* Green Light */}
                  <mesh position={[0, 2.8, -0.16]}>
                    <sphereGeometry args={[0.1, 12, 12]} />
                    <meshBasicMaterial color="#10b981" />
                  </mesh>
                  <pointLight position={[0, 2.8, -0.2]} color="#10b981" intensity={2.5} distance={8} />
                </group>

                {/* Main Concourse Terminal Building & Grand Clocktower behind platform */}
                <group position={[-9.5, 0, 0]}>
                  <mesh position={[0, 6.0, 0]} castShadow={tier === 'high'}>
                    <boxGeometry args={[4.2, 12.0, 22.0]} />
                    <meshStandardMaterial color="#0f291e" roughness={0.65} metalness={0.3} />
                  </mesh>
                  {/* Illuminated Stained Glass Concourse Windows */}
                  <mesh position={[2.15, 5.0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <planeGeometry args={[16.0, 7.5]} />
                    <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} />
                  </mesh>
                  {/* Station Clock Tower */}
                  <mesh position={[0, 15.0, 0]} castShadow={tier === 'high'}>
                    <boxGeometry args={[3.2, 6.0, 3.2]} />
                    <meshStandardMaterial color="#05140e" metalness={0.8} />
                  </mesh>
                  {/* Station Clock */}
                  <mesh position={[1.65, 15.0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <circleGeometry args={[1.1, 24]} />
                    <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                  </mesh>
                </group>
              </group>
            )}

            {/* Station 02: Narayana Junior College (97.8% MPC) */}
            {stn.id === 'station-02-narayana' && (
              <group position={[-9.0, 0, 0]}>
                <mesh position={[0, 4.5, 0]} castShadow={tier === 'high'}>
                  <boxGeometry args={[4.0, 9.0, 16.0]} />
                  <meshStandardMaterial color="#334155" roughness={0.6} />
                </mesh>
                {[-5.0, -2.5, 2.5, 5.0].map((z, i) => (
                  <mesh key={i} position={[2.2, 3.5, z]} castShadow={tier === 'high'}>
                    <cylinderGeometry args={[0.35, 0.4, 7.0, 16]} />
                    <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
                  </mesh>
                ))}
                <mesh position={[2.05, 7.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <circleGeometry args={[1.2, 24]} />
                  <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
                </mesh>
              </group>
            )}

            {/* Station 03: SASTRA University ICT Academic Colonnade */}
            {stn.id === 'station-03-sastra' && (
              <group position={[-8.5, 0, 0]}>
                {[-4.0, -1.5, 1.5, 4.0].map((z, i) => (
                  <mesh key={i} position={[0, 4.0, z]} castShadow={tier === 'high'}>
                    <cylinderGeometry args={[0.5, 0.55, 8.0, 16]} />
                    <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
                  </mesh>
                ))}
                <mesh position={[0, 8.4, 0]} castShadow={tier === 'high'}>
                  <boxGeometry args={[3.5, 1.2, 11.0]} />
                  <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
                </mesh>
                <mesh position={[1.8, 8.4, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <circleGeometry args={[1.1, 24]} />
                  <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
                </mesh>
              </group>
            )}

            {/* Station 04: Leadership & Clubs (President Maths Club & Robotics) */}
            {stn.id === 'station-04-leadership' && (
              <group position={[-9.0, 0, 0]}>
                <mesh position={[0, 1.2, 0]} castShadow={tier === 'high'}>
                  <cylinderGeometry args={[5.0, 5.5, 2.4, 24]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.6} />
                </mesh>
                <mesh position={[0, 4.8, 0]} castShadow={tier === 'high'}>
                  <torusGeometry args={[3.5, 0.35, 12, 24]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.8} />
                </mesh>
                <mesh position={[0, 4.8, 0]}>
                  <cylinderGeometry args={[1.2, 1.2, 0.4, 12]} />
                  <meshStandardMaterial color="#0284c7" metalness={0.9} />
                </mesh>
              </group>
            )}

            {/* Station 05: GeoAI Drone Outpost (Nacala 17,954 Buildings) */}
            {stn.id === 'station-05-drone-rooftop' && (
              <group position={[-9.5, 0, 0]}>
                <mesh position={[0, 1.2, 0]} castShadow={tier === 'high'}>
                  <cylinderGeometry args={[4.5, 5.0, 2.4, 24]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.7} />
                </mesh>
                <mesh position={[0, 2.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[2.4, 2.8, 24]} />
                  <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 6.0, 0]}>
                  <cylinderGeometry args={[0.15, 0.25, 7.5, 12]} />
                  <meshStandardMaterial color="#475569" metalness={0.8} />
                </mesh>
                <group position={[0, 7.8, 0]}>
                  <mesh>
                    <boxGeometry args={[1.6, 0.25, 1.6]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} />
                  </mesh>
                  <mesh position={[0, -0.2, 0]}>
                    <sphereGeometry args={[0.2, 12, 12]} />
                    <meshBasicMaterial color="#ef4444" />
                  </mesh>
                  <pointLight position={[0, -0.2, 0]} color="#ef4444" intensity={3.0} distance={10} />
                </group>
              </group>
            )}

            {/* Station 06: IIT ISM Dhanbad High Alpine Seismic Station (SNOWY PASS) */}
            {stn.id === 'station-06-iit-dhanbad-seismic' && (
              <group position={[-9.5, 0, 0]}>
                <mesh position={[0, 3.5, 0]} castShadow={tier === 'high'}>
                  <boxGeometry args={[5.2, 7.0, 7.0]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
                </mesh>
                <mesh position={[0, 7.4, 0]} rotation={[0, 0, Math.PI / 4]} castShadow={tier === 'high'}>
                  <boxGeometry args={[4.2, 4.2, 7.4]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.9} />
                </mesh>
                <mesh position={[2.7, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <planeGeometry args={[5.0, 3.2]} />
                  <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 10.5, 0]}>
                  <sphereGeometry args={[0.4, 16, 16]} />
                  <meshBasicMaterial color="#38bdf8" />
                </mesh>
                <pointLight position={[0, 10.5, 0]} color="#38bdf8" intensity={4.5} distance={15} />
              </group>
            )}

            {/* Station 07: Expense Tracker (Next.js + Turso SQLite Viaduct Hub) */}
            {stn.id === 'station-07-expense-tracker' && (
              <group position={[-8.5, 0, 0]}>
                <mesh position={[0, 4.5, 0]} castShadow={tier === 'high'}>
                  <boxGeometry args={[3.2, 9.0, 3.2]} />
                  <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.95} />
                </mesh>
                <mesh position={[1.62, 4.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <planeGeometry args={[2.8, 8.2]} />
                  <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
                </mesh>
              </group>
            )}

            {/* Station 08: Resume Agent (Cloudflare Workers AI Llama 3.3 70B) */}
            {stn.id === 'station-08-resume-agent' && (
              <group position={[-8.5, 0, 0]}>
                <mesh position={[0, 5.0, 0]} castShadow={tier === 'high'}>
                  <cylinderGeometry args={[1.2, 2.0, 10.0, 16]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[0, 10.4, 0]}>
                  <sphereGeometry args={[0.9, 16, 16]} />
                  <meshBasicMaterial color="#f97316" />
                </mesh>
                <pointLight position={[0, 10.4, 0]} color="#f97316" intensity={4.0} distance={16} />
              </group>
            )}

            {/* Station 09: AI Technical Interview Coach (Next.js + FastAPI + Groq) */}
            {stn.id === 'station-09-ai-interviewer' && (
              <group position={[-8.5, 0, 0]}>
                <mesh position={[0, 4.0, 0]} castShadow={tier === 'high'}>
                  <cylinderGeometry args={[2.8, 3.2, 8.0, 16]} />
                  <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.9} />
                </mesh>
                <mesh position={[0, 8.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[2.4, 0.12, 12, 24]} />
                  <meshBasicMaterial color="#a855f7" />
                </mesh>
                <pointLight position={[0, 8.8, 0]} color="#a855f7" intensity={4.0} distance={14} />
              </group>
            )}

            {/* Station 10: National AI/ML Hackathon 2026 Finalist */}
            {stn.id === 'station-10-hackathon-finalist' && (
              <group position={[-8.5, 0, 0]}>
                <mesh position={[0, 2.0, 0]} castShadow={tier === 'high'}>
                  <cylinderGeometry args={[4.5, 4.5, 0.8, 16]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.6} />
                </mesh>
                <mesh position={[0, 5.2, 0]} castShadow={tier === 'high'}>
                  <cylinderGeometry args={[0.6, 1.4, 5.6, 12]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
                </mesh>
                <mesh position={[0, 8.4, 0]}>
                  <octahedronGeometry args={[1.2, 0]} />
                  <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={0.8} />
                </mesh>
              </group>
            )}

            {/* Station 11: Industry Certifications & Hackathons */}
            {stn.id === 'station-11-certifications' && (
              <group position={[-8.5, 0, 0]}>
                <mesh position={[0, 2.5, 0]} castShadow={tier === 'high'}>
                  <cylinderGeometry args={[4.0, 4.4, 5.0, 24]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.6} />
                </mesh>
                {[0, 1, 2].map((lvl) => (
                  <mesh key={lvl} position={[0, 5.2 + lvl * 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2.8 - lvl * 0.6, 0.1, 12, 24]} />
                    <meshBasicMaterial color="#38bdf8" />
                  </mesh>
                ))}
              </group>
            )}

            {/* Station 12: HYDERABAD GRAND CENTRAL TERMINUS & END-OF-TRACK BUFFERS */}
            {stn.id === 'station-12-terminus' && (
              <group position={[0, 0, 0]}>
                {/* 1. Heavy Railway Buffer Stops at the end of track (+Z = 7.5m) */}
                <group position={[3.4, 0, 7.5]}>
                  {/* Steel bumper beam */}
                  <mesh position={[0, 0.75, 0]} castShadow={tier === 'high'}>
                    <boxGeometry args={[2.2, 0.5, 0.6]} />
                    <meshStandardMaterial color="#b91c1c" roughness={0.4} metalness={0.8} />
                  </mesh>
                  {/* Buffer Stop Pillars anchored to ground */}
                  <mesh position={[-0.75, 0.4, 0.2]}>
                    <boxGeometry args={[0.25, 0.8, 0.8]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.9} />
                  </mesh>
                  <mesh position={[0.75, 0.4, 0.2]}>
                    <boxGeometry args={[0.25, 0.8, 0.8]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.9} />
                  </mesh>
                  {/* Red Stop Warning Lamp */}
                  <mesh position={[0, 1.25, 0]}>
                    <sphereGeometry args={[0.15, 12, 12]} />
                    <meshBasicMaterial color="#ef4444" />
                  </mesh>
                  <pointLight position={[0, 1.25, 0]} color="#ef4444" intensity={3.0} distance={10} />
                </group>

                {/* 2. Grand Terminus Glass Train Shed Ribs spanning overhead */}
                {[-6.0, 0, 6.0].map((zPos, idx) => (
                  <group key={idx} position={[1.7, 0, zPos]}>
                    <mesh position={[0, 5.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={tier === 'high'}>
                      <torusGeometry args={[5.6, 0.2, 8, 24, Math.PI]} />
                      <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
                    </mesh>
                    <mesh position={[5.6, 2.8, 0]}>
                      <cylinderGeometry args={[0.16, 0.18, 5.6, 12]} />
                      <meshStandardMaterial color="#1e293b" metalness={0.8} />
                    </mesh>
                    <group position={[0, 5.5, 0]}>
                      <mesh>
                        <sphereGeometry args={[0.24, 12, 12]} />
                        <meshBasicMaterial color="#fbbf24" />
                      </mesh>
                      <pointLight color="#fbbf24" intensity={tier === 'low' ? 2.5 : 4.5} distance={18} />
                    </group>
                  </group>
                ))}

                {/* 3. Grand Arched Terminal Concourse Building & Clock Tower */}
                <group position={[-12.0, 0, 0]}>
                  <mesh position={[0, 9.0, 0]} castShadow={tier === 'high'}>
                    <boxGeometry args={[4.5, 18.0, 24.0]} />
                    <meshStandardMaterial color="#05140e" roughness={0.4} metalness={0.7} />
                  </mesh>
                  {/* Glowing Grand Concourse Window Portal */}
                  <mesh position={[2.3, 7.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <planeGeometry args={[18.0, 11.0]} />
                    <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} />
                  </mesh>
                  {/* Grand Clock Tower */}
                  <mesh position={[0, 20.0, 0]} castShadow={tier === 'high'}>
                    <boxGeometry args={[3.6, 6.0, 3.6]} />
                    <meshStandardMaterial color="#d97706" metalness={0.8} />
                  </mesh>
                  <mesh position={[1.85, 20.0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <circleGeometry args={[1.2, 24]} />
                    <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
                  </mesh>
                </group>
              </group>
            )}
              </>
            )}
          </group>
        );
      })}
    </group>
  );
};
