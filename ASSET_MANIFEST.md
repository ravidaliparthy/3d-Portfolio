# Asset Manifest & Attribution Log

This manifest tracks every external 3D model, texture, HDRI, audio sample, and visual asset across the project.
All assets are governed by strict open-source/permissive licensing (CC0, MIT, or Apache 2.0).
Zero copyrighted or ambiguous assets are permitted in production builds.

| Asset Identifier | Asset Name & Category | Format & Compression | Source & License | File Size Target | Allocated Tier(s) | Role & Pipeline Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `guide-avatar-photo` | Tour Guide Character Reference | JPG / WebP responsive | User-Provided (Portrait Reference) | 65 KB | All tiers (2D Fallback) | `public/assets/guide/guide_reference.jpg` |
| `guide-conductor-glb` | 3D Conductor Model (Charan) | GLB (Draco + Meshopt compressed) | Custom Rigged Avatar (Target) | < 1.2 MB | High Tier | `public/assets/guide/conductor.glb` |
| `pbr-track-steel` | PBR Rail Steel Material | Procedural MeshStandardMaterial | Built-in Procedural Shader | 0 KB | All tiers | `src/components/3d/TrackSystem.tsx` |
| `pbr-wood-sleepers` | Railroad Ties / Sleepers | Procedural MeshStandardMaterial | Built-in Procedural Shader | 0 KB | All tiers | `src/components/3d/TrackSystem.tsx` |
| `audio-train-engine` | Procedural Engine Drone & Hum | Web Audio API (Dual Oscillators + Lowpass) | Custom Web Audio Synthesizer | 0 KB (Code) | All tiers | `src/utils/audioSynthesizer.ts` |
| `audio-rail-clatter` | Rhythmic Wheel Click-Clack | Web Audio API (Bandpass Filtered Noise) | Custom Web Audio Synthesizer | 0 KB (Code) | All tiers | `src/utils/audioSynthesizer.ts` |
| `audio-whistle` | Dual-Harmonic Train Whistle | Web Audio API (D5 + F5 Sines) | Custom Web Audio Synthesizer | 0 KB (Code) | All tiers | `src/utils/audioSynthesizer.ts` |
| `audio-station-chime` | Pentatonic Arrival Bell | Web Audio API (C5-E5-G5 Sines) | Custom Web Audio Synthesizer | 0 KB (Code) | All tiers | `src/utils/audioSynthesizer.ts` |
| `sky-dawn-hdr` | Ultra-low Dawn Environment Map | HDR / EXR (512x256 or Procedural Sky) | Poly Haven (CC0) / Procedural | < 150 KB | High, Mid | `public/assets/env/` (Phase 2) |
| `sky-day-hdr` | Procedural Physical Sun/Sky | Drei `<Sky />` + Shader | Drei / Three.js (MIT) | 0 KB | All tiers | `src/components/3d/EnvironmentRig.tsx` |
| `foliage-biome-cards` | Alpha-Tested Biome Foliage | KTX2 / PNG Instanced Cards | Kenney / Poly Haven (CC0) | < 250 KB | High, Mid | `public/assets/foliage/` (Phase 2) |

---

## Guide Asset Preparation Checklist

Based on the uploaded avatar image (`media_1793336725057_a4846b62.jpg`):
The character is a stylized 3D avatar with:
- **Hairstyle & Facial Hair**: Short textured dark hair swept back, clean full black beard and mustache.
- **Eyewear**: Clear frame oval spectacles.
- **Attire**: Bright mustard-yellow crewneck sweater worn over a white/light-blue collared shirt with cuffs rolled up; slim white trousers; light-yellow slip-on footwear (Crocs-style).
- **Expression**: Warm, friendly, welcoming smile.

### A) Preferred: Stylized 3D Character (GLB)
1. **Avatar Generation**:
   - Use an avatar tool such as **Ready Player Me** or **Blender Human Generator / VRoid** matching the uploaded reference:
     - Head: Black hair, clear glasses, neat black beard, light-brown/olive skin tone.
     - Top: Mustard-yellow sweater layered over white collared shirt.
     - Bottom: White fitted chinos/trousers.
     - Shoes: Pale yellow slip-ons.
   - **Polycount Target**: ≤ 18,000 triangles total (LOD0).
   - **Rig**: Standard Mixamo / Humanoid humanoid rig (root, spine, arms, neck, head, fingers optional).
   - **Animation Clips Needed**:
     - `idle` (gentle breathing, slight postural sway, 3-4s loop)
     - `greeting` / `wave` (right hand wave with head nod)
     - `pointing` (gesturing forward toward track/station landmark)
     - `thinking` (hand to chin / contemplative look)
     - `celebrating` (thumbs-up / conductor salute)
   - **Texture & Compression Target**:
     - Single 1024x1024 PBR atlas (Albedo, Roughness, Normal).
     - Compress with `gltf-transform optimize input.glb output.glb --draco --meshopt`.
     - File size target: `< 1.2 MB`.

### B) 2D Fallback / Cut-Out Portrait (Low Tier & Mobile HUD)
1. **Source Image Preparation**:
   - Background has already been isolated from the reference photo.
   - Save transparent PNG/WebP exports:
     - `public/assets/guide/guide_avatar_256.webp` (256x256 px, ~18 KB)
     - `public/assets/guide/guide_avatar_512.webp` (512x512 px, ~45 KB)
   - Accurate Alt Text: *"Stylized 3D illustrated avatar of Charan with black beard, clear glasses, and yellow sweater, acting as the journey conductor."*

