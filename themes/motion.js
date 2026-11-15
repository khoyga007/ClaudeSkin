// ClaudeSkin theme "Motion": flat motion-graphic loops (coral / cobalt / mustard / ink on cream)
// running quietly around the edges behind light glass. Reacts to the app: send = wipe,
// answering = faster beat + dot train around the frame, done = bounce finale, click = burst.
// Pure local code: no network, no storage, no images (everything drawn in code).
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;
  window.__claudeSkinBase = [150, 136, 122];   // cream with a shape under the glass (audit worst case)

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const C = { coral: '#ec6a52', cobalt: '#2c4fd6', mustard: '#e3a823', ink: '#26262b', cream: '#f4eee2' };
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
:root:not([data-mode="dark"]) ::selection { background: rgba(236, 106, 82, 0.28); }
:root:not([data-mode="dark"]) textarea:focus-visible,
:root:not([data-mode="dark"]) [contenteditable="true"]:focus-visible { outline-color: ${C.cobalt} !important; }
:root:not([data-mode="dark"]) .dframe-sidebar a, :root:not([data-mode="dark"]) .dframe-sidebar button { transition: background-color .18s ease, transform .22s cubic-bezier(.34,1.56,.64,1); }
:root:not([data-mode="dark"]) .dframe-sidebar a:hover, :root:not([data-mode="dark"]) .dframe-sidebar button:hover { background-color: rgba(255, 255, 255, 0.62) !important; transform: translateX(3px); }

