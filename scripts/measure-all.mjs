import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9226;
const TARGET_URL = 'http://127.0.0.1:4173/?perf=1';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => resolve(JSON.parse(b)));
    }).on('error', reject);
  });
}

async function main() {
  const tempDir = `C:\\Users\\Ravi Daliparthy\\AppData\\Local\\Temp\\chr_eval_${Date.now()}`;
  const proc = spawn(CHROME, [
    '--headless=new',
    '--no-sandbox',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--ignore-gpu-blocklist',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + tempDir,
    '--window-size=1440,900',
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        const list = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
        if (list?.[0]?.webSocketDebuggerUrl) {
          wsUrl = list[0].webSocketDebuggerUrl;
          break;
        }
      } catch (e) {}
    }

    const ws = new globalThis.WebSocket(wsUrl);
    await new Promise((r) => ws.addEventListener('open', r));

    let id = 1;
    function call(method, params = {}) {
      return new Promise((resolve) => {
        const currentId = id++;
        const onMsg = (evt) => {
          const res = JSON.parse(evt.data);
          if (res.id === currentId) {
            ws.removeEventListener('message', onMsg);
            resolve(res.result);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id: currentId, method, params }));
      });
    }

    await call('Runtime.enable');
    await call('Page.enable');

    console.log('Navigating to:', TARGET_URL);
    await call('Page.navigate', { url: TARGET_URL });

    console.log('Waiting 5s for page and Three.js canvas to compile...');
    await sleep(5000);

    // Click "Board the Ravi Express (Station 1)" button
    const clickRes = await call('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const boardBtn = btns.find(b => b.textContent && b.textContent.includes('Board'));
          if (boardBtn) {
            boardBtn.click();
            return 'clicked: ' + boardBtn.textContent.trim();
          }
          if (window.__JOURNEY_STORE__) {
            window.__JOURNEY_STORE__.getState().setPhase('journey');
            return 'store set to journey';
          }
          return 'none found: ' + btns.map(b => b.textContent.trim()).join(', ');
        })()
      `,
      returnByValue: true,
    });
    console.log('Board Result:', clickRes?.result?.value);

    // Wait for train entrance animation / first station arrival
    await sleep(4000);

    // 1. Measure Station 1 Idle Metrics
    const stn1Perf = await call('Runtime.evaluate', {
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
    console.log('STATION 1 IDLE:', JSON.stringify(stn1Perf?.result?.value, null, 2));

    // 2. Measure Stations 2 through 6 (travel FPS and first arrival hitch)
    const travelMetrics = {};
    for (let stn = 2; stn <= 6; stn++) {
      console.log(`Advancing to Station ${stn}...`);
      await call('Runtime.evaluate', {
        expression: `
          (() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const n = btns.find(b => b.textContent && b.textContent.includes('Next Station'));
            if (n) { n.click(); return; }
            if (window.__JOURNEY_STORE__) {
              window.__JOURNEY_STORE__.getState().nextStation();
            }
          })()
        `,
      });

      // Sample traveling FPS over 2.5 seconds
      const samples = [];
      for (let s = 0; s < 10; s++) {
        await sleep(250);
        const samp = await call('Runtime.evaluate', {
          expression: `window.__THREE_PERF__`,
          returnByValue: true,
        });
        if (samp?.result?.value) {
          samples.push(samp.result.value);
        }
      }

      const stnEval = await call('Runtime.evaluate', {
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

      const val = stnEval?.result?.value;
      travelMetrics[`Station ${stn}`] = {
        maxHitchMs: Math.round((val?.perf?.maxHitchMs || 0) * 10) / 10,
        calls: val?.perf?.calls,
        triangles: val?.perf?.triangles,
        textures: val?.perf?.textures,
        fpsAvgTravelling: Math.round(samples.reduce((a, b) => a + (b.fps || 0), 0) / (samples.length || 1)),
        fpsArrival: Math.round(val?.perf?.fps || 0),
        heapMb: val?.heapMb,
      };
      console.log(`Station ${stn}:`, travelMetrics[`Station ${stn}`]);
    }

    // Capture screenshot showing ?perf=1 overlay in live view
    const shot = await call('Page.captureScreenshot', { format: 'png' });
    const outPath = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes\\perf_optimized_overlay.png';
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('Successfully saved verification screenshot to:', outPath);

    console.log('\n=== COMPLETE PERFORMANCE PASS DATA ===');
    console.log('Station 1 Idle:', stn1Perf?.result?.value);
    console.log('Stations 2-6:', travelMetrics);

    ws.close();
  } finally {
    proc.kill();
  }
}

main().catch(console.error);

