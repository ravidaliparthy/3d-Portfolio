import * as THREE from 'three';
import { portfolioData } from '../../data';

/**
 * Procedural Journey Curve Manager
 * Connects all 12 stations smoothly along a continuous scenic track.
 */
export class JourneyCurveManager {
  public curve: THREE.CatmullRomCurve3;
  public stationPoints: THREE.Vector3[] = [];
  public stationTValues: number[] = [];
  public totalLength: number;

  constructor() {
    const stations = portfolioData.stations;
    const numStations = stations.length;

    // Scenic route waypoints: [X, Y (elevation), Z]
    // A majestic, smooth railway path with gradual curves and elevation changes
    const routeCoords: Array<[number, number, number]> = [
      [0, 1.2, 0],          // Station 01: About Me & Executive Profile (Origin Concourse)
      [22, 1.8, 100],       // Station 02: Narayana (Meadow Curve)
      [50, 3.2, 210],       // Station 03: SASTRA University (Campus Concourse)
      [82, 5.5, 330],       // Station 04: Leadership & Clubs (Forest Edge)
      [115, 9.5, 450],      // Station 05: GeoAI Drone Outpost (Canyon Curve)
      [130, 22.0, 580],     // Station 06: IIT Dhanbad Seismic (High Snowy Alpine Pass)
      [98, 17.5, 710],      // Station 07: Expense Tracker (Elevated Viaduct Span)
      [48, 9.0, 840],       // Station 08: Resume Agent (Coastal Shoreline)
      [-8, 6.5, 960],       // Station 09: AI Interviewer (Coastal Pier)
      [-62, 12.0, 1090],    // Station 10: National Hackathon Finalist (Highland Ascent)
      [-92, 7.0, 1210],     // Station 11: Certifications & Internships (Highland Ridge)
      [-115, 3.5, 1340],    // Station 12: Terminus: Hyderabad Grand Central (Final Concourse)
    ];

    const waypoints: THREE.Vector3[] = [];

    // Pre-station buffer track
    waypoints.push(new THREE.Vector3(0, 1.2, -60));
    waypoints.push(new THREE.Vector3(0, 1.2, -25));

    for (let i = 0; i < numStations; i++) {
      const coord = routeCoords[i] || [i * 15, 2, i * 110];
      const p = new THREE.Vector3(coord[0], coord[1], coord[2]);
      waypoints.push(p);
      this.stationPoints.push(p);
    }

    // Post-terminus buffer track
    waypoints.push(new THREE.Vector3(-125, 3.5, 1420));
    waypoints.push(new THREE.Vector3(-135, 3.5, 1490));

    // Smooth centripetal curve with zero sharp kinks
    this.curve = new THREE.CatmullRomCurve3(waypoints, false, 'centripetal', 0.5);
    this.totalLength = this.curve.getLength();

    // Dense arc-length parameter sampling
    const samples = 2000;
    for (let i = 0; i < numStations; i++) {
      const targetP = this.stationPoints[i];
      let closestT = 0;
      let minDistance = Infinity;

      for (let s = 0; s <= samples; s++) {
        const t = s / samples;
        const pt = this.curve.getPointAt(t);
        const dist = pt.distanceTo(targetP);
        if (dist < minDistance) {
          minDistance = dist;
          closestT = t;
        }
      }
      this.stationTValues.push(closestT);
    }
  }

  public getPointAt(t: number): THREE.Vector3 {
    return this.curve.getPointAt(Math.max(0, Math.min(1, t)));
  }

  public getTangentAt(t: number): THREE.Vector3 {
    return this.curve.getTangentAt(Math.max(0, Math.min(1, t))).normalize();
  }

  public getStationT(stationIndex: number): number {
    return this.stationTValues[stationIndex] ?? 0;
  }
}

export const journeyCurveManager = new JourneyCurveManager();
