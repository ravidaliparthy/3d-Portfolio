import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\batch_a_shots';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const resolutions = [
  { name: '1920x1080', w: 1920, h: 1080 },
  { name: '1366x768', w: 1366, h: 768 },
  { name: '768x1024', w: 768, h: 1024 },
  { name: '390x844', w: 390, h: 844 },
];

const stations = [
  { num: 1, hash: 'station-01-about-me' },
  { num: 5, hash: 'station-05-building-footprint-extraction' },
  { num: 12, hash: 'station-12-future-roadmap' },
];

console.log('Starting automated screenshot verification for Batch A...');
const results = [];

for (const res of resolutions) {
  for (const stn of stations) {
    const filename = `stn${stn.num}_${res.name}.png`;
    const fullPath = path.join(OUT_DIR, filename);
    const url = `http://localhost:3000/#${stn.hash}`;

    // Note cmd /c syntax: when executable path has spaces, wrap whole command in extra quotes
    const cmd = `cmd /c ""${CHROME}" --headless=new --user-data-dir="%TEMP%\\chr_${res.w}_${stn.num}" --window-size=${res.w},${res.h} --screenshot="${fullPath}" "${url}""`;
    try {
      execSync(cmd, { encoding: 'utf8', timeout: 20000 });
      const stats = fs.statSync(fullPath);
      console.log(`[PASS] Station ${stn.num} @ ${res.name}: ${stats.size} bytes (${filename})`);
      results.push({ station: stn.num, res: res.name, status: 'PASS', size: stats.size, file: filename });
    } catch (err) {
      console.error(`[FAIL] Station ${stn.num} @ ${res.name}: ${err.message}`);
      results.push({ station: stn.num, res: res.name, status: 'FAIL', error: err.message });
    }
  }
}

fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(results, null, 2));
console.log('All screenshots captured and recorded in summary.json');
