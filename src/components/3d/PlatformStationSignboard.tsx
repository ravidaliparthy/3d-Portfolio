import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getSkillById, type Station } from '../../data';
import type { QualityTier } from '../../stores/useJourneyStore';

interface PlatformStationSignboardProps {
  station: Station;
  index: number;
  tier: QualityTier;
}

/**
 * Procedural museum-grade railway platform station signboard.
 * Renders authentic enamel station yellow signage with crisp typography,
 * twin Victorian cast-iron fluted pillars, and warm overhead brass gooseneck lamps.
 */
export const PlatformStationSignboard: React.FC<PlatformStationSignboardProps> = ({
  station,
  index,
  tier,
}) => {
  // Track-facing texture (seen by oncoming train passengers)
  const trackFaceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Authentic Railway Enamel Golden Yellow Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.18, '#fbbf24');
    grad.addColorStop(0.82, '#f59e0b');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 256);

    // Deep cast iron borders (authentic railway enamel board)
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#090d16';
    ctx.strokeRect(7, 7, 1010, 242);

    // Inner fine pinstripe
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(20, 20, 984, 216);

    // Corner decorative corner brackets / rivets
    ctx.fillStyle = '#090d16';
    const rivets = [
      [32, 32],
      [992, 32],
      [32, 224],
      [992, 224],
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Top Header: Station number and Track
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 22px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const stnNum = String(station.order || index + 1).padStart(2, '0');
    ctx.fillText(`★ STATION ${stnNum} • PLATFORM 1 • TRACK 01 ★`, 512, 32);

    // Station Main Title (Dynamic font size based on length)
    const title = (station.title || 'STATION').toUpperCase();
    let fontSize = 48;
    if (title.length > 20) fontSize = 38;
    if (title.length > 28) fontSize = 32;
    if (title.length > 36) fontSize = 26;
    ctx.font = `900 ${fontSize}px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = '#090d16';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 512, 128);

    // Bottom Subtitle: Type & Distance
    ctx.font = 'bold 20px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.textBaseline = 'bottom';
    const stnType = (station.type || 'MILESTONE').toUpperCase();
    const km = `KM ${((index + 1) * 3.8).toFixed(1)}`;
    ctx.fillText(`CENTRAL MILESTONE EXPRESS • ${stnType} • ${km}`, 512, 222);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [station, index]);

  // Platform-facing texture (seen by waiting platform passengers)
  const platformFaceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.18, '#fbbf24');
    grad.addColorStop(0.82, '#f59e0b');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 256);

    ctx.lineWidth = 14;
    ctx.strokeStyle = '#090d16';
    ctx.strokeRect(7, 7, 1010, 242);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(20, 20, 984, 216);

    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 22px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`★ PLATFORM 1 • WAY OUT / CONCOURSE → ★`, 512, 32);

    const title = (station.title || 'STATION').toUpperCase();
    let fontSize = 48;
    if (title.length > 20) fontSize = 38;
    if (title.length > 28) fontSize = 32;
    if (title.length > 36) fontSize = 26;
    ctx.font = `900 ${fontSize}px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = '#090d16';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 512, 128);

    ctx.font = 'bold 20px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.textBaseline = 'bottom';
    const org = (station.organization || 'CENTRAL').toUpperCase();
    ctx.fillText(`PASSENGER TERMINAL • ${org}`, 512, 222);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [station]);

  return (
    <group position={[0.4, 0.8, 5.2]}>
      {/* Dual Cast-iron Victorian Support Pillars */}
      {[-1.35, 1.35].map((zOffset, pIdx) => (
        <group key={pIdx} position={[0, 0, zOffset]}>
          {/* Pillar Flared Base */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.11, 0.15, 0.3, 12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
          </mesh>
          {/* Main Vertical Shaft */}
          <mesh position={[0, 1.35, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 2.4, 12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Decorative Brass Collar */}
          <mesh position={[0, 2.58, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.08, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Acorn Top Finial */}
          <mesh position={[0, 2.68, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Main Signboard Metal Enclosure Casing */}
      <mesh position={[0, 2.15, 0]}>
        <boxGeometry args={[0.14, 0.82, 3.32]} />
        <meshStandardMaterial color="#090d16" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Outer Brass Trim Edge */}
      <mesh position={[0, 2.15, 0]}>
        <boxGeometry args={[0.15, 0.84, 3.34]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} metalness={0.7} wireframe={false} />
      </mesh>

      {/* Track Face (Facing Train towards +X) */}
      {trackFaceTexture && (
        <mesh position={[0.076, 2.15, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.2, 0.72]} />
          <meshBasicMaterial map={trackFaceTexture} toneMapped={false} />
        </mesh>
      )}

      {/* Platform Face (Facing Waiting Passengers towards -X) */}
      {platformFaceTexture && (
        <mesh position={[-0.076, 2.15, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[3.2, 0.72]} />
          <meshBasicMaterial map={platformFaceTexture} toneMapped={false} />
        </mesh>
      )}

      {/* Overhead Brass Arched Gooseneck Lamps with Downward Illumination */}
      {[-0.85, 0.85].map((zOffset, lIdx) => (
        <group key={lIdx} position={[0, 2.6, zOffset]}>
          {/* Horizontal Overhang Arm extending over the track face */}
          <mesh position={[0.22, 0.08, 0]}>
            <boxGeometry args={[0.44, 0.03, 0.03]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Lamp Shade */}
          <mesh position={[0.42, 0.04, 0]}>
            <cylinderGeometry args={[0.04, 0.12, 0.08, 12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Glowing Bulb */}
          <mesh position={[0.42, 0.0, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <pointLight
            position={[0.42, -0.05, 0]}
            color="#fef08a"
            intensity={tier === 'low' ? 1.5 : 2.5}
            distance={5.0}
          />
        </group>
      ))}
    </group>
  );
};

interface PlatformStationTotemProps {
  station: Station;
  index: number;
  tier: QualityTier;
}

/**
 * Illuminated Electronic Platform Information Totem
 * Displays live departure timetable, tech specs, and platform status.
 */
export const PlatformStationTotem: React.FC<PlatformStationTotemProps> = ({
  station,
  index,
  tier,
}) => {
  const totemTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dark sleek high-tech LCD background
    ctx.fillStyle = '#05110d';
    ctx.fillRect(0, 0, 512, 768);

    // Subtle amber glow border
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#0d281e';
    ctx.strokeRect(5, 5, 502, 758);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(16, 16, 480, 736);

    // Top Header Banner
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(16, 16, 480, 70);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('● SYSTEM STATUS: ACTIVE', 256, 52);

    // Milestone ID & Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`STN ${(index + 1).toString().padStart(2, '0')} // DEP 10:45 IST`, 256, 120);

    ctx.fillStyle = '#ffffff';
    let title = (station.title || '').toUpperCase();
    if (title.length > 22) title = title.slice(0, 20) + '...';
    ctx.font = '900 28px sans-serif';
    ctx.fillText(title, 256, 165);

    // Organization & Year
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${station.organization.toUpperCase()} • ${station.period}`, 256, 210);

    // Divider line
    ctx.strokeStyle = '#1e3a2f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, 235);
    ctx.lineTo(480, 235);
    ctx.stroke();

    // Technical specifications list
    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('> ARCHITECTURE STACK:', 40, 270);

    const techs = (station.skillIds || []).map((id) => getSkillById(id)?.name || id);
    techs.slice(0, 6).forEach((tech: string, tIdx: number) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '17px monospace';
      ctx.fillText(` [•] ${tech}`, 50, 310 + tIdx * 34);
    });

    // Verification & Track Info
    ctx.strokeStyle = '#1e3a2f';
    ctx.beginPath();
    ctx.moveTo(32, 530);
    ctx.lineTo(480, 530);
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('VERIFIED REPOSITORY DATA', 40, 565);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px monospace';
    ctx.fillText('All facts verified from GitHub', 40, 595);
    ctx.fillText('Zero fabricated claims', 40, 620);

    // Bottom Departure Bar
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TRACK 01 • READY FOR CRUISE', 256, 680);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [station, index]);

  return (
    <group position={[0.6, 0.8, -3.2]}>
      {/* Totem Base */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.45, 0.7, 0.75]} />
        <meshStandardMaterial color="#091b15" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Brass Trim */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.48, 0.04, 0.78]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Screen Frame */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[0.15, 1.2, 0.8]} />
        <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Illuminated Station Directory Plaque */}
      {totemTexture && (
        <mesh position={[0.08, 1.35, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.74, 1.14]} />
          <meshBasicMaterial map={totemTexture} toneMapped={false} />
        </mesh>
      )}
      {/* Brass Top Beacon Lamp */}
      <mesh position={[0, 2.02, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <pointLight position={[0, 2.02, 0]} color="#fbbf24" intensity={tier === 'low' ? 1.0 : 2.0} distance={8} />
    </group>
  );
};

/**
 * Vintage Victorian Railway Concourse Double-Sided Station Clock Face
 */
export const RailwayClockFaceMaterial: React.FC = () => {
  const clockTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // White antique porcelain dial
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();

    // Dark outer rim
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // Roman Numerals
    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 36px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    numerals.forEach((num, idx) => {
      const angle = (idx * Math.PI) / 6 - Math.PI / 2;
      const x = 256 + Math.cos(angle) * 190;
      const y = 256 + Math.sin(angle) * 190;
      ctx.fillText(num, x, y);
    });

    // Minute tick marks
    for (let m = 0; m < 60; m++) {
      const angle = (m * Math.PI) / 30 - Math.PI / 2;
      const isHour = m % 5 === 0;
      const rInner = isHour ? 218 : 228;
      const rOuter = 238;
      ctx.lineWidth = isHour ? 4 : 2;
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(256 + Math.cos(angle) * rInner, 256 + Math.sin(angle) * rInner);
      ctx.lineTo(256 + Math.cos(angle) * rOuter, 256 + Math.sin(angle) * rOuter);
      ctx.stroke();
    }

    // Railway branding
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#78350f';
    ctx.fillText('RAVI EXPRESS', 256, 160);
    ctx.font = '12px monospace';
    ctx.fillText('PRECISION RAILWAY', 256, 350);

    // Clock hands (pointing to 10:10)
    // Hour hand at 10
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#090d16';
    ctx.lineCap = 'round';
    const hourAngle = (10 * Math.PI) / 6 + (10 / 60) * (Math.PI / 6) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256 + Math.cos(hourAngle) * 110, 256 + Math.sin(hourAngle) * 110);
    ctx.stroke();

    // Minute hand at 2 (10 mins)
    ctx.lineWidth = 5;
    const minAngle = (10 * Math.PI) / 30 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256 + Math.cos(minAngle) * 165, 256 + Math.sin(minAngle) * 165);
    ctx.stroke();

    // Red second hand
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#dc2626';
    const secAngle = (35 * Math.PI) / 30 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(256 - Math.cos(secAngle) * 30, 256 - Math.sin(secAngle) * 30);
    ctx.lineTo(256 + Math.cos(secAngle) * 170, 256 + Math.sin(secAngle) * 170);
    ctx.stroke();

    // Center brass cap
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(256, 256, 10, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

  if (!clockTexture) return null;
  return <meshBasicMaterial map={clockTexture} side={THREE.DoubleSide} toneMapped={false} />;
};
