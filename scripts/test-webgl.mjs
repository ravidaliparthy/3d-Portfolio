import { spawn } from 'child_process';
import http from 'http';

const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--no-sandbox',
  '--enable-webgl',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--ignore-gpu-blocklist',
  '--remote-debugging-port=9225',
  'http://127.0.0.1:4173/?perf=1'
]);

setTimeout(async () => {
  try {
    const list = await new Promise(r => http.get('http://127.0.0.1:9225/json/list', res => {
      let b = ''; res.on('data', c => b += c); res.on('end', () => r(JSON.parse(b)));
    }));
    const ws = new globalThis.WebSocket(list[0].webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener('open', r));
    ws.addEventListener('message', evt => {
      const msg = JSON.parse(evt.data);
      if (msg.id === 1) {
        console.log('EVAL RESULT:', msg.result.result.value);
        proc.kill();
        process.exit(0);
      }
    });
    ws.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: '(() => { const c = document.createElement("canvas"); return { hasGL: !!(c.getContext("webgl") || c.getContext("experimental-webgl")), title: document.title, buttons: Array.from(document.querySelectorAll("button")).map(b => b.textContent.trim()) }; })()',
        returnByValue: true
      }
    }));
  } catch (e) {
    console.error(e);
    proc.kill();
  }
}, 3000);

