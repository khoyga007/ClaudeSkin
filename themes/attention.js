// ClaudeSkin theme "Attention": warm paper, drifting word fragments (many languages, code, math),
// attention threads to the cursor, click = a word blooms into related words, and a hand-drawn
// spark that wakes up while Claude is answering (detected by the Stop button being present).
// Pure local code: no network, no storage, no images, never reads message content.
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;
  window.__claudeSkinBase = [226, 212, 192];   // darkest paper tone under glass (audit worst case)

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const CLAY = '217, 119, 87';                  // Claude orange
  const INK = '74, 48, 34';
  const EDGE = 'rgba(255, 255, 255, 0.7)';
  const SHADOW = 'rgba(70, 44, 28, 0.13)';
  const css = `
:root:not([data-mode="dark"]) {
  --text-000: 24 22% 9% !important;
  --text-100: 24 18% 12% !important;
  --text-200: 24 12% 20% !important;
  --text-300: 24 12% 20% !important;
  --text-400: 24 10% 26% !important;
  --text-500: 24 10% 26% !important;
  --cds-text-primary: #1e1712 !important;
  --cds-text-secondary: #3a2f27 !important;
  --cds-text-stays-secondary: #3a2f27 !important;
  --cds-text-muted: #46392f !important;
  --border-100: 26 30% 24% !important;
  --border-200: 26 30% 24% !important;
  --border-300: 26 30% 24% !important;
  --border-400: 26 30% 24% !important;
  --cds-border: rgba(90, 58, 36, 0.15) !important;
  --cds-border-line: rgba(90, 58, 36, 0.17) !important;
  --cds-surface-0: rgba(255, 251, 245, 0.4) !important;
  --cds-surface-1: rgba(255, 251, 245, 0.4) !important;
  --cds-surface-2: rgba(255, 252, 247, 0.6) !important;
  --cds-surface-3: rgba(255, 253, 249, 0.88) !important;
  --cds-surface-popover: rgba(255, 253, 249, 0.96) !important;
}
:root:not([data-mode="dark"]) { background: #efe5d6 !important; --cs-a: 0.5; }
:root:not([data-mode="dark"]) body { background: transparent !important; }
:root:not([data-mode="dark"]) body > div.grid,
:root:not([data-mode="dark"]) .dframe-content,
:root:not([data-mode="dark"]) .dframe-nav-scroll,
:root:not([data-mode="dark"]) div.pointer-events-none.absolute.inset-0.bg-surface-1,
:root:not([data-mode="dark"]) [class*="bg-[var(--epitaxy-transc"],
:root:not([data-mode="dark"]) [data-cs-clear] { background: transparent !important; }
:root:not([data-mode="dark"]) .dframe-sidebar {
  background: rgba(252, 247, 240, calc(var(--cs-a) + 0.12)) !important;
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px rgba(255,255,255,0.35), 0 10px 40px ${SHADOW};
}
:root:not([data-mode="dark"]) .tiles-shell {
  background: rgba(255, 252, 247, var(--cs-a)) !important;
  border-radius: 18px;
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px rgba(255,255,255,0.4), 0 10px 40px ${SHADOW};
}
:root:not([data-mode="dark"]) .epitaxy-code-card {
  background: rgba(255, 253, 250, 0.82) !important;
  box-shadow: inset 0 1px 0 ${EDGE};
  transition: transform .2s ease, box-shadow .2s ease;
}
:root:not([data-mode="dark"]) .epitaxy-code-card:hover { transform: translateY(-1px); box-shadow: inset 0 1px 0 ${EDGE}, 0 8px 24px ${SHADOW}; }
:root:not([data-mode="dark"]) .prose-link { color: #8a3414 !important; }
:root:not([data-mode="dark"]) .text-muted-as-secondary { color: var(--cds-text-secondary) !important; }
:root:not([data-mode="dark"]) ::selection { background: rgba(${CLAY}, 0.26); }
:root:not([data-mode="dark"]) textarea:focus-visible,
:root:not([data-mode="dark"]) [contenteditable="true"]:focus-visible { outline-color: rgb(${CLAY}) !important; }
:root:not([data-mode="dark"]) .dframe-sidebar a, :root:not([data-mode="dark"]) .dframe-sidebar button { transition: background-color .18s ease, transform .18s ease; }
:root:not([data-mode="dark"]) .dframe-sidebar a:hover, :root:not([data-mode="dark"]) .dframe-sidebar button:hover { background-color: rgba(255, 255, 255, 0.6) !important; transform: translateX(2px); }

#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: #efe5d6; }
:root[data-mode="dark"] #cs-backdrop { display: none; }
#cs-field { display: block; width: 100%; height: 100%; }
#cs-toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 2147483000; pointer-events: none;
  padding: 6px 14px; border-radius: 999px; background: rgba(46, 30, 20, 0.84); color: #fbf4ea; font: 500 13px system-ui, sans-serif;
  opacity: 0; transition: opacity .25s ease; }
#cs-toast.show { opacity: 1; }
`;

  // ---- vocabulary: word -> related words (click bloom) ----------------------
  const VOCAB = {
    'hello': ['hi', 'xin chào', 'hola', 'salut'],
    'xin chào': ['chào anh', 'hello', 'こんにちは', '안녕'],
    'こんにちは': ['ありがとう', 'hello', '言葉', '友達'],
    '{ }': ['function', 'return', '=>', 'const'],
    '→': ['then', '∴', '⇒', 'next'],
    '∑': ['∫', '∂', 'π', '∞'],
    'koi': ['nước', 'vây', 'hồ', '鯉'],
    'code': ['bug', 'fix', 'test', 'commit'],
    'why?': ['because', 'vì sao', 'how', 'thử xem'],
    'λ': ['map', 'fold', 'type', 'f(x)'],
    'em': ['anh', 'Claire', 'nghĩ', 'viết'],
    'think': ['reason', 'plan', 'check', 'nghĩ'],
    'ý tưởng': ['idea', 'spark', 'thử', 'vẽ'],
    'merci': ['thanks', 'cảm ơn', 'gracias', '谢谢'],
    '谢谢': ['你好', '字', '心', 'merci'],
    'token': ['context', 'attention', 'vector', 'embed'],
    '∞': ['loop', '∑', 'vô tận', 'again'],
    'git': ['branch', 'merge', 'diff', 'push'],
    'đất': ['clay', 'nâu', 'gốm', 'earth'],
    'light': ['sáng', 'lumen', '光', 'glass'],
    'ok': ['go', 'done', 'xong', '✓'],
    '?': ['!', '…', 'hmm', 'aha'],
    'sách': ['book', 'chữ', 'đọc', '本'],
    'nhạc': ['music', 'nhịp', '♪', 'hát'],
  };
  const KEYS = Object.keys(VOCAB);
  const isCode = (t) => /^[{}\[\]()=<>λ∑∫∂π∞→⇒∴✓…!?♪/]|^(function|return|const|map|fold|type|f\(x\)|=>|commit|diff|push|git|token)$/.test(t);

  // ---- helpers -------------------------------------------------------------
  const TAU = Math.PI * 2;
  let S = 1;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
  const px = new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true });
  function alphaOf(c) { px.clearRect(0, 0, 1, 1); px.fillStyle = 'rgba(0,0,0,0)'; px.fillStyle = c; px.fillRect(0, 0, 1, 1); return px.getImageData(0, 0, 1, 1).data[3] / 255; }

  const spriteCache = new Map();
  function sprite(text, size) {   // word pre-rendered at device res; drawn in CSS px
    const key = text + '|' + size + '|' + S;
    let s = spriteCache.get(key);
    if (s) return s;
    const font = isCode(text)
      ? `500 ${size * S}px "Cascadia Code", Consolas, ui-monospace, monospace`
      : `italic 400 ${size * S}px Cambria, "Palatino Linotype", Georgia, "Yu Mincho", "Microsoft YaHei", serif`;
    px.font = font;
    const w = Math.ceil(px.measureText(text).width) + 8 * S, h = Math.ceil(size * S * 1.5);
    const c = new OffscreenCanvas(w, h), x = c.getContext('2d');
    x.font = font; x.textBaseline = 'middle'; x.fillStyle = `rgb(${INK})`; x.fillText(text, 4 * S, h / 2);
    s = { c, w: w / S, h: h / S };
    spriteCache.set(key, s);
    return s;
  }

  let styleEl, backdrop, cv, g, bed, raf = 0, last = 0, T = 0, W = 0, H = 0, clearTimer = 0, busyTimer = 0;
  let busyTarget = 0, busy = 0;
  const words = [], blooms = [], pulses = [], rays = [];
  const ptr = { x: -1e4, y: -1e4, t: -1e9 };

  // ---- static paper (built once per resize) --------------------------------
  function makeBed(w, h) {
    const c = new OffscreenCanvas(w, h), x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#f6efe4'); gr.addColorStop(0.55, '#efe4d4'); gr.addColorStop(1, '#e6d8c4');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) {                  // soft warm stains
      const cx = Math.random() * w, cy = Math.random() * h, r = rnd(0.18, 0.4) * Math.max(w, h);
      const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      rg.addColorStop(0, `rgba(${i % 2 ? '214, 168, 130' : '196, 176, 140'}, 0.16)`); rg.addColorStop(1, 'rgba(214, 168, 130, 0)');
      x.fillStyle = rg; x.fillRect(0, 0, w, h);
    }
    const n = Math.round((w * h) / 900);           // paper fibre grain
    for (let i = 0; i < n; i++) {
      x.fillStyle = `rgba(${Math.random() < 0.5 ? '120, 90, 60' : '255, 255, 250'}, ${rnd(0.03, 0.08)})`;
      x.fillRect(Math.random() * w, Math.random() * h, rnd(1, 3) * S, S);
    }
    x.strokeStyle = 'rgba(150, 110, 80, 0.06)'; x.lineWidth = S;   // faint ruled lines, like a notebook
    for (let y = 48 * S; y < h; y += 34 * S) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); }
    return c;
  }

  // ---- words ---------------------------------------------------------------
  function makeWord(text) {
    return { text, size: rnd(15, 26), x: Math.random() * W, y: Math.random() * H,
      vx: rnd(-1, 1), vy: rnd(-1, 1), sp: rnd(5, 12), ph: rnd(0, TAU), base: rnd(0.22, 0.4), hi: 0 };
  }
  function makeWords() {
    words.length = 0;
    const count = W * H > 1.6e6 ? 44 : 36;
    const pool = [...KEYS];
    for (const k of KEYS) pool.push(VOCAB[k][(Math.random() * 4) | 0]);
    for (let i = 0; i < count; i++) words.push(makeWord(pool[i % pool.length]));
    for (const w of words) { const d = Math.hypot(w.vx, w.vy) || 1; w.vx /= d; w.vy /= d; }
  }

  function makeRays() {
    rays.length = 0;
    const n = 11;
    for (let i = 0; i < n; i++) rays.push({ a: (i / n) * TAU + rnd(-0.12, 0.12), len: rnd(0.62, 1), w: rnd(0.075, 0.11), ph: rnd(0, TAU) });
  }

  // ---- simulation ----------------------------------------------------------
  function update(dt) {
    busy += (busyTarget - busy) * Math.min(1, dt * (busyTarget > busy ? 2.5 : 0.8));
    const speed = 1 + busy * 1.8;
    const near = T - ptr.t < 3;
    for (const w of words) {
      w.ph += dt * 0.35;
      const a = Math.atan2(w.vy, w.vx) + Math.sin(w.ph) * 0.004;
      w.vx = Math.cos(a); w.vy = Math.sin(a);
      w.x += w.vx * w.sp * speed * dt; w.y += (w.vy * w.sp + Math.sin(w.ph * 1.7) * 2) * speed * dt;
      const m = 60;
      if (w.x < -m) w.x = W + m; else if (w.x > W + m) w.x = -m;
      if (w.y < -m) w.y = H + m; else if (w.y > H + m) w.y = -m;
      const d = near ? Math.hypot(w.x - ptr.x, w.y - ptr.y) : 1e9;
      const tgt = d < 300 ? Math.pow(1 - d / 300, 1.5) : 0;
      w.hi += (tgt - w.hi) * Math.min(1, dt * 5);
    }
    for (const b of blooms) b.t += dt;
    while (blooms.length && blooms[0].t > blooms[0].life) blooms.shift();
    for (const p of pulses) p.t += dt;
    for (let i = pulses.length - 1; i >= 0; i--) if (pulses[i].t > pulses[i].life) pulses.splice(i, 1);
    if (busy > 0.15 && Math.random() < dt * 10 * busy && pulses.length < 40) {   // thoughts travelling along threads
      const a = words[(Math.random() * words.length) | 0];
      let best = null, bd = 1e9;
      for (const b of words) { if (b === a) continue; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < bd && d > 30) { bd = d; best = b; } }
      if (best && bd < 260) pulses.push({ a, b: best, t: 0, life: rnd(0.7, 1.2) });
    }
  }

  // ---- drawing -------------------------------------------------------------
  function thread(x1, y1, x2, y2, alpha, width, col) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
    g.globalAlpha = alpha; g.strokeStyle = col; g.lineWidth = width;
    g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx - dy * 0.12, my + dx * 0.12, x2, y2); g.stroke();
  }

  function drawSpark() {
    const R = 46 + busy * 10, cx = W - 110, cy = 112;
    const rot = T * (0.04 + busy * 0.9);
    const breath = 1 + 0.035 * Math.sin(T * 0.9);
    if (busy > 0.02) {
      const gl = g.createRadialGradient(cx, cy, 0, cx, cy, R * 2.6);
      gl.addColorStop(0, `rgba(${CLAY}, ${0.28 * busy})`); gl.addColorStop(1, `rgba(${CLAY}, 0)`);
      g.globalAlpha = 1; g.fillStyle = gl; g.beginPath(); g.arc(cx, cy, R * 2.6, 0, TAU); g.fill();
    }
    g.globalAlpha = 0.55 + 0.4 * busy; g.fillStyle = `rgb(${CLAY})`;
    for (const r of rays) {
      const L = R * breath * r.len * (1 + busy * 0.16 * Math.sin(T * 5.5 + r.ph));
      const a = r.a + rot, ca = Math.cos(a), sa = Math.sin(a), hw = R * r.w;
      g.beginPath();
      g.moveTo(cx - sa * hw, cy + ca * hw);
      g.quadraticCurveTo(cx + ca * L * 0.55 - sa * hw * 0.9, cy + sa * L * 0.55 + ca * hw * 0.9, cx + ca * L, cy + sa * L);
      g.quadraticCurveTo(cx + ca * L * 0.55 + sa * hw * 0.9, cy + sa * L * 0.55 - ca * hw * 0.9, cx + sa * hw, cy - ca * hw);
      g.closePath(); g.fill();
    }
    g.beginPath(); g.arc(cx, cy, R * 0.14, 0, TAU); g.fill();
  }

  function draw() {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    g.drawImage(bed, 0, 0);
    g.setTransform(S, 0, 0, S, 0, 0);
    g.lineCap = 'round';
    // quiet constellation between nearby words
    const LINK = 170;
    for (let i = 0; i < words.length; i++) for (let j = i + 1; j < words.length; j++) {
      const a = words[i], b = words[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < LINK) thread(a.x, a.y, b.x, b.y, (1 - d / LINK) * (0.14 + 0.16 * busy), 1, `rgb(${INK})`);
    }
    // attention: cursor -> words, and between attended words
    const fade = clamp(1 - (T - ptr.t - 1.5) / 1.5, 0, 1);
    if (fade > 0) {
      const att = words.filter((w) => w.hi > 0.04);
      for (const w of att) thread(ptr.x, ptr.y, w.x, w.y, 0.7 * w.hi * fade, 0.8 + 2.2 * w.hi, `rgb(${CLAY})`);
      for (let i = 0; i < att.length; i++) for (let j = i + 1; j < att.length; j++) {
        const k = att[i].hi * att[j].hi;
        if (k > 0.03) thread(att[i].x, att[i].y, att[j].x, att[j].y, 0.55 * k * fade, 0.6 + 1.6 * k, `rgb(${CLAY})`);
      }
      g.globalAlpha = 0.5 * fade; g.fillStyle = `rgb(${CLAY})`;
      g.beginPath(); g.arc(ptr.x, ptr.y, 3.2, 0, TAU); g.fill();
    }
    // pulses (while answering)
    g.fillStyle = `rgb(${CLAY})`;
    for (const p of pulses) {
      const k = p.t / p.life, e = ease(k);
      const x = p.a.x + (p.b.x - p.a.x) * e, y = p.a.y + (p.b.y - p.a.y) * e;
      g.globalAlpha = Math.sin(k * Math.PI) * 0.85;
      g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill();
    }
    // words
    for (const w of words) {
      const s = sprite(w.text, w.size), sc = 1 + w.hi * 0.18;
      g.globalAlpha = clamp(w.base + w.hi * 0.55 + busy * 0.08, 0, 0.92);
      g.drawImage(s.c, w.x - (s.w * sc) / 2, w.y - (s.h * sc) / 2, s.w * sc, s.h * sc);
    }
    // blooms (click): word -> related words
    for (const b of blooms) {
      const k = b.t / b.life, out = ease(b.t / 0.9);
      const al = Math.min(1, b.t / 0.35) * (k > 0.65 ? 1 - (k - 0.65) / 0.35 : 1);
      if (b.t < 0.8) {
        const rk = b.t / 0.8;
        g.globalAlpha = (1 - rk) * 0.5; g.strokeStyle = `rgb(${CLAY})`; g.lineWidth = 2 * (1 - rk) + 0.5;
        g.beginPath(); g.arc(b.src.x, b.src.y, 20 + rk * 90, 0, TAU); g.stroke();
      }
      for (const kid of b.kids) {
        const x = b.src.x + Math.cos(kid.a) * kid.d * out, y = b.src.y + Math.sin(kid.a) * kid.d * out;
        thread(b.src.x, b.src.y, x, y, 0.55 * al, 1.4, `rgb(${CLAY})`);
        const s = sprite(kid.text, kid.size);
        g.globalAlpha = 0.85 * al;
        g.drawImage(s.c, x - s.w / 2, y - s.h / 2, s.w, s.h);
      }
    }
    drawSpark();
    g.globalAlpha = 1;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const lively = busy > 0.02 || busyTarget > 0 || T - ptr.t < 3 || blooms.length > 0;
    if (now - last < (lively ? 13 : 32)) return;    // idle ~30 fps, lively ~70 fps
    const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
    update(dt); draw();
  }

  // ---- events --------------------------------------------------------------
  function onMove(e) { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = T; }
  function onDown(e) {
    if (!styleEl || styleEl.disabled) return;
    const x = e.clientX, y = e.clientY;
    let src = null, bd = 240;
    for (const w of words) { const d = Math.hypot(w.x - x, w.y - y); if (d < bd) { bd = d; src = w; } }
    if (!src) return;
    if (blooms.length >= 4) blooms.shift();
    const rel = VOCAB[src.text] || VOCAB[KEYS[(Math.random() * KEYS.length) | 0]];
    const a0 = rnd(0, TAU);
    blooms.push({ src, t: 0, life: 4.5,
      kids: rel.map((text, i) => ({ text, a: a0 + (i / rel.length) * TAU + rnd(-0.25, 0.25), d: rnd(70, 110), size: rnd(15, 19) })) });
  }
  function resize() {
    const ow = W || innerWidth, oh = H || innerHeight;
    W = innerWidth; H = innerHeight; S = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(W * S)); cv.height = Math.max(1, Math.round(H * S));
    bed = makeBed(cv.width, cv.height);
    for (const w of words) { w.x *= W / ow; w.y *= H / oh; }
    if (words.length) draw();
  }

  // Stop button present = Claude is answering. Only checks that a control exists; never reads messages.
  const BUSY_SEL = 'button[aria-label*="Stop" i], button[aria-label*="Dừng" i], button[aria-label*="Interrupt" i]';
  function pollBusy() { busyTarget = document.querySelector(BUSY_SEL) ? 1 : 0; }

  function clearUnder() {
    for (const sel of ['.tiles-shell', '.dframe-sidebar']) {
      const el = document.querySelector(sel);
      for (let p = el?.parentElement; p && p !== document.body; p = p.parentElement) {
        if (!p.hasAttribute('data-cs-clear') && alphaOf(getComputedStyle(p).backgroundColor) > 0.85) p.setAttribute('data-cs-clear', '');
      }
    }
  }

  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  function mount() {
    if (isDark()) { window.__claudeSkinState = 'skipped-dark'; return; }
    styleEl = document.createElement('style'); styleEl.id = 'cs-style'; styleEl.textContent = css;
    document.head.appendChild(styleEl);
    backdrop = document.createElement('div'); backdrop.id = 'cs-backdrop';
    cv = document.createElement('canvas'); cv.id = 'cs-field'; backdrop.appendChild(cv);
    document.body.prepend(backdrop);
    g = cv.getContext('2d', { alpha: false });
    resize();
    makeWords(); makeRays();
    clearUnder(); clearTimer = setInterval(clearUnder, 2000);
    pollBusy(); busyTimer = setInterval(pollBusy, 400);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('resize', resize);
    update(0.033); draw(); start();
    window.__claudeSkinStep = (n = 1, b) => {   // debug: advance (optionally force busy 0/1) + snapshot
      if (b !== undefined) busyTarget = b;
      for (let i = 0; i < n; i++) { T += 1 / 30; update(1 / 30); } draw(); return cv.toDataURL('image/png');
    };
    window.__claudeSkinBusy = () => ({ busyTarget, busy: +busy.toFixed(2), match: document.querySelector(BUSY_SEL)?.outerHTML.slice(0, 160) || null });
    window.__claudeSkinState = 'on';
  }

  let glassA = 0.5, toastT = 0;
  function setGlass(a) {   // Ctrl+Alt+Up/Down: glass opacity 20%..90% (session only)
    glassA = Math.round(clamp(a, 0.2, 0.9) * 10) / 10;
    document.documentElement.style.setProperty('--cs-a', String(glassA));
    let t = document.getElementById('cs-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cs-toast'; document.body.appendChild(t); }
    t.textContent = `Glass ${Math.round(glassA * 100)}%`; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1100);
  }
  const onKey = (e) => {   // Ctrl+Alt+G: theme on/off
    if (e.ctrlKey && e.altKey && (e.code === 'ArrowUp' || e.code === 'ArrowDown') && styleEl && !styleEl.disabled) {
      e.preventDefault(); setGlass(glassA + (e.code === 'ArrowUp' ? 0.1 : -0.1)); return;
    }
    if (e.ctrlKey && e.altKey && e.code === 'KeyG' && styleEl) {
      styleEl.disabled = !styleEl.disabled;
      backdrop.style.display = styleEl.disabled ? 'none' : '';
      if (styleEl.disabled) stop(); else start();
    }
  };
  addEventListener('keydown', onKey, true);
  window.__claudeSkinCleanup = () => {
    removeEventListener('keydown', onKey, true);
    removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown); removeEventListener('resize', resize);
    clearInterval(clearTimer); clearInterval(busyTimer); stop(); clearTimeout(toastT); document.documentElement.style.removeProperty('--cs-a');
    for (const el of document.querySelectorAll('[id^="cs-"]')) el.remove();
    for (const el of document.querySelectorAll('[data-cs-clear]')) el.removeAttribute('data-cs-clear');
    window.__claudeSkin = false; window.__claudeSkinState = 'off';
    delete window.__claudeSkinStep; delete window.__claudeSkinBusy;
  };

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();
