import { execSync } from 'child_process';
import fs from 'fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_FILE = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\verified_fixes\\stn1_decongested.png';

const cmd = `"${CHROME}" --headless=new --user-data-dir="%TEMP%\\chr_dec_99" --window-size=1920,1080 --virtual-time-budget=5000 --screenshot="${OUT_FILE}" "http://localhost:3000/#station-01-about-me?view=chase"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  const stats = fs.statSync(OUT_FILE);
  console.log('SUCCESS:', stats.size);
} catch (e) {
  console.error('ERROR:', e.message);
}

