// ClaudeSkin theme "Slay": kinetic typography (hot pink / violet / lemon / ink on blush paper).
// Corner words pop, slide, echo, punch and flip; tickers run top + bottom. Send = giant word sweep,
// answering = faster beat + COOKING, done = stamp (ATE.), click = word + sparkles.
// Pure local code: no network, no storage, no images (everything drawn in code).
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;
  window.__claudeSkinBase = [160, 120, 140];   // cream with a shape under the glass (audit worst case)

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const C = { coral: '#ff2e88', cobalt: '#6b3cff', mustard: '#ffd84a', ink: '#17141a', cream: '#fbf1f4' };
  const EDGE = 'rgba(255, 255, 255, 0.75)';
  const SHADOW = 'rgba(38, 38, 43, 0.12)';
  const css = `
:root:not([data-mode="dark"]) {
  --text-000: 30 8% 8% !important;
  --text-100: 30 8% 11% !important;
  --text-200: 30 6% 19% !important;
  --text-300: 30 6% 19% !important;
  --text-400: 30 5% 24% !important;
  --text-500: 30 5% 24% !important;
  --cds-text-primary: #1b1a1c !important;
  --cds-text-secondary: #34322f !important;
  --cds-text-stays-secondary: #34322f !important;
  --cds-text-muted: #403d39 !important;
  --border-100: 30 10% 20% !important;
  --border-200: 30 10% 20% !important;
  --border-300: 30 10% 20% !important;
  --border-400: 30 10% 20% !important;
  --cds-border: rgba(38, 38, 43, 0.13) !important;
  --cds-border-line: rgba(38, 38, 43, 0.15) !important;
  --cds-surface-0: rgba(255, 252, 246, 0.4) !important;
  --cds-surface-1: rgba(255, 252, 246, 0.4) !important;
  --cds-surface-2: rgba(255, 252, 247, 0.6) !important;
  --cds-surface-3: rgba(255, 253, 249, 0.88) !important;
  --cds-surface-popover: rgba(255, 253, 249, 0.96) !important;
}
:root:not([data-mode="dark"]) { background: ${C.cream} !important; --cs-a: 0.55; }   /* --cs-a = glass opacity, Ctrl+Alt+Up/Down */
:root:not([data-mode="dark"]) body { background: transparent !important; }
:root:not([data-mode="dark"]) body > div.grid,
:root:not([data-mode="dark"]) .dframe-content,
:root:not([data-mode="dark"]) .dframe-nav-scroll,
:root:not([data-mode="dark"]) div.pointer-events-none.absolute.inset-0.bg-surface-1,
:root:not([data-mode="dark"]) [class*="bg-[var(--epitaxy-transc"],
:root:not([data-mode="dark"]) [data-cs-clear] { background: transparent !important; }
:root:not([data-mode="dark"]) .dframe-sidebar {
  background: rgba(255, 251, 244, calc(var(--cs-a) + 0.12)) !important;
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px rgba(255,255,255,0.4), 0 10px 40px ${SHADOW};
}
:root:not([data-mode="dark"]) .tiles-shell {
  background: rgba(255, 252, 247, var(--cs-a)) !important;
  border-radius: 18px;
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px rgba(255,255,255,0.45), 0 10px 40px ${SHADOW};
}
:root:not([data-mode="dark"]) .epitaxy-code-card {
  background: rgba(255, 253, 250, 0.82) !important;
  box-shadow: inset 0 1px 0 ${EDGE};
  transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease;
}
:root:not([data-mode="dark"]) .epitaxy-code-card:hover { transform: translateY(-2px); box-shadow: inset 0 1px 0 ${EDGE}, 0 8px 24px ${SHADOW}; }
:root:not([data-mode="dark"]) .prose-link { color: #1f3aa8 !important; }
:root:not([data-mode="dark"]) .text-muted-as-secondary { color: var(--cds-text-secondary) !important; }
:root:not([data-mode="dark"]) ::selection { background: rgba(255, 46, 136, 0.26); }
:root:not([data-mode="dark"]) textarea:focus-visible,
:root:not([data-mode="dark"]) [contenteditable="true"]:focus-visible { outline-color: ${C.cobalt} !important; }
:root:not([data-mode="dark"]) .dframe-sidebar a, :root:not([data-mode="dark"]) .dframe-sidebar button { transition: background-color .18s ease, transform .22s cubic-bezier(.34,1.56,.64,1); }
:root:not([data-mode="dark"]) .dframe-sidebar a:hover, :root:not([data-mode="dark"]) .dframe-sidebar button:hover { background-color: rgba(255, 255, 255, 0.62) !important; transform: translateX(3px); }

#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: ${C.cream}; }
:root[data-mode="dark"] #cs-backdrop { display: none; }
#cs-slay { display: block; width: 100%; height: 100%; }
#cs-toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 2147483000; pointer-events: none;
  padding: 6px 14px; border-radius: 999px; background: rgba(38, 38, 43, 0.86); color: #fbf6ee; font: 500 13px system-ui, sans-serif;
  opacity: 0; transition: opacity .25s ease; }
#cs-toast.show { opacity: 1; }
`;

  // ---- helpers -------------------------------------------------------------
  const TAU = Math.PI * 2;
  let S = 1;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[(Math.random() * a.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const frac = (x) => x - Math.floor(x);
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);           // local progress of t inside [a, b]
  const Ease = {
    io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    out: (x) => 1 - Math.pow(1 - x, 3),
    back: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  const px = new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true });
  function alphaOf(c) { px.clearRect(0, 0, 1, 1); px.fillStyle = 'rgba(0,0,0,0)'; px.fillStyle = c; px.fillRect(0, 0, 1, 1); return px.getImageData(0, 0, 1, 1).data[3] / 255; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let styleEl, backdrop, cv, g, base, raf = 0, last = 0, T = 0, W = 0, H = 0, clearTimer = 0;
  let clock = 0, busy = 0, busyTarget = 0, wasBusy = false, trainT = 0, wipe = null, lastMove = -1e9;
  const bursts = [];

  // ---- static base: blush paper + pink halftone creeping in from two corners -----
  function makeBase(w, h) {
    const c = new OffscreenCanvas(w, h), b = c.getContext('2d');
    b.fillStyle = C.cream; b.fillRect(0, 0, w, h);
    b.setTransform(S, 0, 0, S, 0, 0);
    b.fillStyle = 'rgba(255, 46, 136, 0.14)';
    for (let y = 10; y < H; y += 22) for (let x = 10; x < W; x += 22) {
      const d = Math.min(Math.hypot(W - x, y), Math.hypot(x, H - y)) / Math.hypot(W, H), r = 3 * (1 - d / 0.36);
      if (r > 0.3) { b.beginPath(); b.arc(x, y, r, 0, TAU); b.fill(); }
    }
    return c;
  }

  // ---- kinetic type ----------------------------------------------------------
  const FONT = (px) => `900 ${px}px "Arial Black", "Segoe UI Black", Impact, system-ui, sans-serif`;
  const WORDS = ['SLAY', 'SERVE', 'ATE', 'ICONIC', 'MOTHER', 'PERIOD', 'NO NOTES', "IT'S GIVING", 'MAIN CHARACTER', 'UNBOTHERED', 'LEGEND', 'WERK', 'OBSESSED'];
  const CLICK_WORDS = ['SLAY', 'ATE', 'YES', 'WERK', 'ICONIC', '✦'];
  const STYLES = ['pop', 'slide', 'echo', 'punch', 'flip'];
  const BUSY_SEL = 'button[aria-label*="Stop" i], button[aria-label*="Dừng" i], button[aria-label*="Interrupt" i]';
  const COMPS = [];                                  // (frame() checks it; type theme has no kick loops)
  let marq = 0;
  const TICK_TOP = 'SLAY ✦ SERVE ✦ ATE ✦ ICONIC ✦ NO NOTES ✦ MOTHER ✦ ';
  const TICK_BOT = "IT'S GIVING MAIN CHARACTER ✦ PERIOD ✦ UNBOTHERED ✦ ";

  function star(x, y, r, rot) {                      // 4-point sparkle
    g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, rr = i % 2 ? r * 0.28 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fill(); g.restore();
  }
  function letters(word) {                           // [char, x-centre] with the word centred on 0
    const out = []; let x = 0;
    for (const ch of word) { const w = g.measureText(ch).width; out.push([ch, x + w / 2]); x += w; }
    for (const l of out) l[1] -= x / 2;
    return out;
  }
  // one word, one entrance/exit style; inn/out are 0..1 progress of the in and out moves
  function drawWord(style, word, px, col, inn, out) {
    g.font = FONT(px); g.textAlign = 'center'; g.textBaseline = 'middle';
    if (style === 'pop') {                           // letters pop in one by one, then tumble down
      const L = letters(word), n = L.length;
      L.forEach(([ch, x], i) => {
        const d = (i / n) * 0.5, a = Ease.back(seg(inn, d, d + 0.5)), o = Ease.io(seg(out, d, d + 0.5));
        if (a <= 0.001 || o >= 1) return;
        g.save(); g.translate(x, o * px * 1.4); g.rotate(o * (i % 2 ? 0.6 : -0.6)); g.scale(a, a); g.globalAlpha *= 1 - o;
        g.fillStyle = col; g.fillText(ch, 0, 0); g.restore();
      });
    } else if (style === 'slide') {                  // highlighter bar sweeps, word rises out of a mask, leaves upward
      const w = g.measureText(word).width, h = px * 1.15;
      const b0 = Ease.io(seg(inn, 0, 0.6)), b1 = Ease.io(seg(inn, 0.45, 1));
      g.fillStyle = C.mustard; g.fillRect(-w / 2 - 10 + (w + 20) * b1 * (1 - out), px * 0.05, (w + 20) * (b0 - b1 * (1 - out)) , px * 0.42);
      g.save(); g.beginPath(); g.rect(-w / 2 - 12, -h / 2, w + 24, h); g.clip();
      g.fillStyle = col; g.fillText(word, 0, (1 - Ease.out(inn)) * h - Ease.io(out) * h); g.restore();
    } else if (style === 'echo') {                   // outlined echoes fan out above/below the solid word
      const k = Ease.back(inn) * (1 - Ease.io(out));
      g.globalAlpha *= Math.min(1, inn * 3) * (1 - out);
      g.lineWidth = 1.5; g.strokeStyle = col;
      for (let i = 3; i >= 1; i--) for (const sgn of [-1, 1]) { g.save(); g.globalAlpha *= 1 - i * 0.22; g.strokeText(word, 0, sgn * i * px * 0.8 * k); g.restore(); }
      g.fillStyle = col; g.fillText(word, 0, 0);
    } else if (style === 'punch') {                  // slams in big + skewed, settles, shears off to the right
      const e = Ease.out(inn), sc = 1 + 0.7 * (1 - e), sk = 0.4 * (1 - e) - 0.5 * Ease.io(out);
      g.globalAlpha *= Math.min(1, inn * 4) * (1 - out);
      g.translate(Ease.io(out) * px * 2, 0); g.transform(1, 0, sk, 1, 0, 0); g.scale(sc, sc);
      g.fillStyle = col; g.fillText(word, 0, 0);
    } else {                                         // 'flip': sticker with hard shadow, flips open vertically
      const sy = Ease.back(inn) * (1 - Ease.io(out));
      if (sy <= 0.001) return;
      g.scale(1, sy);
      g.fillStyle = C.ink; g.fillText(word, px * 0.06, px * 0.06);
      g.fillStyle = col === C.ink ? C.coral : col; g.fillText(word, 0, 0);
    }
  }

  // corner slots (middle stays clear for the chat); each cycles word + style + colour
  const SLOTS = [
    { fx: 0.83, fy: 0.17, px: 64, rot: -0.06 },
    { fx: 0.82, fy: 0.83, px: 56, rot: 0.04 },
    { fx: 0.13, fy: 0.2, px: 44, rot: 0 },
    { fx: 0.13, fy: 0.72, px: 42, rot: -0.05 },
    { fx: 0.972, fy: 0.5, px: 38, rot: -Math.PI / 2, vert: true },
  ].map((s, i) => ({ ...s, t: -i * 0.7, dur: 3.6 }));
  function renew(s) {
    s.word = pick(WORDS); s.style = pick(STYLES); s.col = pick([C.coral, C.coral, C.cobalt, C.ink]);
    s.dur = rnd(3.2, 4.4); s.t = 0;
    g.font = FONT(s.px); const w = g.measureText(s.word).width, room = s.vert ? H * 0.42 : W * 0.19;
    s.size = Math.min(s.px, s.px * room / w);
  }

  function sparks(n, R) {
    return Array.from({ length: n }, (_, i) => ({ a: (i / n) * TAU + rnd(-0.3, 0.3), v: rnd(0.5, 1) * R, r: rnd(5, 10), rot: rnd(0, TAU), col: pick([C.coral, C.cobalt, C.mustard]) }));
  }
  function spawnBurst(x, y, n, R) {                   // click: a small word pops at the pointer, sparkles fly
    bursts.push({ kind: 'word', x, y, t: 0, life: 1.5, word: pick(CLICK_WORDS), style: pick(['pop', 'punch', 'flip']), col: pick([C.coral, C.cobalt, C.ink]), sp: sparks(n + 2, R * 1.4) });
    if (bursts.length > 16) bursts.shift();
  }

  function update(dt) {
    if (busyTarget !== wasBusy) {
      if (busyTarget) wipe = { t: 0, word: pick(['SERVE', 'SLAY', 'WERK', 'ON IT']) };                     // sent: giant word sweeps across
      else bursts.push({ kind: 'stamp', x: W / 2, y: H * 0.42, t: 0, life: 1.8, word: pick(['ATE.', 'SLAYED.', 'NO NOTES.', 'PERIOD.']), sp: sparks(14, 260) });   // done: stamp
      wasBusy = busyTarget;
    }
    busy += ((busyTarget ? 1 : 0) - busy) * Math.min(1, dt * 3);
    const speed = (reduced ? 0.35 : 1) * (1 + 1.1 * busy);
    marq += dt * speed; trainT += dt;
    for (const s of SLOTS) { s.t += dt * speed; if (s.t >= s.dur || !s.word) { if (s.t >= 0) renew(s); } }
    if (wipe && (wipe.t += dt) > 1.4) wipe = null;
    for (let i = bursts.length - 1; i >= 0; i--) if ((bursts[i].t += dt) > bursts[i].life) bursts.splice(i, 1);
  }

  function marquee(y, px, speed, text, mode, col) {
    g.font = FONT(px); g.textAlign = 'left'; g.textBaseline = 'middle';
    const w = g.measureText(text).width, off = (((marq * speed) % w) + w) % w;
    for (let x = speed > 0 ? -off : off - w; x < W; x += w) {
      if (mode === 'stroke') { g.lineWidth = 1.4; g.strokeStyle = col; g.strokeText(text, x, y); }
      else { g.fillStyle = col; g.fillText(text, x, y); }
    }
  }
  function draw() {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    g.drawImage(base, 0, 0);
    g.setTransform(S, 0, 0, S, 0, 0);
    if (wipe) {                                      // giant outlined + solid word sweeping right -> left behind the glass
      const q = Ease.io(clamp(wipe.t / 1.3, 0, 1)), px = H * 0.3;
      g.font = FONT(px); g.textAlign = 'center'; g.textBaseline = 'middle';
      const w = g.measureText(wipe.word).width, x = W + w / 2 - q * (W + w);
      g.globalAlpha = 0.16; g.fillStyle = C.coral; g.fillText(wipe.word, x, H * 0.5);
      g.globalAlpha = 0.35; g.lineWidth = 2; g.strokeStyle = C.cobalt; g.strokeText(wipe.word, x + px * 0.08, H * 0.5 + px * 0.06);
      g.globalAlpha = 1;
    }
    g.globalAlpha = 0.9; marquee(H * 0.028, 28, -60, TICK_TOP, 'stroke', C.ink);
    g.globalAlpha = 0.85; marquee(H - 14, 22, 45, TICK_BOT, 'fill', C.coral);
    g.globalAlpha = 1;
    for (const s of SLOTS) {
      if (!s.word || s.t < 0) continue;
      const u = s.t / s.dur;
      g.save(); g.translate(s.fx * W, s.fy * H); g.rotate(s.rot);
      drawWord(s.style, s.word, s.size, s.col, seg(u, 0, 0.26), seg(u, 0.74, 1));
      g.restore();
    }
    if (busy > 0.02) {                               // answering: "COOKING" + bouncing dots above the bottom ticker
      g.save(); g.globalAlpha = busy; g.font = FONT(15); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = C.ink;
      const x0 = W * 0.045, y0 = H - 44; g.fillText('COOKING', x0, y0);
      const w = g.measureText('COOKING').width;
      for (let i = 0; i < 3; i++) { g.fillStyle = [C.coral, C.mustard, C.cobalt][i]; g.beginPath(); g.arc(x0 + w + 10 + i * 12, y0 - Math.abs(Math.sin(trainT * 7 - i * 0.7)) * 7, 3.6, 0, TAU); g.fill(); }
      g.restore();
    }
    for (const b of bursts) {
      const k = b.t / b.life, e = Ease.out(k);
      for (const p of b.sp) { g.globalAlpha = 1 - k; g.fillStyle = p.col; star(b.x + Math.cos(p.a) * p.v * e, b.y + Math.sin(p.a) * p.v * e + 30 * k * k, p.r * (1 - k * 0.6), p.rot + k * 3); }
      g.save(); g.translate(b.x, b.y);
      if (b.kind === 'stamp') { g.globalAlpha = 0.28; drawWord('punch', b.word, Math.min(H * 0.2, W * 0.12), C.coral, seg(k, 0, 0.25), seg(k, 0.7, 1)); }
      else { g.globalAlpha = 1; drawWord(b.style, b.word, 34, b.col, seg(k, 0, 0.25), seg(k, 0.65, 1)); }
      g.restore();
    }
    g.globalAlpha = 1;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const lively = busy > 0.02 || busyTarget || wipe || bursts.length || COMPS.some((o) => o.kick >= 0) || T - lastMove < 2;
    if (now - last < (lively ? 15 : 33)) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
    busyTarget = !!document.querySelector(BUSY_SEL);
    update(dt); draw();
  }

  // ---- events --------------------------------------------------------------
  function onMove() { lastMove = T; }
  function onDown(e) {
    if (!styleEl || styleEl.disabled) return;
    spawnBurst(e.clientX, e.clientY, (5 + Math.random() * 2) | 0, 64);
  }
  function resize() {
    W = innerWidth; H = innerHeight; S = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(W * S)); cv.height = Math.max(1, Math.round(H * S));
    base = makeBase(cv.width, cv.height);
    draw();
  }

  function clearUnder() {
    for (const sel of ['.tiles-shell', '.dframe-sidebar']) {
      const el = document.querySelector(sel);
      for (let p = el?.parentElement; p && p !== document.body; p = p.parentElement) {
        if (!p.hasAttribute('data-cs-clear') && alphaOf(getComputedStyle(p).backgroundColor) > 0.85) p.setAttribute('data-cs-clear', '');
      }
    }
  }

  // plugin bands above the prompt live in open shadow roots: page CSS can't reach, so drop a style inside
  const BAND_CSS = `[data-engine-tree]{font-size:12px;font-variant-numeric:tabular-nums;}[data-engine-row]{align-items:center;}span[style*='opacity'],span[style*='dim-ink']{letter-spacing:.02em;}span[style*='color: rgb(70, 167, 88)']{color:#2440b8 !important;}div[style*='background-color: rgb(70, 167, 88)']{background:linear-gradient(90deg,#7d93ee,#2c4fd6) !important;}span[style*='color: rgb(245, 217, 10)']{color:#a86f08 !important;}div[style*='background-color: rgb(245, 217, 10)']{background:linear-gradient(90deg,#f0c860,#e3a823) !important;}span[style*='color: rgb(5, 162, 194)']{color:#3a3a44 !important;}div[style*='background-color: rgb(5, 162, 194)']{background:linear-gradient(90deg,#8b8b96,#26262b) !important;}span[style*='color: rgb(229, 72, 77)']{color:#c94129 !important;}div[style*='background-color: rgb(229, 72, 77)']{background:linear-gradient(90deg,#f39a86,#ec6a52) !important;}div[style*='background-color: rgba(127, 127, 127, 0.22)']{background:rgba(38, 38, 43, 0.1) !important;}div[style*='background-color: rgba(127, 127, 127, 0.75)']{background:#26262b !important;width:2px !important;}div:has(> div[style*='background-color']){height:4px !important;align-self:center;border-radius:999px;overflow:hidden;}div:has(> div[style*='background-color']) > div{height:4px !important;}`;
  function skinBands() {
    for (const h of document.querySelectorAll('[data-plugin-drawn="AbovePrompt"]')) {
      const r = h.shadowRoot; if (!r || r.getElementById('cs-band')) continue;
      const st = document.createElement('style'); st.id = 'cs-band'; st.textContent = BAND_CSS; r.appendChild(st);
    }
  }
  const unskinBands = () => { for (const h of document.querySelectorAll('[data-plugin-drawn]')) h.shadowRoot?.getElementById('cs-band')?.remove(); };

  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  function mount() {
    if (isDark()) { window.__claudeSkinState = 'skipped-dark'; return; }
    styleEl = document.createElement('style'); styleEl.id = 'cs-style'; styleEl.textContent = css;
    document.head.appendChild(styleEl);
    backdrop = document.createElement('div'); backdrop.id = 'cs-backdrop';
    cv = document.createElement('canvas'); cv.id = 'cs-slay'; backdrop.appendChild(cv);
    document.body.prepend(backdrop);
    g = cv.getContext('2d', { alpha: false });
    resize();
    clearUnder(); skinBands(); clearTimer = setInterval(() => { clearUnder(); skinBands(); }, 1000);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('resize', resize);
    start();
    // debug: advance + snapshot (works while hidden); opts.busy forces answering state, opts.click = [x, y]
    window.__claudeSkinStep = (n = 1, opts = {}) => {
      if (opts.click) spawnBurst(opts.click[0], opts.click[1], 6, 64);
      for (let i = 0; i < n; i++) { T += 1 / 30; if (opts.busy !== undefined) busyTarget = !!opts.busy; update(1 / 30); }
      draw(); return cv.toDataURL('image/png');
    };
    window.__claudeSkinState = 'on';
  }

  let glassA = 0.55, toastT = 0;
  function setGlass(a) {
    glassA = Math.round(clamp(a, 0.2, 0.9) * 10) / 10;
    document.documentElement.style.setProperty('--cs-a', String(glassA));
    let t = document.getElementById('cs-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cs-toast'; document.body.appendChild(t); }
    t.textContent = `Glass ${Math.round(glassA * 100)}%`; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1100);
  }
  const onKey = (e) => {   // Ctrl+Alt+G: theme on/off, Ctrl+Alt+Up/Down: glass
    if (e.ctrlKey && e.altKey && (e.code === 'ArrowUp' || e.code === 'ArrowDown') && styleEl && !styleEl.disabled) {
      e.preventDefault(); setGlass(glassA + (e.code === 'ArrowUp' ? 0.1 : -0.1)); return;
    }
    if (e.ctrlKey && e.altKey && e.code === 'KeyG' && styleEl) {
      styleEl.disabled = !styleEl.disabled;
      if (styleEl.disabled) unskinBands(); else skinBands();
      backdrop.style.display = styleEl.disabled ? 'none' : '';
      if (styleEl.disabled) stop(); else start();
    }
  };
  addEventListener('keydown', onKey, true);
  window.__claudeSkinCleanup = () => {
    removeEventListener('keydown', onKey, true);
    removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown); removeEventListener('resize', resize);
    clearInterval(clearTimer); unskinBands(); stop(); clearTimeout(toastT); document.documentElement.style.removeProperty('--cs-a');
    for (const el of document.querySelectorAll('[id^="cs-"]')) el.remove();
    for (const el of document.querySelectorAll('[data-cs-clear]')) el.removeAttribute('data-cs-clear');
    window.__claudeSkin = false; window.__claudeSkinState = 'off'; delete window.__claudeSkinStep;
  };

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();