#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: ${C.cream}; }
:root[data-mode="dark"] #cs-backdrop { display: none; }
#cs-motion { display: block; width: 100%; height: 100%; }
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

  // ---- static base: cream + faint dot grid ---------------------------------
  function makeBase(w, h) {
    const c = new OffscreenCanvas(w, h), b = c.getContext('2d');
    b.fillStyle = C.cream; b.fillRect(0, 0, w, h);
    b.setTransform(S, 0, 0, S, 0, 0);
    b.fillStyle = 'rgba(38, 38, 43, 0.07)';
    for (let y = 16; y < H; y += 28) for (let x = 16; x < W; x += 28) { b.beginPath(); b.arc(x, y, 1.1, 0, TAU); b.fill(); }
    return c;
  }

  // ---- loops: each drawn in a 100-unit box centred on (0, 0) ----------------
  function pill(x0, x1, y, h, col) {
    if (x1 - x0 < 0.5) return;
    g.fillStyle = col; g.beginPath(); g.roundRect(x0, y - h / 2, x1 - x0, h, h / 2); g.fill();
  }
  const LOOPS = {
    burst(u, c) {                                   // circle pops in -> ring -> explodes into dots -> dots gather back
      if (u < 0.45) {
        const r = 34 * Ease.back(seg(u, 0, 0.16)), k = Ease.io(seg(u, 0.28, 0.45)), lw = r * (1 - k * 0.82);
        if (r <= 0) return;
        g.strokeStyle = c[0]; g.lineWidth = Math.max(0.1, lw); g.beginPath(); g.arc(0, 0, Math.max(0.1, r - lw / 2), 0, TAU); g.stroke();
      } else if (u < 0.88) {
        const k = Ease.out(seg(u, 0.45, 0.6)), back = Ease.io(seg(u, 0.66, 0.86));
        if (k < 1) { g.save(); g.globalAlpha *= 1 - k; g.strokeStyle = c[0]; g.lineWidth = 6 * (1 - k) + 0.5; g.beginPath(); g.arc(0, 0, 34 + 18 * k, 0, TAU); g.stroke(); g.restore(); }
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU + k * 0.5 + back * 1.4, d = 48 * k * (1 - back);
          g.fillStyle = c[i % 2 ? 1 : 2]; g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 6.5 * (1 - back * 0.7), 0, TAU); g.fill();
        }
      } else {
        const r = 2 + 4 * (1 - seg(u, 0.88, 1)); g.fillStyle = c[1]; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
      }
    },
    pills(u, c) {                                   // three bars draw on left->right, staggered, then retract
      for (let i = 0; i < 3; i++) {
        const d = i * 0.07, head = Ease.io(seg(u, 0.04 + d, 0.36 + d)), tail = Ease.io(seg(u, 0.5 + d, 0.82 + d));
        pill(-50 + 100 * tail, -50 + 100 * head, -26 + i * 26, 15, c[i]);
      }
    },
    wave(u, c) {                                    // squiggle stroke writes itself on, drifts, writes off
      const head = Ease.io(seg(u, 0.05, 0.45)), tail = Ease.io(seg(u, 0.55, 0.95)), N = 48;
      if (head - tail < 0.01) return;
      const P = (t) => { const x = -55 + 110 * t; return [x, 13 * Math.sin(x * 0.13 + u * TAU)]; };
      g.strokeStyle = c[0]; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
      for (let i = 0; i <= N; i++) { const t = tail + (head - tail) * (i / N), [x, y] = P(t); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      const [hx, hy] = P(head); g.fillStyle = c[1]; g.beginPath(); g.arc(hx, hy, 7, 0, TAU); g.fill();
    },
    arcs(u, c) {                                    // concentric arcs, stop-and-go rotation with overshoot
      g.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const q = u * 4 - i * 0.12, step = Math.floor(q), rot = (step + Ease.back(seg(frac(q), 0, 0.55))) * (Math.PI / 2) * (i % 2 ? -1 : 1);
        const len = Math.PI * (0.7 + 0.35 * Math.sin(u * TAU + i));
        g.strokeStyle = c[i]; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 16 + i * 14, rot, rot + len); g.stroke();
      }
    },
    grid(u, c) {                                    // 5x5 dots, a diagonal swell wave passes through
      for (let iy = 0; iy < 5; iy++) for (let ix = 0; ix < 5; ix++) {
        const d = (ix + iy) / 8, s = Math.sin(Math.PI * seg(u, d * 0.45, d * 0.45 + 0.32));
        g.fillStyle = s > 0.35 ? c[(ix + iy) % 2] : 'rgba(38, 38, 43, 0.35)';
        g.beginPath(); g.arc(-40 + ix * 20, -40 + iy * 20, 2.6 + 5.4 * s, 0, TAU); g.fill();
      }
    },
    flip(u, c) {                                    // two half-discs flip 180 deg twice per loop, a dot orbits
      const q = u * 2, rot = (Math.floor(q) + Ease.io(seg(frac(q), 0.1, 0.55))) * Math.PI;
      g.save(); g.rotate(rot);
      g.fillStyle = c[0]; g.beginPath(); g.arc(0, 0, 36, Math.PI, TAU); g.fill();
      g.fillStyle = c[1]; g.beginPath(); g.arc(0, 0, 36, 0, Math.PI); g.fill();
      g.restore();
      const a = u * TAU * 2; g.fillStyle = c[2]; g.beginPath(); g.arc(Math.cos(a) * 48, Math.sin(a) * 48, 6, 0, TAU); g.fill();
    },
    morph(u, c) {                                   // square <-> circle, quarter turns with overshoot, outline echo lags behind
      const r = 28 * (0.5 - 0.5 * Math.cos(u * TAU)), q = u * 4;
      const rot = (Math.floor(q) + Ease.back(seg(frac(q), 0, 0.5))) * (Math.PI / 2);
      const lag = (Math.floor(q - 0.12) + Ease.back(seg(frac(q - 0.12), 0, 0.5))) * (Math.PI / 2);
      g.save(); g.rotate(lag); g.strokeStyle = c[1]; g.lineWidth = 5; g.beginPath(); g.roundRect(-34, -34, 68, 68, r + 4); g.stroke(); g.restore();
      g.save(); g.rotate(rot); g.fillStyle = c[0]; g.beginPath(); g.roundRect(-26, -26, 52, 52, r); g.fill(); g.restore();
    },
  };
  // placements hug the frame edges so the middle (chat) stays clean
  const COMPS = [
    { k: 'burst', fx: 0.93, fy: 0.13, s: 1.05, p: 7, c: [C.coral, C.cobalt, C.mustard] },
    { k: 'morph', fx: 0.27, fy: 0.07, s: 0.75, p: 8, c: [C.mustard, C.ink] },
    { k: 'wave', fx: 0.6, fy: 0.045, s: 1.1, p: 6.5, c: [C.cobalt, C.coral] },
    { k: 'arcs', fx: 0.965, fy: 0.55, s: 0.95, p: 8, c: [C.coral, C.mustard, C.cobalt] },
    { k: 'grid', fx: 0.055, fy: 0.5, s: 0.85, p: 6, c: [C.cobalt, C.coral] },
    { k: 'flip', fx: 0.9, fy: 0.9, s: 0.85, p: 7.5, c: [C.cobalt, C.coral, C.mustard] },
    { k: 'pills', fx: 0.07, fy: 0.88, s: 0.95, p: 6.5, c: [C.coral, C.mustard, C.cobalt] },
    { k: 'wave', fx: 0.45, fy: 0.975, s: 1, p: 7, c: [C.mustard, C.ink] },
    { k: 'burst', fx: 0.12, fy: 0.15, s: 0.7, p: 8.5, c: [C.cobalt, C.mustard, C.coral] },
  ].map((o, i) => ({ ...o, ph: i * 0.37, kick: -1, kd: 0 }));

  // ---- updates -------------------------------------------------------------
  const BUSY_SEL = 'button[aria-label*="Stop" i], button[aria-label*="Dừng" i], button[aria-label*="Interrupt" i]';
  function kickAll(delayStep) { COMPS.forEach((o, i) => { o.kick = 0; o.kd = i * delayStep; }); }
  function spawnBurst(x, y, n, R) {
    const col = pick([C.coral, C.cobalt, C.mustard]);
    bursts.push({ x, y, t: 0, life: 1.3, R, col, sq: rnd(0, TAU), shards: Array.from({ length: n }, (_, i) => ({
      a: (i / n) * TAU + rnd(-0.3, 0.3), v: rnd(0.6, 1) * R, rot: rnd(0, TAU), vr: rnd(-6, 6), kind: i % 3, col: pick([C.coral, C.cobalt, C.mustard, C.ink]) })) });
    if (bursts.length > 24) bursts.shift();
  }
  function update(dt) {
    if (busyTarget !== wasBusy) {
      if (busyTarget) { wipe = { t: 0 }; kickAll(0.05); }                                   // message sent / answer started
      else { kickAll(0.08); for (const o of COMPS) spawnBurst(o.fx * W, o.fy * H, 6, 70 * o.s); }   // answer done: finale
      wasBusy = busyTarget;
    }
    busy += ((busyTarget ? 1 : 0) - busy) * Math.min(1, dt * 3);
    const speed = (reduced ? 0.35 : 1) * (1 + 0.8 * busy);
    clock += dt * speed; trainT += dt * busy;
    for (const o of COMPS) if (o.kick >= 0) { if (o.kd > 0) o.kd -= dt; else { o.kick += dt / 0.9; if (o.kick >= 1) o.kick = -1; } }
    if (wipe && (wipe.t += dt) > 1.2) wipe = null;
    for (let i = bursts.length - 1; i >= 0; i--) if ((bursts[i].t += dt) > bursts[i].life) bursts.splice(i, 1);
  }

  // ---- drawing -------------------------------------------------------------
  const unit = () => clamp(Math.min(W / 1700, H / 950), 0.6, 1.25);
  function drawWipe() {
    const p = Ease.io(clamp(wipe.t / 1.1, 0, 1));
    for (const [col, lag, wd] of [[C.coral, 0, 0.16], [C.cobalt, 0.12, 0.07], [C.mustard, 0.2, 0.035]]) {
      const q = Ease.io(clamp((wipe.t - lag) / 0.95, 0, 1)), x = -0.3 * W + q * 1.6 * W, w = wd * W;
      g.globalAlpha = 0.3 * Math.sin(Math.PI * q); g.fillStyle = col;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w - 0.25 * H, H); g.lineTo(x - 0.25 * H, H); g.closePath(); g.fill();
    }
    g.globalAlpha = 1; return p;
  }
  function drawTrain() {                          // dot train running round the frame while answering
    const m = 12, P = 2 * (W - 2 * m) + 2 * (H - 2 * m), cols = [C.coral, C.mustard, C.cobalt, C.ink];
    const at = (s) => { s = ((s % P) + P) % P; const a = W - 2 * m, b = H - 2 * m;
      if (s < a) return [m + s, m]; s -= a; if (s < b) return [W - m, m + s]; s -= b; if (s < a) return [W - m - s, H - m]; s -= a; return [m, H - m - s]; };
    for (let i = 0; i < 14; i++) {
      const [x, y] = at(trainT * 300 - i * 20);
      g.globalAlpha = busy * (1 - i / 16); g.fillStyle = cols[i % 4];
      g.beginPath(); g.arc(x, y, 4.2 - i * 0.12, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
  }
  function drawBursts() {
    for (const b of bursts) {
      const k = b.t / b.life, e = Ease.out(k);
      g.globalAlpha = 1 - k; g.strokeStyle = b.col; g.lineWidth = 6 * (1 - k) + 0.5;
      g.beginPath(); g.arc(b.x, b.y, b.R * 0.75 * e, 0, TAU); g.stroke();
      for (const s of b.shards) {
        const d = s.v * e, x = b.x + Math.cos(s.a) * d, y = b.y + Math.sin(s.a) * d + 36 * k * k, sz = 8 * (1 - k * k * k);
        g.save(); g.translate(x, y); g.rotate(s.rot + s.vr * k); g.fillStyle = s.col;
        if (s.kind === 0) { g.beginPath(); g.arc(0, 0, sz * 0.7, 0, TAU); g.fill(); }
        else if (s.kind === 1) { g.beginPath(); g.moveTo(0, -sz); g.lineTo(sz * 0.9, sz * 0.6); g.lineTo(-sz * 0.9, sz * 0.6); g.closePath(); g.fill(); }
        else { g.beginPath(); g.roundRect(-sz, -sz * 0.35, sz * 2, sz * 0.7, sz * 0.35); g.fill(); }
        g.restore();
      }
      const head = Ease.out(seg(k, 0, 0.5)), tail = Ease.io(seg(k, 0.35, 0.9));      // squiggle writes on then off
      if (head - tail > 0.01) {
        g.save(); g.translate(b.x, b.y); g.rotate(b.sq); g.globalAlpha = 1;
        g.strokeStyle = C.ink; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
        for (let i = 0; i <= 20; i++) { const t = tail + (head - tail) * (i / 20), x = 22 + t * 46; i ? g.lineTo(x, 6 * Math.sin(t * 14)) : g.moveTo(x, 6 * Math.sin(t * 14)); }
        g.stroke(); g.restore();
      }
    }
    g.globalAlpha = 1;
  }
  function draw() {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    g.drawImage(base, 0, 0);
    g.setTransform(S, 0, 0, S, 0, 0);
    if (wipe) drawWipe();
    const U = unit();
    for (const o of COMPS) {
      const kk = o.kick >= 0 && o.kd <= 0 ? o.kick : -1, ks = kk >= 0 ? 1 + 0.32 * Math.sin(kk * Math.PI * 2.5) * (1 - kk) : 1;
      g.save(); g.translate(o.fx * W, o.fy * H); g.scale(o.s * U * ks, o.s * U * ks); g.globalAlpha = 0.92;
      LOOPS[o.k](frac(clock / o.p + o.ph), o.c);
      g.restore();
    }
    g.globalAlpha = 1;
    if (busy > 0.02) drawTrain();
    drawBursts();
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
    cv = document.createElement('canvas'); cv.id = 'cs-motion'; backdrop.appendChild(cv);
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
