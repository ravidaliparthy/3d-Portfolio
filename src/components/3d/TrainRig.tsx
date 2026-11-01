import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import * as easing from 'maath/easing';
import { journeyCurveManager } from './JourneyCurve';
import { useJourneyStore, type CameraPresetView } from '../../stores/useJourneyStore';
import { useViewport } from '../../hooks/useViewport';

const PRESET_SPECS: Record<
  CameraPresetView,
  {
    fov: number;
    damping: number;
    uiSafeOffset: number;
    yawClamp: [number, number];
    pitchClamp: [number, number];
  }
> = {
  chase: {
    fov: 44,
    damping: 0.12,
    uiSafeOffset: 0.20,
    yawClamp: [-1.1, 1.1],
    pitchClamp: [-0.45, 0.7],
  },
  cab: {
    fov: 56,
    damping: 0.12,
    uiSafeOffset: 0.0,
    yawClamp: [-0.6, 0.6],
    pitchClamp: [-0.25, 0.35],
  },
  window: {
    fov: 48,
    damping: 0.15,
    uiSafeOffset: 0.22,
    yawClamp: [-0.75, 0.75],
    pitchClamp: [-0.35, 0.45],
  },
  aerial: {
    fov: 36,
    damping: 0.10,
    uiSafeOffset: 0.25,
    yawClamp: [-Math.PI, Math.PI],
    pitchClamp: [-0.85, -0.1],
  },
  station: {
    fov: 42,
    damping: 0.12,
    uiSafeOffset: 0.28,
    yawClamp: [-1.4, 1.4],
    pitchClamp: [-0.35, 0.5],
  },
};

