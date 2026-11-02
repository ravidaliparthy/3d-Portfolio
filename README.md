<div align="center">

# Central Milestone Express — 3D Interactive Portfolio
### A Cinematic WebGL Rail Journey across AI Research, Full-Stack Architectures & Systems Engineering

[![Live Demo](https://img.shields.io/badge/Live%20Demo-3d--portfolio--livid--rho.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=black)](https://3d-portfolio-livid-rho.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React%2018-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript%205-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**[Explore the Live Interactive Experience →](https://3d-portfolio-livid-rho.vercel.app/)**

</div>

---

## Overview

**Central Milestone Express** is an interactive 3D portfolio themed as a cinematic train journey across 12 milestone stations, procedural biomes, and terrain environments. Built with **Three.js**, **React Three Fiber**, and **TypeScript**, the experience showcases the software engineering accomplishments, peer-reviewed deep learning research, and distributed systems built by **Daliparthy Ravi Krishna Charan**.

Designed from the ground up for 60 FPS performance across desktops and mobile devices, it combines real-time WebGL graphics, procedural Web Audio locomotive sound synthesis, an interactive Conductor guide, a real-time Voice Assistant, and deep engineering case studies.

---

## 🌟 Key Features

- **🚂 Continuous 3D Spline Journey**: Centripetal `CatmullRomCurve3` spline path with arc-length parametrization (`getPointAt`), realistic banking, and eased deceleration into station dwell zones.
- **🎙️ Real-Time Voice Assistant & Conductor**: Interactive tour guide powered by client-side speech synthesis and fuzzy intent matching for instant station navigation and technical commentary.
- **📖 Engineering Case Studies & Tradeoffs**: Deep architectural breakdowns covering pipeline bottlenecks, caching strategies, latency optimizations, and production decisions.
- **🗺️ Interactive 6-State Landscape Map**: Macro map visualizing all biomes (Meadows, Campus, Research Peaks, Urban Grid, Cloud Edge, and Grand Central).
- **🔊 Procedural Web Audio Engine**: Zero-asset procedural synthesis of dual-oscillator diesel hum, speed-scaled wheel clatter, and dual-harmonic brass train whistle.
- **⚡ Adaptive Performance Engine**: 3-tier runtime scaling with dynamic DPR capping (1.0–1.5x), geometry/material pooling, and instanced props ensuring butter-smooth 60 FPS playback.
- **📄 Instant Resume Gate**: Integrated PDF viewer and direct download buttons at the Terminus Concourse.

---

## 🗺️ The 12 Milestone Stations

| # | Station Name | Focus Area | Key Metrics / Highlights |
|---|---|---|---|
| **01** | **About Me & Executive Profile** | Bio & Research Philosophy | Peer-Reviewed Research • National Hackathon Finalist |
| **02** | **Intermediate Education (MPC)** | Narayana Junior College | 97.8% MPC Score • 90.4%ile JEE Foundation |
| **03** | **B.Tech in ICT** | SASTRA Deemed University | 8.5444 CGPA • Top 10% Class Standing • Systems Core |
| **04** | **President & Technical Leadership** | Student Societies | President of Maths Club • 8+ Events • 200+ Attendees |
| **05** | **Rooftop Material Segmentation** | GeoAI & Computer Vision | 17,954 Buildings Analyzed • 91.4% mIoU Accuracy |
| **06** | **Intelligent Seismic Activity Detection** | Published Deep Learning | 99.05% Accuracy • Peer-Reviewed at IIT ISM Dhanbad SME-2025 |
| **07** | **Expense Tracker PWA** | Offline-First Web Architecture | <100ms Latency • SQLite (Turso) • Progressive Web App |
| **08** | **Resume Agent – AI Resume Optimizer** | Edge AI & Cloudflare Workers | <120ms Latency • Llama 3.3 70B • Strict ATS Validation |
| **09** | **AI Technical Interview Coach** | Next.js & FastAPI Platform | 300+ Tokens/Sec via Groq • Live 7-Language Code Sandbox |
| **10** | **National AI/ML Hackathon 2026** | IIT Tirupati & MoPR | Top 10% Finalist (Selected: 40 out of 400 Teams) |
| **11** | **Industry Readiness & Internships** | Applied Software Engineering | Matrimorphosis Top 250 / 3,000+ • Sync & Bharat Internships |
| **12** | **Terminus: Hyderabad Grand Central** | Recruiter Concourse | View/Download Resume • Direct Email Dispatch • Connect |

---

## 🛠️ Technical Stack & Architecture

- **Frontend & UI**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Shaders & Shading**: Custom GLSL materials, procedural height-mapped terrain, volumetric fog, dynamic time-of-day lighting
- **State Management**: Zustand with selective per-frame updates
- **Audio Architecture**: Procedural Web Audio API synthesis (zero external audio file payload)
- **Data Integrity**: Strict Zod schema (`z.strict()`) validated with automated referential integrity assertions

---

## ⚡ Performance Optimizations

- **Initial Bundle**: Core non-3D JavaScript is under 100 kB gzip (`dist/assets/index.js` ~99.4 kB).
- **Draw Call Budget**: Controlled below 275 calls on mid/high tiers and under 120 on mobile viewports.
- **Memory Safety**: Flat JS heap (~20 MB) and geometry/material disposal across continuous multi-station journeys.
- **Responsive Layout**: Mobile bottom-sheet layout with adaptive camera offsets (`camera.setViewOffset`) ensuring full visibility of both 3D rails and station UI.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/ravidaliparthy/3d-Portfolio.git
cd 3d-Portfolio

# Install dependencies
npm install

# Run data integrity assertions
npm run validate:data

# Start Vite development server
npm run dev
```

### Production Build & Preview
```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Built with passion by <strong>Daliparthy Ravi Krishna Charan</strong> • <a href="https://3d-portfolio-livid-rho.vercel.app/">Launch 3D Portfolio</a>
</div>
