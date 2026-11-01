import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const shotIntro = path.join(outDir, 'intro_no_station_numbers.png');
const cmd = `cmd /c ""${CHROME}" --headless=new --user-data-dir="%TEMP%\\chr_intro_check" --window-size=1366,768 --screenshot="${shotIntro}" "http://127.0.0.1:4173/""`;

try {
  execSync(cmd, { encoding: 'utf8', timeout: 20000 });
  console.log('Intro Shot successfully captured:', fs.statSync(shotIntro).size, 'bytes');
} catch (e) {
  console.error('Failed to capture:', e.message);
}

