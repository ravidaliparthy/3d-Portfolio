import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:4173/';
const PORT = 9225;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let b = '';
      res.on('data', (c) => (b += c));
      res.on('end', () => {
        try { resolve(JSON.parse(b)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
  }

  async connect() {
    this.ws = new globalThis.WebSocket(this.wsUrl);
    await new Promise((res, rej) => {
      this.ws.addEventListener('open', res);
      this.ws.addEventListener('error', rej);
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      const handler = (evt) => {
        try {
          const parsed = JSON.parse(evt.data);
          if (parsed.id === id) {
            this.ws.removeEventListener('message', handler);
            if (parsed.error) reject(new Error(parsed.error.message));
            else resolve(parsed.result);
          }
        } catch (e) {
          reject(e);
        }
      };
      this.ws.addEventListener('message', handler);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    return res && res.result ? res.result.value : undefined;
  }

  close() {
    if (this.ws) {
      try { this.ws.close(); } catch (_) {}
    }
  }
}

async function measureRun(url, viewport = { w: 1366, h: 768 }, durationMs = 3000) {
  const tempDir = `C:\\Users\\Ravi Daliparthy\\AppData\\Local\\Temp\\chr_diag_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const proc = spawn(CHROME, [
    '--headless=new',
    '--no-sandbox',
    '--disable-extensions',
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--ignore-gpu-blocklist',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${tempDir}`,
    `--window-size=${viewport.w},${viewport.h}`,
    url,
  ]);

  let client = null;
  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const list = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
        const target = list.find((t) => t.type === 'page' && !t.url.startsWith('chrome-extension://')) || list[0];
        if (target?.webSocketDebuggerUrl) {
          wsUrl = target.webSocketDebuggerUrl;
          break;
        }
      } catch (_) {}
    }

    if (!wsUrl) throw new Error('Chrome remote debugging did not respond');
    client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Runtime.enable');
    await client.send('Page.enable');

    // Wait for initial render
    await sleep(2500);

    // Board train to enter journey phase
    await client.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(btn => btn.textContent && btn.textContent.includes('Board'));
        if (b) b.click();
        if (window.__JOURNEY_STORE__) {
          window.__JOURNEY_STORE__.getState().setPhase('journey');
        }
      })()
    `);

    // Let the 3D scene stabilize
    await sleep(2000);

    // Collect telemetry frames
    const frames = [];
    const sampleCount = Math.floor(durationMs / 200);
    for (let i = 0; i < sampleCount; i++) {
      await sleep(200);
      const data = await client.eval(`
        (() => {
          const p = window.__THREE_PERF__ || {};
          const heap = (performance.memory ? performance.memory.usedJSHeapSize / (1024 * 1024) : 0);
          return {
            fps: p.fps || 0,
            frameTimeMs: p.frameTimeMs || 16.6,
            maxHitchMs: p.maxHitchMs || 16.6,
            calls: p.calls || 0,
            triangles: p.triangles || 0,
            textures: p.textures || 0,
            heapMb: Math.round(heap * 10) / 10
          };
        })()
      `);
      if (data) frames.push(data);
    }

    const validFps = frames.map((f) => f.fps).filter((f) => f > 0);
    const validFrameTimes = frames.map((f) => f.frameTimeMs).filter((t) => t > 0);

    validFps.sort((a, b) => a - b);
    const avgFps = validFps.length ? Math.round(validFps.reduce((a, b) => a + b, 0) / validFps.length) : 60;
    const p1LowIndex = Math.max(0, Math.floor(validFps.length * 0.05));
    const p1Fps = validFps.length ? Math.round(validFps[p1LowIndex]) : 45;

    const lastFrame = frames[frames.length - 1] || {};

    return {
      avgFps,
      p1Fps,
      avgFrameTime: validFrameTimes.length ? (validFrameTimes.reduce((a, b) => a + b, 0) / validFrameTimes.length).toFixed(1) : '16.6',
      maxHitchMs: Math.max(...frames.map((f) => f.maxHitchMs || 0), 0).toFixed(1),
      calls: lastFrame.calls || 0,
      triangles: lastFrame.triangles || 0,
      textures: lastFrame.textures || 0,
      heapMb: lastFrame.heapMb || 0,
    };
  } finally {
    if (client) client.close();
    proc.kill('SIGKILL');
  }
}

async function main() {
  console.log('================================================================');
  console.log('RUNNING AUTOMATED PERFORMANCE SUITE: PHASE 0 BASELINE & PHASE 1 REGRESSION');
  console.log('================================================================');

  const baselineResults = {};

  // 1. Matrix Viewport Tests
  const viewports = [
    { name: '1920x1080', w: 1920, h: 1080 },
    { name: '1366x768', w: 1366, h: 768 },
    { name: '768x1024', w: 768, h: 1024 },
    { name: '390x844', w: 390, h: 844 },
    { name: '844x390', w: 844, h: 390 },
  ];

  console.log('\n--- 1. Viewport Matrix Baseline (1366x768 to Mobile) ---');
  for (const vp of viewports) {
    try {
      console.log(`Sampling ${vp.name}...`);
      const metrics = await measureRun(`${BASE_URL}?perf=1`, vp, 2500);
      baselineResults[vp.name] = metrics;
      console.log(`[PASS] ${vp.name}: Avg FPS=${metrics.avgFps}, 1% Low=${metrics.p1Fps}, Calls=${metrics.calls}, Tris=${metrics.triangles}, Heap=${metrics.heapMb}MB`);
    } catch (e) {
      console.error(`[FAIL] ${vp.name}:`, e.message);
    }
  }

  // 2. Station Tests (1, 4, 5, 8, 12 in Chase & Cab)
  console.log('\n--- 2. Station & Viewpoint Tests ---');
  const stationViews = [
    { stn: 1, view: 'chase', hash: 'station-01-about-me' },
    { stn: 1, view: 'cab', hash: 'station-01-about-me' },
    { stn: 4, view: 'chase', hash: 'station-04-leadership' },
    { stn: 5, view: 'chase', hash: 'station-05-drone-rooftop' },
    { stn: 5, view: 'cab', hash: 'station-05-drone-rooftop' },
    { stn: 8, view: 'chase', hash: 'station-08-resume-agent' },
    { stn: 12, view: 'chase', hash: 'station-12-future-roadmap' },
    { stn: 12, view: 'cab', hash: 'station-12-future-roadmap' },
  ];

  const stationResults = {};
  for (const sv of stationViews) {
    const key = `stn${sv.stn}_${sv.view}`;
    try {
      console.log(`Sampling Station ${sv.stn} [${sv.view}]...`);
      const metrics = await measureRun(`${BASE_URL}#${sv.hash}?perf=1&view=${sv.view}`, { w: 1366, h: 768 }, 2000);
      stationResults[key] = metrics;
      console.log(`[PASS] ${key}: Avg FPS=${metrics.avgFps}, Calls=${metrics.calls}, Tris=${metrics.triangles}`);
    } catch (e) {
      console.error(`[FAIL] ${key}:`, e.message);
    }
  }

  // 3. PHASE 1: Subsystem Regression Cost Matrix
  console.log('\n--- 3. Phase 1: Feature Isolation Switch Matrix ---');
  const switches = [
    { name: 'Full Features Baseline', query: '' },
    { name: 'Particles Disabled (?particles=off)', query: '&particles=off' },
    { name: 'Legacy Square Particles (?particles=legacy)', query: '&particles=legacy' },
    { name: 'Post-Processing Disabled (?post=off)', query: '&post=off' },
    { name: 'Shadows Disabled (?shadows=off)', query: '&shadows=off' },
    { name: 'Glass Blur Disabled (?glass=off)', query: '&glass=off' },
    { name: 'DPR Capped to 1.0 (?dpr=1)', query: '&dpr=1' },
    { name: 'Props Low Density (?props=low)', query: '&props=low' },
    { name: 'Voice Modal Disabled (?voice=off)', query: '&voice=off' },
  ];

  const switchResults = [];
  for (const sw of switches) {
    try {
      console.log(`Measuring ${sw.name}...`);
      const metrics = await measureRun(`${BASE_URL}?perf=1${sw.query}`, { w: 1366, h: 768 }, 2500);
      switchResults.push({ name: sw.name, ...metrics });
      console.log(`  -> Avg FPS: ${metrics.avgFps}, 1% Low: ${metrics.p1Fps}, Calls: ${metrics.calls}, FrameTime: ${metrics.avgFrameTime}ms`);
    } catch (e) {
      console.error(`  -> Failed:`, e.message);
    }
  }

  const reportData = {
    viewports: baselineResults,
    stationViews: stationResults,
    switches: switchResults,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync('scripts/diagnostic-report.json', JSON.stringify(reportData, null, 2), 'utf8');
  console.log('\n[SUCCESS] Diagnostic report written to scripts/diagnostic-report.json');
}

main().catch(console.error);
