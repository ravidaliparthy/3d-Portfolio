import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\guide_verified';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const filename = 'guide_opened_1366x768.png';
const fullPath = path.join(OUT_DIR, filename);
const url = 'http://localhost:3000/#station-03-sastra-university?view=chase';

const cmd = `cmd /c ""${CHROME}" --headless=new --user-data-dir="%TEMP%\\chr_guide_test" --window-size=1366,768 --screenshot="${fullPath}" "${url}""`;
try {
  execSync(cmd, { encoding: 'utf8', timeout: 30000 });
  const stats = fs.statSync(fullPath);
  console.log(`[PASS] Guide initial screen: ${stats.size} bytes`);
} catch (err) {
  console.error(`[FAIL]: ${err.message}`);
}

