import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('src/data/portfolioData.json', 'utf8'));

// Per-station custom camera bookmarks [yawOffset, pitchOffset, distance, fov]
const bookmarks = [
  [0.0, 0.05, 12.0, 48],   // Station 1: Origin / Profile
  [0.08, 0.06, 11.5, 46],  // Station 2: Narayana MPC
  [-0.06, 0.05, 12.0, 48], // Station 3: SASTRA ICT
  [0.15, 0.10, 13.0, 50],  // Station 4: Smart Cities Drone
  [0.0, 0.12, 13.5, 50],   // Station 5: Building Footprints
  [-0.12, 0.08, 12.5, 48], // Station 6: IIT ISM Dhanbad
  [0.10, 0.06, 12.0, 48],  // Station 7: AI Resume Optimizer
  [0.05, 0.05, 11.5, 46],  // Station 8: Interview Coach
  [-0.08, 0.08, 12.5, 48], // Station 9: Expense Tracker
  [0.12, 0.06, 12.0, 48],  // Station 10: Panchayati Raj Hackathon
  [0.0, 0.05, 11.0, 46],   // Station 11: Stanford ML Cert
  [0.0, 0.18, 15.0, 52],   // Station 12: Future Roadmap / Terminus
];

raw.stations.forEach((stn, idx) => {
  stn.cameraBookmark = bookmarks[idx] || [0.0, 0.05, 12.0, 48];
});

fs.writeFileSync('src/data/portfolioData.json', JSON.stringify(raw, null, 2));
console.log('Successfully added cameraBookmark to all 12 stations.');
