import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9224;
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
    TARGET_URL,
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
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
            resolve(res);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id: currentId, method, params }));
      });
    }

    await call('Runtime.enable');
    await call('Page.enable');

    console.log('Navigating to target URL:', TARGET_URL);
    await call('Page.navigate', { url: TARGET_URL });

    console.log('Waiting 5s for WebGL load...');
    await sleep(5000);

    // Enter journey phase via direct store call or click
    const boardRes = await call('Runtime.evaluate', {
      expression: `
        (() => {
          if (window.__JOURNEY_STORE__) {
            window.__JOURNEY_STORE__.getState().setPhase('journey');
            window.__JOURNEY_STORE__.getState().goToStation(0);
            return 'store: journey started';
          }
          const btns = Array.from(document.querySelectorAll('button'));
          const b = btns.find(x => x.textContent && x.textContent.includes('Board'));
          if (b) { b.click(); return 'clicked board button'; }
          return 'waiting';
        })()
      `,
      returnByValue: true,
    });
    console.log('Board Action:', boardRes?.result?.result?.value);

    await sleep(4000);

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

    console.log('Station 1 Perf:', JSON.stringify(stn1Perf?.result?.result?.value, null, 2));

    const stnResults = {};
    for (let stn = 1; stn <= 5; stn++) {
      console.log(`Navigating to Station ${stn + 1}...`);
      await call('Runtime.evaluate', {
        expression: `
          (() => {
            if (window.__JOURNEY_STORE__) {
              window.__JOURNEY_STORE__.getState().nextStation();
            } else {
              const btns = Array.from(document.querySelectorAll('button'));
              const n = btns.find(x => x.textContent && x.textContent.includes('Next Station'));
              if (n) n.click();
            }
          })()
        `,
      });

      // Sample travelling for 2.5s
      const samples = [];
      for (let s = 0; s < 10; s++) {
        await sleep(250);
        const samp = await call('Runtime.evaluate', {
          expression: `window.__THREE_PERF__`,
          returnByValue: true,
        });
        if (samp?.result?.result?.value) {
          samples.push(samp.result.result.value);
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

      const val = stnEval?.result?.result?.value;
      stnResults[`Station ${stn + 1}`] = {
        maxHitchMs: val?.perf?.maxHitchMs,
        calls: val?.perf?.calls,
        triangles: val?.perf?.triangles,
        textures: val?.perf?.textures,
        fpsAvgTravelling: Math.round(samples.reduce((a, b) => a + (b.fps || 0), 0) / (samples.length || 1)),
        fpsArrival: Math.round(val?.perf?.fps || 0),
        heapMb: val?.heapMb,
      };
      console.log(`Station ${stn + 1}:`, stnResults[`Station ${stn + 1}`]);
    }

    const shot = await call('Page.captureScreenshot', { format: 'png' });
    const outPath = 'C:\\Users\\Ravi Daliparthy\\.gemini\\antigravity\\brain\\3d1d3bd7-9827-47b8-9823-d0a840ae0331\\live_verified_fixes\\perf_optimized_overlay.png';
    fs.writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'));
    console.log('Saved screenshot to:', outPath);

    ws.close();
  } finally {
    proc.kill();
  }
}

main().catch(console.error);
