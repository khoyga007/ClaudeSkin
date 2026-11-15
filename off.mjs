// Removes the ClaudeSkin theme from every Claude window (needs the main-process debugger on).
const PORT = Number(process.env.CS_PORT || 9229);
const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).catch(() => null);
const target = list?.find((t) => t.type === 'node' && /claude/i.test(t.title)) || (list?.length === 1 ? list[0] : null);
if (!target) {
  console.log('[FAIL] Debugger is off. Easiest way to remove the theme: restart Claude (nothing is saved to disk).');
  process.exit(1);
}
const code = `(async () => {
  const { webContents } = require('electron');
  globalThis.__claudeSkinSrc = '';   // stop re-applying on reload / new windows
  let n = 0;
  for (const wc of webContents.getAllWebContents()) {
    if (wc.isDestroyed()) continue;
    await wc.executeJavaScript('window.__claudeSkinCleanup && window.__claudeSkinCleanup(); 1', true).catch(() => {});
    n++;
  }
  return 'ClaudeSkin removed from ' + n + ' window(s)';
})()`;
const ws = new WebSocket(target.webSocketDebuggerUrl);
ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: code, includeCommandLineAPI: true, awaitPromise: true, returnByValue: true } }));
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id === 1) { console.log(m.result?.result?.value ?? JSON.stringify(m.result)); ws.close(); } };
ws.onerror = () => { console.log('[FAIL] websocket'); process.exit(1); };
