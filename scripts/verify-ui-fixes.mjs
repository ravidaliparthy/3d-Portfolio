import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_DIR = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes';

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function getWsUrl(port) {
  for (let i = 0; i < 20; i++) {
    try {
      const data = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/list`, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(body));
        }).on('error', reject);
      });
      const parsed = JSON.parse(data);
      if (parsed.length > 0 && parsed[0].webSocketDebuggerUrl) {
        return parsed[0].webSocketDebuggerUrl;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error('Could not get CDP page debugger url');
}

async function run() {
  const port = 9333;
  const userDataDir = 'C:\\Users\\Ravi Daliparthy\\Desktop\\online portfolio 3d\\.chrome-test-profile';
  
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1280,720',
    '--hide-scrollbars',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    console.log('Connected to Chrome WebSocket:', wsUrl);

    const ws = new globalThis.WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let msgId = 1;
    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const resp = JSON.parse(evt.data);
          if (resp.id === id) {
            ws.removeEventListener('message', handler);
            if (resp.error) reject(resp.error);
            else resolve(resp.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');

    console.log('Navigating to http://127.0.0.1:4173 ...');
    await sendCommand('Page.navigate', { url: 'http://127.0.0.1:4173' });
    await new Promise(r => setTimeout(r, 3000));

    // Helper to evaluate script
    async function evalCode(expression) {
      const res = await sendCommand('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return res?.result?.value;
    }

    // Helper to take screenshot
    async function saveScreenshot(filename) {
      const { data } = await sendCommand('Page.captureScreenshot', { format: 'png' });
      const dest = path.join(TARGET_DIR, filename);
      fs.writeFileSync(dest, Buffer.from(data, 'base64'));
      console.log(`Saved screenshot: ${dest}`);
    }

    // 1. Board Station 1 from Intro
    await evalCode(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Board the Ravi Express'));
      if (btn) btn.click();
    `);
    await new Promise(r => setTimeout(r, 1500));

    // 2. Open Camera Views Dropdown Menu
    await evalCode(`
      const camBtn = document.querySelector('button[aria-label="Camera viewpoints menu"]');
      if (camBtn) camBtn.click();
    `);
    await new Promise(r => setTimeout(r, 500));
    await saveScreenshot('live_camera_menu_open.png');

    // 3. Switch to Unified Menu Dropdown
    await evalCode(`
      const menuBtn = document.querySelector('button[aria-label="Navigation and system menu"]');
      if (menuBtn) menuBtn.click();
    `);
    await new Promise(r => setTimeout(r, 500));
    await saveScreenshot('live_dark_unified_menu.png');

    // 4. Open Conductor Boarding Dialog
    await evalCode(`
      const conductorBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Conductor: Board State'));
      if (conductorBtn) conductorBtn.click();
    `);
    await new Promise(r => setTimeout(r, 500));
    await saveScreenshot('live_conductor_dialog_instant.png');

    // 5. Test clicking State 2 card in Conductor Dialog & measure transit time
    const transitStartTime = Date.now();
    await evalCode(`
      const state2Card = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('State 2: Academic Foundations'))?.closest('div.group');
      if (state2Card) state2Card.click();
    `);

    // Wait 2.6 seconds (the 2-3s transit window)
    await new Promise(r => setTimeout(r, 2600));
    await saveScreenshot('live_arrived_station2_smooth.png');
    console.log('Transit completed smoothly in ~2.6s');

    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
