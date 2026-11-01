import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useJourneyStore } from '../../stores/useJourneyStore';

// Custom lightweight GLSL water shader
const waterVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Wave displacement
    float wave1 = sin(pos.x * 0.08 + uTime * 1.5) * cos(pos.y * 0.08 + uTime * 1.2) * 0.45;
    float wave2 = sin(pos.x * 0.18 - uTime * 2.1) * cos(pos.y * 0.15 + uTime * 1.8) * 0.22;
    pos.z += wave1 + wave2;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const waterFragmentShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  uniform float uTime;
  uniform vec3 uSunPosition;
  uniform vec3 uWaterColorDeep;
  uniform vec3 uWaterColorShallow;
  uniform vec3 uSkyColor;

  void main() {
    // Normal perturbation for water ripple
    vec3 normal = normalize(vNormal);
    float ripple = sin(vWorldPosition.x * 0.3 + uTime * 2.0) * cos(vWorldPosition.z * 0.3 + uTime * 2.2);
    normal.x += ripple * 0.12;
    normal.z += ripple * 0.12;
    normal = normalize(normal);

    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 sunDir = normalize(uSunPosition);

    // Fresnel reflectance
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);

    // Specular sunlight highlight
    vec3 reflectDir = reflect(-sunDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0) * 1.8;

    // Water color gradient
    vec3 baseWater = mix(uWaterColorDeep, uWaterColorShallow, fresnel * 0.6);
    vec3 finalColor = mix(baseWater, uSkyColor, fresnel * 0.7) + vec3(spec);

    gl_FragColor = vec4(finalColor, 0.88);
  }
`;

export const WaterSystem: React.FC = () => {
  const activeStation = useJourneyStore((s) => s.activeStation);
  const currentMood = useJourneyStore((s) => s.currentMood);
  const tier = useJourneyStore((s) => s.tier);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Show water on coastal and viaduct biomes
  const isWaterBiome = activeStation.biome === 'coast' || activeStation.biome === 'viaduct';

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunPosition: { value: new THREE.Vector3(100, 150, 100) },
      uWaterColorDeep: { value: new THREE.Color('#0c2d48') },
      uWaterColorShallow: { value: new THREE.Color('#2e8bc0') },
      uSkyColor: { value: new THREE.Color('#b1d4e0') },
    }),
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;

    // Mood color variations
    if (currentMood === 'night') {
      materialRef.current.uniforms.uWaterColorDeep.value.set('#040b14');
      materialRef.current.uniforms.uWaterColorShallow.value.set('#0e1e38');
      materialRef.current.uniforms.uSkyColor.value.set('#1e293b');
    } else if (currentMood === 'dusk') {
      materialRef.current.uniforms.uWaterColorDeep.value.set('#1b1338');
      materialRef.current.uniforms.uWaterColorShallow.value.set('#581c87');
      materialRef.current.uniforms.uSkyColor.value.set('#f43f5e');
    } else if (currentMood === 'golden') {
      materialRef.current.uniforms.uWaterColorDeep.value.set('#143542');
      materialRef.current.uniforms.uWaterColorShallow.value.set('#d97706');
      materialRef.current.uniforms.uSkyColor.value.set('#fde68a');
    } else {
      materialRef.current.uniforms.uWaterColorDeep.value.set('#0c2d48');
      materialRef.current.uniforms.uWaterColorShallow.value.set('#2e8bc0');
      materialRef.current.uniforms.uSkyColor.value.set('#bae6fd');
    }
  });

  if (!isWaterBiome && tier === 'low') {
    return null;
  }

  return (
    <group name="water-system" position={[60, -3.2, 650]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
        <planeGeometry args={[1200, 800, tier === 'high' ? 64 : 32, tier === 'high' ? 64 : 32]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

