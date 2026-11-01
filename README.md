# Central Milestone Express — 3D Interactive Portfolio

An Awwwards-caliber interactive 3D WebGL portfolio themed as a cinematic railway journey across the engineering accomplishments, peer-reviewed research, and software architectures built by **Daliparthy Ravi Krishna Charan**.

---

## Technical Stack & Architecture

- **Core Framework**: React 18, Vite, TypeScript
- **3D Graphics Engine**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Post-Processing**: `@react-three/postprocessing` (HDR Bloom, Vignette, ACESFilmic Tone Mapping)
- **Animation & Interpolation**: GSAP, `maath/easing`
- **Audio Architecture**: Procedural Web Audio API synthesis (zero external audio payload, zero licensing overhead)
- **State Management**: Zustand
- **Styling**: Tailwind CSS, Lucide React
- **Data Integrity & Validation**: Strict Zod schema (`.strict()`) with build-time referential validation

---

## Key Highlights for Technical Recruiters

1. **Continuous 3D Spline Journey**:
   - The entire track is governed by a centripetal `CatmullRomCurve3` with arc-length parametrization (`getPointAt`), providing smooth acceleration, eased deceleration into station dwell zones, and realistic railway banking.

2. **Mobile-First Responsive Engineering**:
   - **Aspect-Aware Camera**: Camera FOV, elevation, and target distances adjust dynamically based on viewport aspect ratio.
   - **Viewport Offset (`camera.setViewOffset`)**: On mobile portrait screens, the 3D scene is shifted upward so the locomotive and scenery remain in the upper 55% of the screen, leaving thumb-reachable space for the swipeable bottom sheet.
   - Touch navigation uses native-feeling swipe physics without page scroll hijacking.

3. **3-Tier Runtime Scalability**:
   - Hardware detection inspects GPU renderers, hardware concurrency, and device memory:
     - **High Tier**: 2.0 DPR cap, soft shadows, multisampled Bloom, volumetric fog, and 600+ instanced foliage meshes.
     - **Mid Tier**: 1.5 DPR cap, Vignette post-processing, 320 instanced foliage meshes.
     - **Low Tier**: 1.0 DPR cap, zero post-processing overhead, instanced sleep optimization, guaranteed 60fps on mid-range phones.
   - Automatically steps down quality live if frame rates drop via Drei's `PerformanceMonitor`.

4. **Strict Zero-Hallucination Directive**:
   - All factual information (academics, metrics, dates, papers, and codebases) originates strictly from validated records in `portfolioData.json`.
   - Run `npm run validate:data` to verify referential integrity across all skills, milestones, and guide lines.

5. **Procedural Web Audio API Sound Engine**:
   - Synthesizes realistic diesel locomotive hum via low-passed dual oscillators.
   - Speed-scaled wheel clatter produced via bandpass-filtered noise bursts.
   - Dual-harmonic whistle (D5 at 587.33 Hz & F5 at 698.46 Hz).
   - Unlocked exclusively via user gesture ("Board the Train") with silent-mode fallback and persistent mute toggle.

---

## Quickstart & Development

```bash
# Install dependencies
npm install

# Validate data schema & referential integrity
npm run validate:data

# Start local development server
npm run dev

# Compile production bundle
npm run build
```

---

## Milestone Station Directory

1. **Station 01**: Narayana Junior College (Intermediate MPC - 97.8%)
2. **Station 02**: Sastra Deemed University (B.Tech ICT, CGPA: 8.5444 / 10.0, Top 10%)
3. **Station 03**: Campus Leadership (Maths Club President, Robotics Club, Daksh Workshops)
4. **Station 04**: Rooftop Material Segmentation from Drone Imagery (GeoAI, Nacala Mozambique, IoU: 0.867)
5. **Station 05**: Intelligent Seismic Activity Detection (Peer-Reviewed Paper at IIT ISM Dhanbad SME-2025)
6. **Station 06**: Offline-First Expense Tracker Platform (Angular 16, WAL-mode SQLite, Turso, 34 tests, PWA)
7. **Station 07**: Resume Agent – AI Resume Optimizer (React 19, Cloudflare Workers, Llama 3.3 70B, Durable Objects)
8. **Station 08**: AI Technical Interviewer Platform (Next.js, FastAPI, Groq LLMs, 7-Language Code Sandbox)
9. **Station 09**: National AI/ML Hackathon 2026 Finalist (IIT Tirupati & Ministry of Panchayati Raj)
10. **Station 10**: Industry Readiness & Professional Certifications (Matrimorphosis Top 250/3000+, TATA iQ GenAI)

