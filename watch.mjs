// ClaudeSkin watch: stays in background, applies theme whenever Claude (with Main Process Debugger on) starts.
// Usage: node watch.mjs [theme] [--words]. Each new Claude process = new inspector id -> inject once.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ARGS = process.argv.slice(2);
const PORT = Number(process.env.CS_PORT || 9229);
let lastId = null;

const runInject = () => new Promise((res) => {
  const p = spawn(process.execPath, [path.join(HERE, 'inject.mjs'), ...ARGS], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let out = '';
  p.stdout.on('data', (d) => (out += d));
  p.stderr.on('data', (d) => (out += d));
  p.on('close', (code) => res({ ok: code === 0 && !out.includes('[FAIL]'), out }));
});

async function tick() {
  const list = await fetch(`http://127.0.0.1:${PORT}/json/list`, { signal: AbortSignal.timeout(2000) }).then((r) => r.json()).catch(() => null);
  const t = list?.find((x) => x.type === 'node' && /claude/i.test(x.title)) || (list?.length === 1 ? list[0] : null);
  if (!t) { lastId = null; return; }
  if (t.id === lastId) return;
  await new Promise((r) => setTimeout(r, 8000));   // let windows finish loading
  const r = await runInject();
  console.log(new Date().toISOString(), r.ok ? 'applied' : 'retry', r.out.trim().slice(0, 300));
  if (r.ok) lastId = t.id;
}

for (;;) { await tick().catch(() => {}); await new Promise((r) => setTimeout(r, 5000)); }
