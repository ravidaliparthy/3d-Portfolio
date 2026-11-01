import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const fullPath = path.join(OUT_DIR, 'station_03_sastra.png');
const url = 'http://localhost:3000/#station-03-sastra';
const tempUserDir = `%TEMP%\\chr_shot_stn3_${Date.now()}`;
const cmd = `cmd /c ""${CHROME}" --headless=new --no-sandbox --disable-gpu --disable-extensions --disable-background-networking --disable-sync --user-data-dir="${tempUserDir}" --window-size=1440,900 --screenshot="${fullPath}" "${url}""`;
execSync(cmd, { encoding: 'utf8', timeout: 30000 });
console.log('Station 3 captured:', fs.statSync(fullPath).size);

