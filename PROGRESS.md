# Project Restoration Progress Checkpoint

## Current Status: Phase 0 & Phase 1 Complete, Transitioning to Phase 2 (Restore Smoothness)

### Hard Rules Compliance
1. **Data and Content**: Strictly unchanged. Verified via `scripts/verify-data-integrity.mjs` against `data-backup/original/portfolioData.json`.
   - **Station Count**: Exactly 12 stations.
   - **Flagged Audit Content (Preserved - Not Altered)**:
     - Station 4 dates (`Aug 2023 – Present`) and attendee metrics (`8+ events`, `200+ attendee strength`).
     - Station 11 technical stack challenge (MySQL composite indexes, Angular 16 Signals, Node/TypeScript).
     - `portfolioData.json` lines 75–76 `lighthouseMobilePerformance: "TODO"`.
2. **Branch**: Active on `restore-smoothness`, baseline tagged `pre-changes`.
3. **Data Integrity Script**: `node scripts/verify-data-integrity.mjs` -> `[PASS]`.
4. **Performance Targets**: Measuring all changes with CDP and `scripts/run-full-diagnostics.mjs`.

---

## Phase 0: Baseline Metrics (Recorded)
- **Viewport Matrix**:
  - `1920x1080`: 360 draw calls, 186.1k triangles, 31 textures, 17.2 MB heap.
  - `768x1024`: 322 draw calls, 183.8k triangles, 31 textures, 20.6 MB heap.
  - `844x390`: 372 draw calls, 187.1k triangles, 31 textures, 19.1 MB heap.
  - In Cab view (`stn5_cab`), draw calls reduce to 146 calls, 170.3k triangles.
- **Bundle & Asset Footprint**:
  - Initial JS bundle: ~138 kB gzip (non-3D).
  - 3D chunks loaded asynchronously.

---

## Phase 1: Ranked Regression Cost Table

| Rank | Subsystem / Feature | Baseline FrameTime | Isolated FrameTime | Delta / Cost Impact | Evidence & Profiler Notes |
|------|---------------------|-------------------|-------------------|---------------------|---------------------------|
| **1** | **Post-Processing (Bloom + Vignette)** | 479.2 ms | 241.2 ms | **-238.0 ms (-49.7%)** | Fullscreen multi-pass render targets & ping-pong buffers cost ~50% of frame time under GPU load. Textures dropped from 31 to 14 when disabled. |
| **2** | **Foliage & Prop Density (Instanced geometry)** | 479.2 ms | 461.3 ms | **-17.9 ms (-3.7%)** | 27k triangles reduction from 186k to 159k. |
| **3** | **Biome Particles (Point Cloud vs Billboards)** | 479.2 ms | 452.9 ms | **-26.3 ms (-5.5%)** | Disabling particle simulation removes GPU point rasterization overhead. Legacy procedural billboards add +16% overhead (559.1 ms). |
| **4** | **Device Pixel Ratio (DPR > 1.5 on Retina displays)** | ~520 ms | 479 ms | **Varies by GPU** | Capping DPR at 1.5 prevents fill-rate bottlenecks on 4K/Retina displays. |
| **5** | **Glass Blur & Backdrop Filter over Canvas** | 575.2 ms | 479.2 ms | **Compositing hitch** | `backdrop-filter: blur()` over WebGL forces browser compositor texture readbacks. |
| **6** | **Voice Assistant & Audio** | Negligible | Negligible | Low steady state | Re-render isolated via Zustand selectors; zero 3D impact when idle. |

---

## Next Steps: Phase 2 Execution
1. Implement DPR cap of 1.5 with adaptive step-down via hysteresis in `JourneyCanvas.tsx`.
2. Tier-gate post-processing: disable bloom on `low` tier, optimize half-resolution on `mid`, full on `high`.
3. Add persistent Quality Selector (`Auto`, `Low`, `Mid`, `High`) in `UnifiedMenuDropdown.tsx` saving to `localStorage`.
4. Fix visual artifacts: remove orphaned tunnel portal at Station 4 in `TunnelAndMistSystem.tsx`, clean up track cutting slope in `TerrainSystem.tsx`.
5. Remove any remaining backdrop-filter blur over the canvas in UI layers to prevent compositor stalls.
6. Verify data integrity and measure performance improvements.
