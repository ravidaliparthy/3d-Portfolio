import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const shots = [
  { name: 'live_station01_active.png', url: 'http://127.0.0.1:4173/#station-01-about-me' },
  { name: 'live_station02_track_check.png', url: 'http://127.0.0.1:4173/#narayana' },
  { name: 'live_station05_drone.png', url: 'http://127.0.0.1:4173/#drone-land-governance' },
];

for (const s of shots) {
  const outPath = path.join(outDir, s.name);
  const tempUserDir = `%TEMP%\\chr_shot_${Date.now()}`;
  const cmd = `cmd /c ""${CHROME}" --headless=new --user-data-dir="${tempUserDir}" --window-size=1440,900 --virtual-time-budget=6000 --screenshot="${outPath}" "${s.url}""`;
  try {
    execSync(cmd, { encoding: 'utf8', timeout: 25000 });
    console.log(`Captured ${s.name}: ${fs.statSync(outPath).size} bytes`);
  } catch (err) {
    console.error(`Failed ${s.name}: ${err.message}`);
  }
}

