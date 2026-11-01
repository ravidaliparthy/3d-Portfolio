import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\screenshots_batch_a';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const resolutions = [
  { name: '1920x1080', w: 1920, h: 1080 },
  { name: '1366x768', w: 1366, h: 768 },
  { name: '768x1024', w: 768, h: 1024 },
  { name: '390x844', w: 390, h: 844 },
];

const stations = [
  { id: 'station-01-about-me', label: 'stn1' },
  { id: 'station-05-building-footprint-extraction', label: 'stn5' },
  { id: 'station-12-future-roadmap', label: 'stn12' },
];

console.log('Starting screenshot captures for Batch A...');

for (const res of resolutions) {
  for (const stn of stations) {
    const url = `http://localhost:3000/#${stn.id}`;
    const outPath = path.join(OUT_DIR, `${stn.label}_${res.name}.png`);
    const cmd = `"${CHROME_PATH}" --headless=new --disable-gpu --virtual-time-budget=4000 --window-size=${res.w},${res.h} --screenshot="${outPath}" "${url}"`;
    try {
      execSync(cmd, { stdio: 'ignore', timeout: 15000 });
      console.log(`Captured: ${stn.label} @ ${res.name} -> ${outPath}`);
    } catch (err) {
      console.error(`Failed ${stn.label} @ ${res.name}:`, err.message);
    }
  }
}

console.log('Finished capturing Batch A screenshots.');

