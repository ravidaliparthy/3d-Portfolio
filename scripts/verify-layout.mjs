import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\layout_verified';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const tests = [
  { name: 'stn3_chase_1366x768', url: 'http://localhost:3000/#station-03-sastra-university?view=chase', w: 1366, h: 768 },
  { name: 'stn3_cab_1366x768', url: 'http://localhost:3000/#station-03-sastra-university?view=cab', w: 1366, h: 768 },
  { name: 'stn3_chase_1920x1080', url: 'http://localhost:3000/#station-03-sastra-university?view=chase', w: 1920, h: 1080 },
  { name: 'stn3_cab_1920x1080', url: 'http://localhost:3000/#station-03-sastra-university?view=cab', w: 1920, h: 1080 },
];

for (const t of tests) {
  const fullPath = path.join(OUT_DIR, `${t.name}.png`);
  const cmd = `cmd /c ""${CHROME}" --headless=new --user-data-dir="%TEMP%\\chr_test_${t.w}_${t.name}" --window-size=${t.w},${t.h} --screenshot="${fullPath}" "${t.url}""`;
  try {
    execSync(cmd, { encoding: 'utf8', timeout: 30000 });
    const stats = fs.statSync(fullPath);
    console.log(`[PASS] ${t.name}: ${stats.size} bytes`);
  } catch (err) {
    console.error(`[FAIL] ${t.name}: ${err.message}`);
  }
}
console.log('Layout verification screenshots completed.');

