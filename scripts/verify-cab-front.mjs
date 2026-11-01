import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\cab_verified';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const tests = [
  { name: 'stn2_cab_front_1366x768', url: 'http://localhost:3000/#station-02-narayana?view=cab', w: 1366, h: 768 },
  { name: 'stn2_cab_front_1920x1080', url: 'http://localhost:3000/#station-02-narayana?view=cab', w: 1920, h: 1080 },
];

for (const t of tests) {
  const fullPath = path.join(OUT_DIR, `${t.name}.png`);
  const cmd = `cmd /c ""${CHROME}" --headless=new --user-data-dir="%TEMP%\\chr_cab_${t.w}" --window-size=${t.w},${t.h} --screenshot="${fullPath}" "${t.url}""`;
  try {
    execSync(cmd, { encoding: 'utf8', timeout: 30000 });
    const stats = fs.statSync(fullPath);
    console.log(`[PASS] ${t.name}: ${stats.size} bytes`);
  } catch (err) {
    console.error(`[FAIL] ${t.name}: ${err.message}`);
  }
}
console.log('Cab front verification screenshots completed.');

