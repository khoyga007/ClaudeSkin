// ClaudeSkin inject: uses the app's own Developer menu > "Enable Main Process Debugger"
// (Node inspector on 127.0.0.1:9229). No restart, no flags, no app files touched.
// Usage: node inject.mjs [theme = any themes/<name>.js, default koi] [--words]. Applies audit.js + themes/<name>.js to every window, audits contrast, ROLLS BACK automatically
// if the theme makes text harder to read than stock.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
if (typeof WebSocket !== 'function') { console.log('[FAIL] Needs Node.js 22 or newer (global WebSocket). You have ' + process.version); process.exit(1); }
const THEME = (process.argv[2] || 'koi').replace(/[^a-z0-9-]/gi, '');
if (!existsSync(path.join(HERE, 'themes', `${THEME}.js`))) { console.log(`[FAIL] No theme '${THEME}'. Available: ${readdirSync(path.join(HERE, 'themes')).map((f) => f.replace(/\.js$/, '')).join(', ')}`); process.exit(1); }
const WORDS = process.argv.includes('--words');   // attention: chat words on by default (still toggles with Ctrl+Alt+W)
const SRC = (WORDS ? 'window.__claudeSkinChatDefault = true;\n' : '') + readFileSync(path.join(HERE, 'audit.js'), 'utf8') + '\n' + readFileSync(path.join(HERE, 'themes', `${THEME}.js`), 'utf8');
console.log(`theme: ${THEME}`);
// Music: every audio file in music/<theme>/ (sorted by name) is handed to the theme, if it exposes __claudeSkinMusic.
const MUSIC_MIME = { '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.flac': 'audio/flac', '.webm': 'audio/webm' };
const MUSIC_DIR = path.join(HERE, 'music', THEME);
const MUSIC = !existsSync(MUSIC_DIR) ? [] : readdirSync(MUSIC_DIR).sort().map((f) => ({ file: path.join(MUSIC_DIR, f), mime: MUSIC_MIME[path.extname(f).toLowerCase()], name: path.basename(f, path.extname(f)) })).filter((m) => m.mime);
if (MUSIC.length) console.log(`music: ${MUSIC.map((m) => m.name).join(', ')}`);
// Images: a theme header line "// @assets a b c" names files in assets/<theme>/ (any of .png .jpg .webp) handed over
// via __claudeSkinAssets.add to every themed page. Missing files are reported, the theme decides what to do without them.
const IMG_MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const WANT = (readFileSync(path.join(HERE, 'themes', `${THEME}.js`), 'utf8').match(/^\/\/ @assets (.+)$/m)?.[1] || '').trim().split(/\s+/).filter(Boolean);
const ASSETS = WANT.map((name) => {
  const ext = Object.keys(IMG_MIME).find((e) => existsSync(path.join(HERE, 'assets', THEME, name + e)));
  if (!ext) console.log(`[WARN] missing assets/${THEME}/${name}.png (run we-extract.mjs?)`);
  return ext && { file: path.join(HERE, 'assets', THEME, name + ext), mime: IMG_MIME[ext], name };
}).filter(Boolean);
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
  // Music goes to ONE webContents only (two windows playing the same track = mush). Files are re-read from disk
  // on every send, so the main process does not hold them. userGesture=true lets playback start without a click.
  g.__claudeSkinMusic = ${JSON.stringify(MUSIC)};
  g.__claudeSkinMusicWc = 0;
  const fs = require('fs');   // grab now: the inspector's require is gone after the first await
  g.__claudeSkinSendMusic = async (wc) => {
    let n = 0;
    for (const m of g.__claudeSkinMusic || []) {
      let b64; try { b64 = fs.readFileSync(m.file).toString('base64'); } catch { continue; }
      const ok = await wc.executeJavaScript('window.__claudeSkinMusic ? window.__claudeSkinMusic.add(' + JSON.stringify(b64) + ',' + JSON.stringify(m.mime) + ',' + JSON.stringify(m.name) + ') : 0', true).catch(() => 0);
      if (ok) n++;
    }
    return n;
  };
  g.__claudeSkinAssets = ${JSON.stringify(ASSETS)};
  g.__claudeSkinSendAssets = async (wc) => {
    for (const a of g.__claudeSkinAssets || []) {
      let b64; try { b64 = fs.readFileSync(a.file).toString('base64'); } catch { continue; }
      await wc.executeJavaScript('window.__claudeSkinAssets && window.__claudeSkinAssets.add(' + JSON.stringify(a.name) + ',' + JSON.stringify(b64) + ',' + JSON.stringify(a.mime) + ')', true).catch(() => {});
    }
  };
  // Hooks call through g, so a later inject replaces the behaviour instead of stacking listeners.
  // (The "2" guards: listeners left by a pre-music inject in a still-running app only re-apply the skin, harmless.)
  g.__claudeSkinApply = async (wc) => {
    if (wc.isDestroyed() || (wc.getURL() || '').startsWith('devtools://') || !g.__claudeSkinSrc) return;
    await wc.executeJavaScript(g.__claudeSkinSrc, true).catch(() => {});
    if (g.__claudeSkinSendAssets) await g.__claudeSkinSendAssets(wc);
    if (wc.id === g.__claudeSkinMusicWc) await g.__claudeSkinSendMusic(wc);
  };
  const hook = (wc) => {
    if (wc.__claudeSkinHooked2) return;
    wc.__claudeSkinHooked2 = true;
    wc.on('dom-ready', () => g.__claudeSkinApply(wc));
  };
  g.__claudeSkinHook = hook;
  if (!g.__claudeSkinAppHooked2) { g.__claudeSkinAppHooked2 = true; app.on('web-contents-created', (_e, wc) => g.__claudeSkinHook(wc)); }
  const out = [];
  for (const wc of webContents.getAllWebContents()) {
    hook(wc);
    if (wc.isDestroyed() || wc.getURL() === 'about:blank') continue;
    await wc.executeJavaScript(g.__claudeSkinSrc, true).catch(() => {});
    await g.__claudeSkinSendAssets(wc);
    await new Promise((r) => setTimeout(r, 400));
    const res = await wc.executeJavaScript(${JSON.stringify(PAGE_CHECK)}, true).catch((e) => ({ state: 'ERR ' + e }));
    if (res.state === 'ROLLED-BACK') g.__claudeSkinSrc = '';   // stop re-applying anywhere
    out.push({ url: wc.getURL().slice(0, 50), ...res, wc });
  }
  // Music target = the themed page with the most text (the chat window, not the title-bar shell or a preview tab).
  const best = out.filter((o) => o.state === 'on').sort((a, b) => (b.n || 0) - (a.n || 0))[0];
  if (best && g.__claudeSkinMusic.length) { g.__claudeSkinMusicWc = best.wc.id; best.music = await g.__claudeSkinSendMusic(best.wc); }
  for (const o of out) delete o.wc;
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
