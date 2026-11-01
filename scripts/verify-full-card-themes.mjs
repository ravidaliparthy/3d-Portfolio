import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const tests = [
  { name: 'terminus_whole_card_light', url: 'http://localhost:3000/#terminus' },
  { name: 'terminus_whole_card_dark', url: 'http://localhost:3000/?theme=dark#terminus' },
];

for (const t of tests) {
  const fullPath = path.join(OUT_DIR, `${t.name}.png`);
  const tempUserDir = `%TEMP%\\chr_shot_theme_${t.name}_${Date.now()}`;
  const cmd = `cmd /c ""${CHROME}" --headless=new --no-sandbox --disable-gpu --disable-extensions --disable-background-networking --disable-sync --user-data-dir="${tempUserDir}" --window-size=1440,900 --screenshot="${fullPath}" "${t.url}""`;
  try {
    execSync(cmd, { encoding: 'utf8', timeout: 30000 });
    console.log(`[PASS] ${t.name}: ${fs.statSync(fullPath).size} bytes at ${fullPath}`);
  } catch (err) {
    console.error(`[FAIL] ${t.name}: ${err.message}`);
  }
}

