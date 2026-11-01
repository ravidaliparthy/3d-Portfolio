import { execSync } from 'child_process';
import fs from 'fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\verified_fixes';

const tests = [
  { name: 'stn1_full_with_conductor.png', url: 'http://localhost:3000/#station-01-about-me?view=chase' },
  { name: 'stn12_terminus_board.png', url: 'http://localhost:3000/#station-12-terminus' },
];

for (const t of tests) {
  const filePath = `${OUT_DIR}\\${t.name}`;
  const cmd = `"${CHROME}" --headless=new --user-data-dir="%TEMP%\\chr_shot_${Date.now()}" --window-size=1920,1080 --virtual-time-budget=4000 --screenshot="${filePath}" "${t.url}"`;
  try {
    execSync(cmd, { stdio: 'inherit' });
    const stats = fs.statSync(filePath);
    console.log(`[PASS] ${t.name}: ${stats.size} bytes`);
  } catch (err) {
    console.error(`[FAIL] ${t.name}:`, err.message);
  }
}

