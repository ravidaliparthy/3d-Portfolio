import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes';

const shotStn2 = path.join(outDir, 'live_station2_refined.png');
const tempDir = `%TEMP%\\chr_shot_${Date.now()}`;
const cmd = `cmd /c ""${CHROME}" --headless=new --user-data-dir="${tempDir}" --window-size=1440,900 --virtual-time-budget=6000 --screenshot="${shotStn2}" "http://127.0.0.1:4173/#narayana""`;

try {
  execSync(cmd, { encoding: 'utf8', timeout: 25000 });
  console.log(`Station 2 refined shot: ${fs.statSync(shotStn2).size} bytes`);
} catch (e) {
  console.error('Failed:', e.message);
}