function getSteamCircleTexture(): THREE.Texture {
  if (typeof document === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.08)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

export const TrainRig: React.FC = () => {
  const steamCircleMap = useMemo(() => getSteamCircleTexture(), []);
  const locoRef = useRef<THREE.Group>(null);
  const coachRef = useRef<THREE.Group>(null);
  const couplerRef = useRef<THREE.Group>(null);
  const locoWheelsRef = useRef<THREE.Group>(null);
  const coachWheelsRef = useRef<THREE.Group>(null);
  const sideRodsRef = useRef<THREE.Group>(null);
  const exhaustPointsRef = useRef<THREE.Points>(null);

  const { camera, gl } = useThree();
  const { isPortrait, aspect, prefersReducedMotion } = useViewport();

  const tier = useJourneyStore((s) => s.tier);
  const cameraPreset = useJourneyStore((s) => s.cameraPreset);

  // Imperative progress tracking to prevent 60fps React component re-rendering
  const progressRef = useRef(useJourneyStore.getState().progress);
  const lastProgress = useRef(progressRef.current);
  const lastDispatchedProgress = useRef(progressRef.current);
  const lastDispatchedTime = useRef(0);

  const currentLookAt = useRef(new THREE.Vector3());
  const cameraTargetPos = useRef(new THREE.Vector3());
  const wheelAngle = useRef(0);

  // Free-look interactive state
  const freeLookYaw = useRef(0);
  const freeLookPitch = useRef(0);
  const freeLookZoom = useRef(1.0);
  const lastInteractionTime = useRef(performance.now());
  const stageOffsetRef = useRef(0);
  const targetStageOffsetRef = useRef(0);
  const currentFovRef = useRef(44);

  // Smooth 2.5-second cinematic station transit interpolator (ease-in-out cubic)
  const travelAnimRef = useRef<{
    active: boolean;
    startProgress: number;
    targetProgress: number;
    startTime: number;
    duration: number;
  }>({
    active: false,
    startProgress: 0,
    targetProgress: 0,
    startTime: 0,
    duration: 2500, // 2.5 seconds guaranteed travel time
  });



  // Canvas Drag & Touch Pinch Zoom Controller (Canvas Only)
  useEffect(() => {
    const dom = gl.domElement;
    const activePointers = new Map<number, { x: number; y: number }>();
    let initialPinchDist = 0;
    let initialZoom = 1.0;

    const onPointerDown = (e: PointerEvent) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      lastInteractionTime.current = performance.now();
      if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        initialZoom = freeLookZoom.current;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activePointers.has(e.pointerId)) return;
      const prev = activePointers.get(e.pointerId)!;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      lastInteractionTime.current = performance.now();

      if (activePointers.size === 1) {
        // One-finger or mouse drag: free-look yaw and pitch with preset clamping
        const spec = PRESET_SPECS[useJourneyStore.getState().cameraPreset] || PRESET_SPECS.chase;
        const sensitivity = 0.0035;
        freeLookYaw.current = Math.max(
          spec.yawClamp[0],
          Math.min(spec.yawClamp[1], freeLookYaw.current - dx * sensitivity)
        );
        freeLookPitch.current = Math.max(
          spec.pitchClamp[0],
          Math.min(spec.pitchClamp[1], freeLookPitch.current - dy * sensitivity)
        );
      } else if (activePointers.size === 2) {
        // Two-finger pinch: zoom
        const pts = Array.from(activePointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (initialPinchDist > 0 && dist > 10) {
          const factor = initialPinchDist / dist;
          freeLookZoom.current = Math.max(0.75, Math.min(1.3, initialZoom * factor));
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [gl]);

  // Steam exhaust particles
  const particleCount = tier === 'low' ? 20 : 48;
  const exhaustData = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const life = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      life[i] = i / particleCount;
      pos[i * 3] = (Math.random() - 0.5) * 0.15;
      pos[i * 3 + 1] = 2.6 + life[i] * 1.8;
      pos[i * 3 + 2] = 2.4 - life[i] * 2.8;
    }
    return { pos, life };
  }, [particleCount]);

  useFrame((_, delta) => {
    // 1. Silky-smooth 2-3s cubic station travel transition
    const store = useJourneyStore.getState();
    const targetProgress = store.targetProgress;
    const isProgrammaticNav = store.navigatingTargetIndex !== null;
    const isDirectInput = (performance.now() - store.lastDirectInputTime < 800) || !isProgrammaticNav;

    // Detect when navigating programmatically to a new station to begin smooth cinematic 2-3s transit
    if (isProgrammaticNav && Math.abs(targetProgress - progressRef.current) > 0.0001) {
      if (!travelAnimRef.current.active || Math.abs(travelAnimRef.current.targetProgress - targetProgress) > 0.0001) {
        // Guaranteed travel time strictly between 2.2 and 2.8 seconds (2-3 sec target)
        const travelDist = Math.abs(targetProgress - progressRef.current);
        const calcDuration = Math.min(2800, Math.max(2200, 2200 + travelDist * 900));
        travelAnimRef.current = {
          active: true,
          startProgress: progressRef.current,
          targetProgress: targetProgress,
          startTime: performance.now(),
          duration: calcDuration,
        };
      }
    }

    let nextProgress = progressRef.current;
    if (isDirectInput) {
      travelAnimRef.current.active = false;
      nextProgress = THREE.MathUtils.damp(progressRef.current, targetProgress, 16.0, delta);
    } else if (travelAnimRef.current.active) {
      const elapsed = performance.now() - travelAnimRef.current.startTime;
      const progressRatio = Math.min(1.0, elapsed / travelAnimRef.current.duration);

      // Smooth ease-in-out cubic curve (gentle departure, smooth cruising, gentle braking)
      const eased = progressRatio < 0.5
        ? 4 * progressRatio * progressRatio * progressRatio
        : 1 - Math.pow(-2 * progressRatio + 2, 3) / 2;

      nextProgress = THREE.MathUtils.lerp(
        travelAnimRef.current.startProgress,
        travelAnimRef.current.targetProgress,
        eased
      );

      if (progressRatio >= 1.0) {
        nextProgress = travelAnimRef.current.targetProgress;
        travelAnimRef.current.active = false;
        const targetIdx = useJourneyStore.getState().navigatingTargetIndex;
        if (targetIdx !== null) {
          useJourneyStore.getState().onStationArrived(targetIdx);
        }
      }
    } else {
      nextProgress = targetProgress;
      const targetIdx = useJourneyStore.getState().navigatingTargetIndex;
      if (targetIdx !== null && Math.abs(progressRef.current - targetProgress) < 0.001) {
        useJourneyStore.getState().onStationArrived(targetIdx);
      }
    }

    const vel = (nextProgress - lastProgress.current) / (delta || 0.016);
    lastProgress.current = nextProgress;
    progressRef.current = nextProgress;

    // Throttled Zustand state synchronization: Keeps R3F rendering at 60/120fps while preventing React main-thread lockups
    const now = performance.now();
    const shouldDispatch =
      Math.abs(nextProgress - lastDispatchedProgress.current) > 0.002 ||
      nextProgress === targetProgress ||
      now - lastDispatchedTime.current > 45;

    if (shouldDispatch) {
      lastDispatchedProgress.current = nextProgress;
      lastDispatchedTime.current = now;
      store.setProgress(nextProgress);
      store.setVelocity(vel);
    }

    const up = new THREE.Vector3(0, 1, 0);

    // 2. Fetch LOCOMOTIVE curve position & orientation at nextProgress
    const locoPt = journeyCurveManager.getPointAt(nextProgress);
    const locoTangent = journeyCurveManager.getTangentAt(nextProgress).normalize();
    const locoRight = new THREE.Vector3().crossVectors(up, locoTangent).normalize();
    const locoNormal = new THREE.Vector3().crossVectors(locoTangent, locoRight).normalize();

    const orientSlerpFactor = prefersReducedMotion ? 1.0 : (1 - Math.exp(-22 * (delta || 0.016)));

    if (locoRef.current) {
      locoRef.current.position.copy(locoPt);
      const locoMatrix = new THREE.Matrix4().makeBasis(locoRight, locoNormal, locoTangent);
      const locoQuat = new THREE.Quaternion().setFromRotationMatrix(locoMatrix);
      locoRef.current.quaternion.slerp(locoQuat, orientSlerpFactor);
    }

    // 3. Fetch PASSENGER COACH curve position & orientation at coachProgress (trailing ~6.5m behind)
    const curveTotalLen = journeyCurveManager.totalLength || 1200;
    const coachDeltaT = 6.4 / curveTotalLen;
    const coachProgress = Math.max(0, nextProgress - coachDeltaT);

    const coachPt = journeyCurveManager.getPointAt(coachProgress);
    const coachTangent = journeyCurveManager.getTangentAt(coachProgress).normalize();
    const coachRight = new THREE.Vector3().crossVectors(up, coachTangent).normalize();
    const coachNormal = new THREE.Vector3().crossVectors(coachTangent, coachRight).normalize();

    if (coachRef.current) {
      coachRef.current.position.copy(coachPt);
      const coachMatrix = new THREE.Matrix4().makeBasis(coachRight, coachNormal, coachTangent);
      const coachQuat = new THREE.Quaternion().setFromRotationMatrix(coachMatrix);
      coachRef.current.quaternion.slerp(coachQuat, orientSlerpFactor);
    }

    // 4. Position flexible Coupler Gangway midpoint
    if (couplerRef.current) {
      const midProgress = (nextProgress + coachProgress) / 2;
      const midPt = journeyCurveManager.getPointAt(midProgress);
      const midTangent = journeyCurveManager.getTangentAt(midProgress).normalize();
      const midRight = new THREE.Vector3().crossVectors(up, midTangent).normalize();
      const midNormal = new THREE.Vector3().crossVectors(midTangent, midRight).normalize();
      couplerRef.current.position.copy(midPt);
      const midMatrix = new THREE.Matrix4().makeBasis(midRight, midNormal, midTangent);
      couplerRef.current.quaternion.setFromRotationMatrix(midMatrix);
    }

    // 5. Wheel and Side-Rod Rotation
    wheelAngle.current += vel * 18.0;
    if (locoWheelsRef.current) {
      locoWheelsRef.current.rotation.x = wheelAngle.current;
    }
    if (coachWheelsRef.current) {
      coachWheelsRef.current.rotation.x = wheelAngle.current;
    }
    if (sideRodsRef.current) {
      const rodOffsetX = Math.sin(wheelAngle.current) * 0.12;
      const rodOffsetY = Math.cos(wheelAngle.current) * 0.12;
      sideRodsRef.current.position.set(0, rodOffsetY, rodOffsetX);
    }

    // 6. Steam exhaust update
    if (exhaustPointsRef.current) {
      const geo = exhaustPointsRef.current.geometry;
      const pos = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        exhaustData.life[i] += delta * 1.5;
        if (exhaustData.life[i] > 1.0) {
          exhaustData.life[i] = 0;
          pos[i * 3] = (Math.random() - 0.5) * 0.18;
          pos[i * 3 + 1] = 2.6;
          pos[i * 3 + 2] = 2.4;
        } else {
          pos[i * 3 + 1] += delta * 2.2;
          pos[i * 3 + 2] -= delta * 4.5 + Math.abs(vel) * 14.0 * delta;
        }
      }
      geo.attributes.position.needsUpdate = true;
    }

    // 7. Dynamic 5-Preset Camera System (Chase, Cab, Window, Aerial, Station)
    const preset = PRESET_SPECS[cameraPreset] || PRESET_SPECS.chase;
    let baseCamPos = new THREE.Vector3();
    let baseLookAt = new THREE.Vector3();

    if (cameraPreset === 'cab') {
      // 1. Driver Cab View: Positioned at driver's forward windscreen with panoramic forward track sightline
      baseCamPos.copy(locoPt)
        .addScaledVector(locoTangent, 3.85)
        .addScaledVector(locoNormal, 2.15);

      const lookForward = locoTangent.clone().multiplyScalar(50.0).addScaledVector(locoNormal, 0.0);
      lookForward.applyAxisAngle(locoNormal, freeLookYaw.current);
      lookForward.applyAxisAngle(locoRight, freeLookPitch.current);
      baseLookAt.copy(baseCamPos).add(lookForward);

    } else if (cameraPreset === 'window') {
      // 2. Window Side View (Passenger coach side window looking across landscape)
      baseCamPos.copy(coachPt)
        .addScaledVector(coachRight, 1.1)
        .addScaledVector(coachNormal, 1.75)
        .addScaledVector(coachTangent, -1.2);

      const lookOut = coachRight.clone().multiplyScalar(24.0).addScaledVector(coachNormal, 1.4);
      lookOut.applyAxisAngle(coachNormal, freeLookYaw.current);
      lookOut.applyAxisAngle(coachTangent, freeLookPitch.current);
      baseLookAt.copy(baseCamPos).add(lookOut);

    } else if (cameraPreset === 'aerial') {
      // 3. Aerial View (Top-down bird's-eye map view with full orbit)
      const aerialOffset = locoTangent.clone().multiplyScalar(-6.0)
        .addScaledVector(locoNormal, 34.0 * freeLookZoom.current)
        .addScaledVector(locoRight, 3.0);
      aerialOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), freeLookYaw.current);
      baseCamPos.copy(locoPt).add(aerialOffset);
      baseLookAt.copy(locoPt).addScaledVector(locoTangent, 6.0);

    } else if (cameraPreset === 'station') {
      // 4. Station-Look View (Cinematic 3/4 architectural orbit framing platform, conductor, signboard, and monuments)
      const orbitOffset = locoRight.clone().multiplyScalar(6.6 * freeLookZoom.current)
        .addScaledVector(locoTangent, 4.2)
        .addScaledVector(locoNormal, 2.5);
      orbitOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), freeLookYaw.current);
      baseCamPos.copy(locoPt).add(orbitOffset);
      baseLookAt.copy(locoPt)
        .addScaledVector(locoRight, -2.4)
        .addScaledVector(locoTangent, -1.0)
        .addScaledVector(locoNormal, 1.4);

      if (store.activeStation?.cameraBookmark) {
        const [bmYaw, bmPitch] = store.activeStation.cameraBookmark;
        baseLookAt.addScaledVector(locoRight, bmYaw * 2.5);
        baseLookAt.addScaledVector(locoNormal, bmPitch * 2.0);
      }

    } else {
      // 5. Chase View (Default trailing isometric camera with per-station custom bookmarks)
      // Balanced 3/4 trailing isometric angle centered in the open stage
      const chaseDist = isPortrait ? 9.2 : 11.2;
      const camOffsetVec = isPortrait
        ? locoTangent.clone().multiplyScalar(-chaseDist).addScaledVector(locoRight, 2.0).addScaledVector(locoNormal, 3.8)
        : locoTangent.clone().multiplyScalar(-chaseDist).addScaledVector(locoRight, 2.4).addScaledVector(locoNormal, 3.6);

      camOffsetVec.multiplyScalar(freeLookZoom.current);
      camOffsetVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), freeLookYaw.current);
      camOffsetVec.applyAxisAngle(locoRight, freeLookPitch.current * 0.5);

      baseCamPos.copy(locoPt).add(camOffsetVec);
      baseLookAt.copy(locoPt).addScaledVector(locoTangent, 2.2).addScaledVector(locoNormal, 1.1);

      if (store.activeStation?.cameraBookmark) {
        const [bmYaw, bmPitch] = store.activeStation.cameraBookmark;
        baseLookAt.addScaledVector(locoRight, bmYaw * 3.0);
        baseLookAt.addScaledVector(locoNormal, bmPitch * 2.0);
      }
    }

    // Clamp camera above terrain so it never clips into ground or water
    const minSafeY = Math.max(locoPt.y - 0.2, 1.2) + 0.6;
    if (baseCamPos.y < minSafeY) {
      baseCamPos.y = minSafeY;
    }

    // Auto-return to default preset after 2.5s of no user pointer interaction
    const isIdle = performance.now() - lastInteractionTime.current > 2500;
    if (isIdle) {
      easing.damp(freeLookYaw, 'current', 0, 2.8, delta);
      easing.damp(freeLookPitch, 'current', 0, 2.8, delta);
      easing.damp(freeLookZoom, 'current', 1.0, 2.8, delta);
    }

    // In onboard views (cab & window), lock camera rigidly to the train with zero lag so high speed never leaves camera behind
    if (cameraPreset === 'cab' || cameraPreset === 'window') {
      camera.position.copy(baseCamPos);
      currentLookAt.current.copy(baseLookAt);
      camera.lookAt(baseLookAt);
    } else {
      // Exterior Chase, Aerial, and Station Orbit views: tight frame-rate-independent blending
      // Camera stays tightly coupled to the train so train is ALWAYS locked in view, never outrunning camera
      const dampTime = prefersReducedMotion ? 0.01 : (travelAnimRef.current.active ? 0.025 : 0.06);
      cameraTargetPos.current.copy(baseCamPos);

      easing.damp3(
        camera.position,
        [cameraTargetPos.current.x, cameraTargetPos.current.y, cameraTargetPos.current.z],
        dampTime,
        delta
      );
      easing.damp3(
        currentLookAt.current,
        [baseLookAt.x, baseLookAt.y, baseLookAt.z],
        dampTime,
        delta
      );
      camera.lookAt(currentLookAt.current);
    }

    // UI-Safe Stage Offset & Aspect-Aware FOV
    if (camera instanceof THREE.PerspectiveCamera) {
      const fullWidth = window.innerWidth;
      const fullHeight = window.innerHeight;

      // Animate UI safe stage offset when side panel opens/closes
      const isSidePanelOpen = (store.panelHeight === 'half' || store.panelHeight === 'full') && !isPortrait;
      targetStageOffsetRef.current = isSidePanelOpen ? preset.uiSafeOffset * 0.5 : 0.0;
      easing.damp(stageOffsetRef, 'current', targetStageOffsetRef.current, 3.5, delta);

      const targetFov = isPortrait
        ? preset.fov * (1.12 + Math.max(0, 1 - aspect) * 0.15)
        : preset.fov;

      easing.damp(currentFovRef, 'current', targetFov, 3.0, delta);
      camera.fov = currentFovRef.current;

      const stagePx = Math.round(stageOffsetRef.current * fullWidth);
      const offsetY = isPortrait && cameraPreset !== 'cab' ? Math.round(fullHeight * 0.12) : 0;

      if (stagePx !== 0 || offsetY !== 0) {
        camera.setViewOffset(fullWidth, fullHeight, -stagePx, -offsetY, fullWidth, fullHeight);
      } else {
        camera.clearViewOffset();
      }

      camera.updateProjectionMatrix();
    }
  });

  // Wheel axle height: rail top is at 0.21m, wheel radius 0.38m -> axle center = 0.59m
  const axleY = 0.59;
  const railGauge = 0.72; // Wheels sit at ±0.72m directly on the rails

  return (
    <group name="train-system" visible={cameraPreset !== 'station'}>
      {/* ============================================================== */}
      {/* 1. STREAMLINER STEAM LOCOMOTIVE                                */}
      {/* ============================================================== */}
      <group ref={locoRef} name="locomotive">
        {/* Main Boiler Body */}
        <mesh position={[0, axleY + 0.95, 1.1]} rotation={[Math.PI / 2, 0, 0]} castShadow={tier === 'high'}>
          <cylinderGeometry args={[0.82, 0.82, 3.8, 28]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.25} />
        </mesh>

        {/* Aerodynamic Bullet Nose / Smokebox Front */}
        <mesh position={[0, axleY + 0.95, 3.0]} rotation={[Math.PI / 2, 0, 0]} castShadow={tier === 'high'}>
          <sphereGeometry args={[0.82, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.2} />
        </mesh>

        {/* Polished Brass Boiler Trim Bands */}
        <mesh position={[0, axleY + 0.95, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.84, 0.025, 8, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, axleY + 0.95, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.84, 0.025, 8, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, axleY + 0.95, 2.7]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.84, 0.025, 8, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Smokestack Chimney */}
        <mesh position={[0, axleY + 1.95, 2.4]}>
          <cylinderGeometry args={[0.22, 0.28, 0.75, 16]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Brass Bell & Steam Dome */}
        <mesh position={[0, axleY + 1.9, 1.2]}>
          <sphereGeometry args={[0.25, 16, 12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.12} />
        </mesh>
        <mesh position={[0, axleY + 1.85, -0.2]}>
          <cylinderGeometry args={[0.18, 0.22, 0.45, 14]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Engineer Cabin */}
        <mesh position={[0, axleY + 1.15, -1.35]} castShadow={tier === 'high'} receiveShadow>
          <boxGeometry args={[1.72, 1.85, 2.1]} />
          <meshStandardMaterial color="#0f172a" metalness={0.88} roughness={0.28} />
        </mesh>

        {/* Cabin Curved Roof Overhang with Amber Gold Trim */}
        <mesh position={[0, axleY + 2.12, -1.35]} castShadow={tier === 'high'}>
          <boxGeometry args={[1.82, 0.1, 2.25]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Recessed Cabin Side Windows (Facing outward along ±X) */}
        <mesh position={[0.87, axleY + 1.35, -1.35]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.2, 0.65]} />
          <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.87, axleY + 1.35, -1.35]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.2, 0.65]} />
          <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} />
        </mesh>

        {/* Cab Front Windshield Panes & Vintage Cockpit Details */}
        <mesh position={[0.42, axleY + 1.45, -0.28]}>
          <planeGeometry args={[0.55, 0.45]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} roughness={0.1} metalness={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.42, axleY + 1.45, -0.28]}>
          <planeGeometry args={[0.55, 0.45]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} roughness={0.1} metalness={0.9} side={THREE.DoubleSide} />
        </mesh>

        {/* Driver Dashboard & Vintage Brass Gauges Shelf */}
        <group position={[0, axleY + 1.15, 0.05]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.6, 0.08, 0.4]} />
            <meshStandardMaterial color="#0b1322" roughness={0.5} metalness={0.8} />
          </mesh>
          <mesh position={[0.25, 0.14, 0]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
            <meshStandardMaterial color="#d97706" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0.45, 0.14, 0]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
            <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0.62, 0.18, -0.05]} rotation={[-Math.PI / 8, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.015, 0.22, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* Heavy Steel Pilot Wedge / Cowcatcher */}
        <group position={[0, axleY - 0.22, 3.4]}>
          <mesh rotation={[Math.PI / 4, 0, 0]} castShadow={tier === 'high'}>
            <coneGeometry args={[0.95, 0.9, 4]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.35} />
          </mesh>
        </group>

        {/* Forward Chrome Headlamp & Volumetric Beam */}
        <mesh position={[0, axleY + 0.95, 3.82]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.22, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0, axleY + 0.95, 3.94]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <pointLight position={[0, axleY + 0.95, 4.2]} intensity={tier === 'low' ? 3.0 : 6.0} distance={32} color="#fef08a" />
        <spotLight
          position={[0, axleY + 0.95, 4.0]}
          target-position={[0, axleY + 0.95, 24]}
          angle={0.42}
          penumbra={0.7}
          intensity={tier === 'low' ? 3.5 : 7.0}
          distance={38}
          color="#fef08a"
        />

        {/* Steam Exhaust Particles */}
        <points ref={exhaustPointsRef} position={[0, axleY, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={exhaustData.pos}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.65}
            map={steamCircleMap}
            color="#f8fafc"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {/* Rotating Locomotive Wheelsets (Gauge = ±0.72m, Radius = 0.38m) */}
        <group ref={locoWheelsRef} position={[0, axleY, 0]}>
          {[-1.8, -0.6, 0.6, 1.8].map((zPos, idx) => (
            <group key={idx} position={[0, 0, zPos]}>
              {/* Axle bar */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.06, 0.06, railGauge * 2, 12]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
              </mesh>
              {/* Left Wheel */}
              <mesh position={[-railGauge, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.38, 0.38, 0.12, 20]} />
                <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.2} />
              </mesh>
              {/* Left Wheel Flange */}
              <mesh position={[-railGauge + 0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.42, 0.42, 0.03, 20]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
              </mesh>
              {/* Right Wheel */}
              <mesh position={[railGauge, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.38, 0.38, 0.12, 20]} />
                <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.2} />
              </mesh>
              {/* Right Wheel Flange */}
              <mesh position={[railGauge - 0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.42, 0.42, 0.03, 20]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Side Connecting Drive Rods */}
        <group ref={sideRodsRef} position={[0, axleY, 0]}>
          <mesh position={[-railGauge - 0.08, 0, 0]}>
            <boxGeometry args={[0.04, 0.08, 3.8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[railGauge + 0.08, 0, 0]}>
            <boxGeometry args={[0.04, 0.08, 3.8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 2. FLEXIBLE GANGWAY COUPLER BELLOWS                            */}
      {/* ============================================================== */}
      <group ref={couplerRef} name="gangway-coupler">
        <mesh position={[0, axleY + 1.1, 0]}>
          <boxGeometry args={[1.35, 1.6, 0.7]} />
          <meshStandardMaterial color="#1e1e24" roughness={0.95} metalness={0.05} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 3. ARTICULATED PASSENGER OBSERVATION COACH                     */}
      {/* ============================================================== */}
      <group ref={coachRef} name="passenger-coach">
        {/* Main Coach Body */}
        <mesh position={[0, axleY + 1.1, 0]} castShadow={tier === 'high'} receiveShadow>
          <boxGeometry args={[1.72, 1.95, 5.8]} />
          <meshStandardMaterial color="#091325" metalness={0.88} roughness={0.24} />
        </mesh>

        {/* Coach Curved Roof Overhang with Pinstripe */}
        <mesh position={[0, axleY + 2.12, 0]} castShadow={tier === 'high'}>
          <boxGeometry args={[1.82, 0.12, 5.95]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Golden Pinstripe Trim along Coach Beltline */}
        <mesh position={[0.87, axleY + 0.75, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[5.7, 0.06]} />
          <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.87, axleY + 0.75, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[5.7, 0.06]} />
          <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
        </mesh>

        {/* Illuminated Panoramic Observation Windows (Facing outward along ±X) */}
        {[-2.0, -1.0, 0.0, 1.0, 2.0].map((zOffset, idx) => (
          <group key={idx}>
            {/* Left Window */}
            <mesh position={[-0.87, axleY + 1.32, zOffset]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[0.75, 0.65]} />
              <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} />
            </mesh>
            {/* Right Window */}
            <mesh position={[0.87, axleY + 1.32, zOffset]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.75, 0.65]} />
              <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}

        {/* Rear Red Safety Tail Lamps */}
        <mesh position={[0.6, axleY + 0.75, -2.92]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[-0.6, axleY + 0.75, -2.92]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Coach Bogie Wheels (Front & Rear Bogies) */}
        <group ref={coachWheelsRef} position={[0, axleY, 0]}>
          {[-2.0, -1.0, 1.0, 2.0].map((zPos, idx) => (
            <group key={idx} position={[0, 0, zPos]}>
              {/* Axle */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, railGauge * 2, 12]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
              </mesh>
              {/* Left Wheel */}
              <mesh position={[-railGauge, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.34, 0.34, 0.1, 16]} />
                <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.2} />
              </mesh>
              {/* Left Wheel Flange */}
              <mesh position={[-railGauge + 0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.38, 0.38, 0.025, 16]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
              </mesh>
              {/* Right Wheel */}
              <mesh position={[railGauge, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.34, 0.34, 0.1, 16]} />
                <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.2} />
              </mesh>
              {/* Right Wheel Flange */}
              <mesh position={[railGauge - 0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.38, 0.38, 0.025, 16]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};
