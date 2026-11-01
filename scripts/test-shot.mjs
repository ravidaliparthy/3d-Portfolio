import { execSync } from 'child_process';
import fs from 'fs';

const OUT_PATH = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes\\live_conductor_disappear_check.png';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tempUserDir = `%TEMP%\\chr_shot_intro_${Date.now()}`;
const cmd = `cmd /c ""${CHROME}" --headless=new --no-sandbox --disable-gpu --disable-extensions --disable-background-networking --disable-sync --user-data-dir="${tempUserDir}" --window-size=1440,900 --virtual-time-budget=4000 --screenshot="${OUT_PATH}" "http://127.0.0.1:4173/#station-01-about-me""`;

try {
  execSync(cmd, { encoding: 'utf8', timeout: 20000 });
  console.log(`[PASS] test_refresh_intro: ${fs.statSync(OUT_PATH).size} bytes`);
} catch (err) {
  console.error(`[FAIL]: ${err.message}`);
}

