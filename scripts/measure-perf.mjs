import { spawn } from 'child_process';
import http from 'http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const TARGET_URL = 'http://127.0.0.1:4173/?perf=1';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Launching headless Chrome with remote debugging on port', PORT);
  const tempDir = `C:\\Users\\Ravi Daliparthy\\AppData\\Local\\Temp\\chrome_perf_${Date.now()}`;
  const chromeProcess = spawn(CHROME, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu-sandbox',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + tempDir,
    '--window-size=1440,900',
    TARGET_URL,
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        const list = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
        if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
          wsUrl = list[0].webSocketDebuggerUrl;
          break;
        }
      } catch (e) {}
    }

    if (!wsUrl) {
      throw new Error('Could not connect to Chrome debugging port.');
    }

    console.log('Connected to Chrome WebSocket:', wsUrl);
    // Built-in WebSocket in Node 22
    const ws = new globalThis.WebSocket(wsUrl);

    await new Promise((res) => ws.addEventListener('open', res));

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (evt) => {
          const parsed = JSON.parse(evt.data);
          if (parsed.id === id) {
            ws.removeEventListener('message', handler);
            resolve(parsed.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Enable Runtime and Page
    await send('Runtime.enable');
    await send('Page.enable');

    console.log('Waiting for initial scene and shaders to mount...');
    await sleep(4000);

    // Click "Board the Ravi Express (Station 1)" button to enter the main 3D world
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const boardBtn = btns.find(b => b.textContent && b.textContent.includes('Board the Ravi Express'));
          if (boardBtn) boardBtn.click();
        })()
      `,
    });

    await sleep(3000);

    // Sample Idle Metrics
    const idleRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            perf: window.__THREE_PERF__,
            heapMb: (performance.memory ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)) : 0)
          };
        })()
      `,
      returnByValue: true,
    });

    console.log('IDLE METRICS AT STATION 1:', JSON.stringify(idleRes.value, null, 2));

    // Measure travel and station arrivals
    const stationHitches = {};

    for (let stn = 2; stn <= 6; stn++) {
      console.log(`Navigating to Station ${stn}...`);
      const t0 = Date.now();
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const nextBtn = btns.find(b => b.textContent && b.textContent.includes('Next Station'));
            if (nextBtn) nextBtn.click();
          })()
        `,
      });

      // Sample traveling FPS for 2.5 seconds
      const samples = [];
      for (let s = 0; s < 10; s++) {
        await sleep(250);
        const sample = await send('Runtime.evaluate', {
          expression: `window.__THREE_PERF__`,
          returnByValue: true,
        });
        if (sample.value) {
          samples.push(sample.value);
        }
      }

      const arrivalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            return {
              perf: window.__THREE_PERF__,
              heapMb: (performance.memory ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)) : 0)
            };
          })()
        `,
        returnByValue: true,
      });

      const maxHitch = arrivalRes.value?.perf?.maxHitchMs || 0;
      stationHitches[`Station ${stn}`] = {
        maxHitchMs: maxHitch,
        calls: arrivalRes.value?.perf?.calls,
        triangles: arrivalRes.value?.perf?.triangles,
        fpsTravelling: Math.round(samples.reduce((acc, x) => acc + (x.fps || 0), 0) / (samples.length || 1)),
        fpsArrival: Math.round(arrivalRes.value?.perf?.fps || 0),
        heapMb: arrivalRes.value?.heapMb,
      };
      console.log(`Station ${stn} Result:`, stationHitches[`Station ${stn}`]);
    }

    // Capture screenshot of the optimized state with ?perf=1 overlay
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const fs = await import('fs');
    const outPath = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes\\perf_optimized_overlay.png';
    fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Saved verification screenshot with ?perf=1 overlay to:', outPath);

    console.log('--- ALL OPTIMIZATION METRICS ---');
    console.log('Idle Metrics:', idleRes.value);
    console.log('Station Hitches & Travel:', stationHitches);

    ws.close();
  } finally {
    chromeProcess.kill();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
