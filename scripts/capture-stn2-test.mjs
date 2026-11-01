import { execSync } from 'child_process';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const out = path.resolve('C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes\\current_station2_check.png');

const cmd = `cmd /c ""${CHROME}" --headless=new --user-data-dir="%TEMP%\\chr_stn2_eval" --window-size=1366,768 --screenshot="${out}" "http://127.0.0.1:4173/?direct=true#station-02-narayana""`;

try {
  execSync(cmd, { encoding: 'utf8', timeout: 20000 });
  console.log('Station 2 screenshot taken successfully');
} catch (e) {
  console.error('Failed:', e.message);
}

