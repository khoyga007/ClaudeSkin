// ClaudeSkin inject: uses the app's own Developer menu > "Enable Main Process Debugger"
// (Node inspector on 127.0.0.1:9229). No restart, no flags, no app files touched.
// Usage: node inject.mjs [koi|earth|attention] [--words]. Applies audit.js + themes/<name>.js to every window, audits contrast, ROLLS BACK automatically
// if the theme makes text harder to read than stock.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
if (typeof WebSocket !== 'function') { console.log('[FAIL] Needs Node.js 22 or newer (global WebSocket). You have ' + process.version); process.exit(1); }
const THEME = (process.argv[2] || 'koi').replace(/[^a-z0-9-]/gi, '');
if (!existsSync(path.join(HERE, 'themes', `${THEME}.js`))) { console.log(`[FAIL] No theme '${THEME}'. Available: koi, earth, attention`); process.exit(1); }
const WORDS = process.argv.includes('--words');   // attention: chat words on by default (still toggles with Ctrl+Alt+W)
const SRC = (WORDS ? 'window.__claudeSkinChatDefault = true;\n' : '') + readFileSync(path.join(HERE, 'audit.js'), 'utf8') + '\n' + readFileSync(path.join(HERE, 'themes', `${THEME}.js`), 'utf8');
console.log(`theme: ${THEME}`);
const PORT = Number(process.env.CS_PORT || 9229);

const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).catch(() => null);
const target = list?.find((t) => t.type === 'node' && /claude/i.test(t.title)) || (list?.length === 1 ? list[0] : null);
if (!target) {
  console.log('[FAIL] Claude main-process debugger not found on 127.0.0.1:' + PORT + '. In Claude: Developer menu > Enable Main Process Debugger, then run again.');
  process.exit(1);
}

// Page side: apply, measure stock vs themed contrast, keep only if not worse.
const PAGE_CHECK = `(async () => {
  if (window.__claudeSkinState !== 'on') return { state: window.__claudeSkinState || 'none' };
  const st = document.getElementById('cs-style'), bd = document.getElementById('cs-backdrop');
  st.disabled = true; bd.style.display = 'none';
  await new Promise((r) => setTimeout(r, 120));
  const before = window.__claudeSkinAudit(false);
  st.disabled = false; bd.style.display = '';
  await new Promise((r) => setTimeout(r, 120));
  const after = window.__claudeSkinAudit(true);
  const worse = after.fails > before.fails + Math.max(3, Math.round(after.n * 0.02));
  if (worse) window.__claudeSkinCleanup();
  return { state: worse ? 'ROLLED-BACK' : 'on', before: before.fails, after: after.fails, n: after.n, worst: after.worst };
})()`;

const mainCode = `(async () => {
  const { app, webContents } = require('electron');
  const g = globalThis;
  g.__claudeSkinSrc = ${JSON.stringify(SRC)};
  const apply = (wc) => {
    if (wc.isDestroyed() || (wc.getURL() || '').startsWith('devtools://') || !g.__claudeSkinSrc) return;
    wc.executeJavaScript(g.__claudeSkinSrc, true).catch(() => {});
  };
  const hook = (wc) => {
    if (wc.__claudeSkinHooked) return;
    wc.__claudeSkinHooked = true;
    wc.on('dom-ready', () => apply(wc));
  };
  if (!g.__claudeSkinAppHooked) { g.__claudeSkinAppHooked = true; app.on('web-contents-created', (_e, wc) => hook(wc)); }
  const out = [];
  for (const wc of webContents.getAllWebContents()) {
    hook(wc);
    if (wc.isDestroyed() || wc.getURL() === 'about:blank') continue;
    await wc.executeJavaScript(g.__claudeSkinSrc, true).catch(() => {});
    await new Promise((r) => setTimeout(r, 400));
    const res = await wc.executeJavaScript(${JSON.stringify(PAGE_CHECK)}, true).catch((e) => ({ state: 'ERR ' + e }));
    if (res.state === 'ROLLED-BACK') g.__claudeSkinSrc = '';   // stop re-applying anywhere
    out.push({ url: wc.getURL().slice(0, 50), ...res });
  }
  return JSON.stringify(out, null, 1);
})()`;

const ws = new WebSocket(target.webSocketDebuggerUrl);
ws.addEventListener('open', () => {
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: mainCode, includeCommandLineAPI: true, awaitPromise: true, returnByValue: true } }));
});
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id !== 1) return;
  const r = msg.result;
  if (r?.exceptionDetails) console.log('[FAIL]', r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  else console.log(r?.result?.value);
  ws.close();
});
ws.addEventListener('error', () => { console.log('[FAIL] websocket'); process.exit(1); });
