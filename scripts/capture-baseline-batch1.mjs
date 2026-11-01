import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\baseline_batch1';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const resolutions = [
  { name: '1366x768', w: 1366, h: 768 },
  { name: '390x844', w: 390, h: 844 },
];

const stations = [
  { num: 1, hash: 'station-01-about-me' },
  { num: 5, hash: 'station-05-drone-rooftop' },
  { num: 12, hash: 'station-12-terminus' },
];

console.log('Capturing baseline screenshots for stations 1, 5, 12 at 1366x768 and 390x844...');
for (const res of resolutions) {
  for (const stn of stations) {
    const filename = `baseline_stn${stn.num}_${res.name}.png`;
    const fullPath = path.join(OUT_DIR, filename);
    const url = `http://127.0.0.1:4173/#${stn.hash}`;
    const cmd = `cmd /c ""${CHROME}" --headless=new --user-data-dir="%TEMP%\\chr_b1_${res.w}_${stn.num}" --window-size=${res.w},${res.h} --screenshot="${fullPath}" "${url}""`;
    try {
      execSync(cmd, { encoding: 'utf8', timeout: 25000 });
      const stats = fs.statSync(fullPath);
      console.log(`[PASS] Station ${stn.num} @ ${res.name}: ${stats.size} bytes (${filename})`);
    } catch (err) {
      console.error(`[FAIL] Station ${stn.num} @ ${res.name}: ${err.message}`);
    }
  }
}
console.log('Baseline screenshots completed.');

