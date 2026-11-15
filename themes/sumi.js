// ClaudeSkin theme "Sumi": rice paper + ink-wash mountains behind light glass.
// Mouse = dry ink brush (strokes bleed, fade after ~25-50 s). Click = ink drop blooms.
// Bamboo in the right corner grows node by node while Claude is answering (Stop button present).
// Pure local code: no network, no storage, no images, never reads messages.
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;
  window.__claudeSkinBase = [128, 124, 118];   // darkest wash/ink under glass (audit worst case)

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const SEAL = '176, 46, 32';
  const EDGE = 'rgba(255, 255, 255, 0.7)';
  const SHADOW = 'rgba(40, 32, 22, 0.14)';
  const L = ':root:not([data-mode="dark"])';
  const css = `
${L} {
  --text-000: 30 15% 8% !important;
  --text-100: 30 12% 11% !important;
  --text-200: 30 8% 19% !important;
  --text-300: 30 8% 19% !important;
  --text-400: 30 7% 24% !important;
  --text-500: 30 7% 24% !important;
  --cds-text-primary: #1d1a16 !important;
  --cds-text-secondary: #35302a !important;
  --cds-text-stays-secondary: #35302a !important;
  --cds-text-muted: #403a33 !important;
  --border-100: 30 15% 22% !important;
  --border-200: 30 15% 22% !important;
  --border-300: 30 15% 22% !important;
  --border-400: 30 15% 22% !important;
  --cds-border: rgba(60, 48, 34, 0.15) !important;
  --cds-border-line: rgba(60, 48, 34, 0.17) !important;
  --cds-surface-0: rgba(252, 249, 242, 0.36) !important;
  --cds-surface-1: rgba(252, 249, 242, 0.36) !important;
  --cds-surface-2: rgba(253, 250, 244, 0.56) !important;
  --cds-surface-3: rgba(254, 252, 247, 0.86) !important;
  --cds-surface-popover: rgba(254, 252, 247, 0.96) !important;
}
${L} { background: #efe8da !important; --cs-a: 0.5; }
${L} body { background: transparent !important; }
${L} body > div.grid,
${L} .dframe-content,
${L} .dframe-nav-scroll,
${L} div.pointer-events-none.absolute.inset-0.bg-surface-1,
${L} [class*="bg-[var(--epitaxy-transc"],
${L} [data-cs-clear] { background: transparent !important; }
${L} .dframe-sidebar {
  background: rgba(250, 246, 237, calc(var(--cs-a) + 0.12)) !important;
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px rgba(255,255,255,0.35), 0 10px 40px ${SHADOW};
}
${L} .tiles-shell {
  background: rgba(252, 249, 242, var(--cs-a)) !important;
  border-radius: 18px;
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px rgba(255,255,255,0.4), 0 10px 40px ${SHADOW};
}
${L} .epitaxy-code-card { background: rgba(254, 252, 247, 0.82) !important; box-shadow: inset 0 1px 0 ${EDGE}; }
${L} .prose-link { color: #7a2618 !important; }
${L} .text-muted-as-secondary { color: var(--cds-text-secondary) !important; }
${L} ::selection { background: rgba(${SEAL}, 0.22); }
${L} textarea:focus-visible, ${L} [contenteditable="true"]:focus-visible { outline-color: rgb(${SEAL}) !important; }
${L} .dframe-sidebar a, ${L} .dframe-sidebar button { transition: background-color .18s ease, transform .18s ease; }
${L} .dframe-sidebar a:hover, ${L} .dframe-sidebar button:hover { background-color: rgba(255, 255, 255, 0.6) !important; transform: translateX(2px); }
#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: #efe8da; }
:root[data-mode="dark"] #cs-backdrop { display: none; }
#cs-paper { display: block; width: 100%; height: 100%; }
#cs-toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 2147483000; pointer-events: none;
  padding: 6px 14px; border-radius: 999px; background: rgba(36, 30, 24, 0.84); color: #f7f1e6; font: 500 13px system-ui, sans-serif;
  opacity: 0; transition: opacity .25s ease; }
#cs-toast.show { opacity: 1; }
`;

  // ---- helpers -------------------------------------------------------------
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const px = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  px.canvas.width = px.canvas.height = 1;
  function alphaOf(c) { px.clearRect(0, 0, 1, 1); px.fillStyle = 'rgba(0,0,0,0)'; px.fillStyle = c; px.fillRect(0, 0, 1, 1); return px.getImageData(0, 0, 1, 1).data[3] / 255; }
  const layer = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  let styleEl, backdrop, cv, g, base, inkA, inkB, raf = 0, last = 0, T = 0, W = 0, H = 0, S = 1, clearTimer = 0, busyTimer = 0;
  let swapT = 0, busyTarget = 0, busy = 0;
  const FADE = 25;                                  // ink layer lifetime: draw 25 s, then fade over 25 s
  const ptr = { x: -1, y: -1, t: -99 };
  const brush = { lx: 0, ly: 0, lt: -1, load: 1, str: [] };
  const bleeds = [];
  let stalks = [];

  // ---- ink-wash landscape (drawn once per size; static = free per frame) ---
  // Each mountain: solid ink shape -> mottled wash -> erased progressively downward from ITS OWN ridge
  // (stacked destination-out passes), so darkness follows the ridge and the foot dissolves into mist.
  const SEED = (Math.random() * 2 ** 31) | 0;       // same landscape for the whole session, new one next launch
  function rng(seed) { let s = seed; return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function makeBase(w, h) {
    const c = layer(w, h), b = c.getContext('2d'), r = rng(SEED), R = (a, z) => a + r() * (z - a);
    const tc = layer(w, h), t = tc.getContext('2d');
    const X = W, Y = H, INK = '34, 32, 30';
    b.setTransform(S, 0, 0, S, 0, 0); t.setTransform(S, 0, 0, S, 0, 0);
    const gr = b.createLinearGradient(0, 0, 0, Y);
    gr.addColorStop(0, '#f7f2e8'); gr.addColorStop(1, '#f0e9dc');
    b.fillStyle = gr; b.fillRect(0, 0, X, Y);
    b.lineCap = 'round';
    for (let i = 0, n = (X * Y) / 800; i < n; i++) {   // paper fibres
      const x = R(0, X), y = R(0, Y), a = R(0, TAU), l = R(4, 22);
      b.strokeStyle = r() < 0.5 ? 'rgba(120, 100, 72, 0.045)' : 'rgba(255, 255, 255, 0.22)'; b.lineWidth = R(0.4, 1.1);
      b.beginPath(); b.moveTo(x, y); b.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); b.stroke();
    }
    // sun
    const sx0 = X * 0.7, sy0 = Y * 0.12, sr = 32;
    const sg = b.createRadialGradient(sx0 - 6, sy0 - 8, 2, sx0, sy0, sr);
    sg.addColorStop(0, 'rgba(244, 170, 90, 0.85)'); sg.addColorStop(0.75, 'rgba(226, 84, 46, 0.8)'); sg.addColorStop(1, 'rgba(226, 84, 46, 0)');
    b.fillStyle = sg; b.beginPath(); b.arc(sx0, sy0, sr, 0, TAU); b.fill();

    const jag = (n, rough) => {
      const a = new Array(n).fill(0);
      let p = 1; while (p < n - 1) p *= 2;
      const m = new Array(p + 1).fill(0);
      for (let step = p, amp = 1; step > 1; step >>= 1, amp *= rough)
        for (let i = step >> 1; i < p; i += step) m[i] = (m[i - (step >> 1)] + m[i + (step >> 1)]) / 2 + R(-amp, amp);
      for (let i = 0; i < n; i++) a[i] = m[Math.round(i / (n - 1) * p)];
      return a;
    };
    function ridge(xc, base, hgt, wid) {
      const bumps = [{ c: 0, w: R(0.4, 0.55), h: 1 }];
      for (let k = 0, n = 2 + (r() * 2 | 0); k < n; k++) bumps.push({ c: R(-0.9, 0.9), w: R(0.18, 0.4), h: R(0.4, 0.8) });
      const x0 = xc - wid * 1.9, x1 = xc + wid * 1.9, N = Math.ceil((x1 - x0) / 4), J = jag(N + 1, 0.62), pts = [];
      for (let i = 0; i <= N; i++) {
        const x = x0 + (x1 - x0) * i / N, u = (x - xc) / wid;
        let v = 0; for (const q of bumps) v = Math.max(v, q.h * Math.exp(-(((u - q.c) / q.w) ** 2)));
        pts.push([x, base - hgt * v - hgt * 0.05 * J[i] * Math.min(1, v * 3) + R(-0.6, 0.6), v]);
      }
      return pts;
    }
    const shape = (g2, pts, dy) => { g2.beginPath(); g2.moveTo(pts[0][0], Y + 20); for (const p of pts) g2.lineTo(p[0], p[1] + dy); g2.lineTo(pts[pts.length - 1][0], Y + 20); g2.closePath(); };
    function mountain({ xc, base, hgt, wid, a, fk = 0.55, blur = 0 }) {
      const pts = ridge(xc, base, hgt, wid), fade = hgt * fk;
      t.save(); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, w, h); t.restore();
      t.globalCompositeOperation = 'source-over'; t.globalAlpha = 1;
      t.fillStyle = `rgba(${INK}, ${a})`; shape(t, pts, 0); t.fill();
      t.save(); shape(t, pts, 0); t.clip();                       // mottled wash inside the shape
      for (let i = 0, n = wid / 14; i < n; i++) {
        const p = pts[(r() * pts.length) | 0], x = p[0] + R(-20, 20), y = p[1] + R(0, fade * 0.8), rr = R(14, 46);
        const dark = r() < 0.55, mg = t.createRadialGradient(x, y, 0, x, y, rr);
        mg.addColorStop(0, dark ? `rgba(${INK}, ${a * 0.35})` : 'rgba(0,0,0,0.3)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
        t.globalCompositeOperation = dark ? 'source-over' : 'destination-out';
        t.fillStyle = mg; t.beginPath(); t.arc(x, y, rr, 0, TAU); t.fill();
      }
      t.globalCompositeOperation = 'source-over';
      for (let i = 0, n = wid / 40; i < n; i++) {                 // shoulder shading: soft strokes down the slope
        const k = (R(0.1, 0.9) * pts.length) | 0, p = pts[k], q = pts[Math.min(pts.length - 1, k + 4)], sl = Math.atan2(q[1] - p[1], q[0] - p[0]);
        t.strokeStyle = `rgba(${INK}, ${a * 0.22})`; t.lineWidth = R(6, 18);
        const l = R(fade * 0.25, fade * 0.6), dir = sl + (Math.sign(Math.cos(sl)) || 1) * R(0.5, 1.0);
        t.beginPath(); t.moveTo(p[0], p[1] + 3); t.lineTo(p[0] + Math.cos(dir) * l, p[1] + Math.abs(Math.sin(dir)) * l); t.stroke();
      }
      t.restore();
      t.globalCompositeOperation = 'destination-out';              // fade into mist below the ridge
      const M = 44;
      t.fillStyle = 'rgba(0,0,0,0.085)';
      for (let i = 1; i <= M; i++) { shape(t, pts, fade * 0.12 + fade * 0.88 * i / M); t.fill(); }
      t.fillStyle = 'rgba(0,0,0,1)'; shape(t, pts, fade * 1.08); t.fill();
      for (const p of pts) {                                       // fade ink where the ridge is low (between/beyond peaks): no flat bands
        const k = 1 - Math.min(1, p[2] / 0.32);
        if (k > 0.01) { t.fillStyle = `rgba(0,0,0,${k * k * (3 - 2 * k)})`; t.fillRect(p[0] - 2.2, 0, 4.4, Y + 20); }
      }
      t.globalCompositeOperation = 'source-over';
      if (!blur) {                                                 // dry-brush ridge edge
        t.strokeStyle = `rgb(${INK})`;
        for (let i = 1; i < pts.length; i++) {
          if (pts[i][1] > base - hgt * 0.08 || r() < 0.15) continue;
          t.globalAlpha = Math.min(0.9, a * R(0.9, 1.4)); t.lineWidth = R(1.2, 3.4);
          t.beginPath(); t.moveTo(pts[i - 1][0], pts[i - 1][1] + 0.5); t.lineTo(pts[i][0], pts[i][1] + 0.5); t.stroke();
        }
        t.globalAlpha = 1;
      }
      b.save(); b.setTransform(1, 0, 0, 1, 0, 0); if (blur) b.filter = `blur(${blur * S}px)`; b.drawImage(tc, 0, 0); b.restore();
    }
    // far ranges: pale, soft
    mountain({ xc: X * 0.14, base: Y * 0.44, hgt: Y * 0.13, wid: X * 0.15, a: 0.2, fk: 0.85, blur: 1.5 });
    mountain({ xc: X * 0.46, base: Y * 0.42, hgt: Y * 0.15, wid: X * 0.2, a: 0.17, fk: 0.85, blur: 1.5 });
    mountain({ xc: X * 0.82, base: Y * 0.44, hgt: Y * 0.18, wid: X * 0.16, a: 0.2, fk: 0.85, blur: 1.5 });
    // middle
    mountain({ xc: X * 0.33, base: Y * 0.6, hgt: Y * 0.22, wid: X * 0.13, a: 0.42, fk: 0.6 });
    mountain({ xc: X * 0.6, base: Y * 0.62, hgt: Y * 0.13, wid: X * 0.11, a: 0.36, fk: 0.65 });
    mountain({ xc: X * 0.84, base: Y * 0.6, hgt: Y * 0.28, wid: X * 0.13, a: 0.55, fk: 0.55 });
    // near
    mountain({ xc: X * 0.13, base: Y * 0.74, hgt: Y * 0.33, wid: X * 0.14, a: 0.7, fk: 0.5 });
    mountain({ xc: X * 0.5, base: Y * 0.77, hgt: Y * 0.15, wid: X * 0.13, a: 0.55, fk: 0.55 });

    // islet, lower left, with bare trees + reflection
    const iy = Y * 0.875, ix1 = X * 0.3;
    const isl = (dir, alpha) => {
      b.beginPath(); b.moveTo(-10, iy);
      for (let x = -10; x <= ix1; x += 6) { const u = (x + 10) / (ix1 + 10); b.lineTo(x, iy - dir * Y * 0.035 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (0.85 + 0.15 * Math.sin(u * 17))); }
      b.lineTo(ix1, iy); b.closePath();
      const ig = b.createLinearGradient(0, iy - dir * Y * 0.035, 0, iy);
      ig.addColorStop(0, `rgba(${INK}, ${alpha})`); ig.addColorStop(1, `rgba(${INK}, ${alpha * 0.55})`);
      b.fillStyle = ig; b.fill();
    };
    const trees = scene.trees;
    {                                                              // reflection: faint, blurred, broken by ripples, fading with depth
      t.save(); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, w, h); t.restore();
      t.globalCompositeOperation = 'source-over';
      t.save(); t.translate(0, iy * 2); t.scale(1, -1);
      t.globalAlpha = 0.85; for (const tr of trees) drawTree(t, tr.tr, tr.x, scene.isTop(tr.x) + 2, 0); t.globalAlpha = 1;
      t.restore();
      t.globalCompositeOperation = 'destination-out';
      const rg2 = t.createLinearGradient(0, iy, 0, iy + Y * 0.16);
      rg2.addColorStop(0, 'rgba(0,0,0,0.25)'); rg2.addColorStop(1, 'rgba(0,0,0,1)');
      t.fillStyle = rg2; t.fillRect(0, iy, X, Y);
      t.fillStyle = 'rgba(0,0,0,0.7)';
      for (let y = iy + 2; y < Y; y += R(3, 7)) t.fillRect(R(-40, 0), y, X, R(0.8, 2));
      t.globalCompositeOperation = 'source-over';
      b.save(); b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 0.3; b.filter = `blur(${1.2 * S}px)`; b.drawImage(tc, 0, 0); b.restore();
    }
    isl(-1, 0.12);
    isl(1, 0.72);
    // seal (chop), lower right
    const sz = 34, sx = X - 70, sy = Y - 64;
    b.fillStyle = `rgba(${SEAL}, 0.82)`; b.beginPath(); b.roundRect(sx - sz / 2, sy - sz / 2, sz, sz, 4); b.fill();
    b.fillStyle = 'rgba(250, 240, 228, 0.92)'; b.font = `${Math.round(sz * 0.68)}px "MS Mincho", SimSun, serif`;
    b.textAlign = 'center'; b.textBaseline = 'middle'; b.fillText('禅', sx, sy + 1);
    return c;
  }

  // ---- brush ---------------------------------------------------------------
  function newStroke(x, y) {
    brush.load = 1; brush.pw = 0; brush.lx = x; brush.ly = y;
    brush.str = Array.from({ length: 9 }, () => (Math.random() < 0.18 ? rnd(0.1, 0.35) : rnd(0.6, 1)));   // a few dry bristles
  }
  function paint(x, y, now) {
    const gap = now - brush.lt;
    if (gap > 140 || Math.hypot(x - brush.lx, y - brush.ly) > 220) { if (gap > 600) newStroke(x, y); else { brush.lx = x; brush.ly = y; } brush.lt = now; return; }
    const dx = x - brush.lx, dy = y - brush.ly, d = Math.hypot(dx, dy);
    if (d < 1.5) return;
    const v = d / Math.max(1, gap);                  // px per ms
    const w = clamp(14 - v * 4, 2.5, 14);
    const nx = -dy / d, ny = dx / d, b = inkA.getContext('2d');
    const pw = brush.pw || w; brush.pw = w;          // previous width -> bristles splay smoothly
    b.strokeStyle = 'rgb(28, 25, 22)'; b.lineCap = 'round';
    b.globalAlpha = 0.06 * brush.load; b.lineWidth = w * 0.9 * S;   // wet body
    b.beginPath(); b.moveTo(brush.lx * S, brush.ly * S); b.lineTo(x * S, y * S); b.stroke();
    b.lineWidth = Math.max(0.7, w * 0.12) * S;
    for (let k = 0; k < 9; k++) {                    // bristle hairs: continuous lines, dry ones break up
      const a = 0.24 * brush.load * brush.str[k];
      if (a < 0.01 || (brush.str[k] < 0.4 && Math.random() < 0.5)) continue;
      const f = (k - 4) / 4 * 0.5, o0 = f * pw, o1 = f * w;
      b.globalAlpha = a;
      b.beginPath(); b.moveTo((brush.lx + nx * o0) * S, (brush.ly + ny * o0) * S); b.lineTo((x + nx * o1) * S, (y + ny * o1) * S); b.stroke();
    }
    b.globalAlpha = 1;
    brush.load = Math.max(0, brush.load - d * 0.0008);
    if (v < 0.2 && brush.load > 0.4 && bleeds.length < 30 && Math.random() < 0.35) bleeds.push({ x, y, r0: w * 0.5, r1: w * 2.4, t: 0, life: 1.3, a: 0.03 });
    brush.lx = x; brush.ly = y; brush.lt = now;
  }
  function drawBleeds(dt) {
    const b = inkA.getContext('2d');
    for (let i = bleeds.length - 1; i >= 0; i--) {
      const e = bleeds[i]; e.t += dt;
      if (e.t >= e.life) { bleeds.splice(i, 1); continue; }
      const k = e.t / e.life, r = (e.r0 + (e.r1 - e.r0) * Math.sqrt(k)) * S;
      const rg = b.createRadialGradient(e.x * S, e.y * S, 0, e.x * S, e.y * S, r);
      rg.addColorStop(0, `rgba(30, 27, 24, ${e.a * (1 - k)})`); rg.addColorStop(0.7, `rgba(30, 27, 24, ${e.a * 0.6 * (1 - k)})`); rg.addColorStop(1, 'rgba(30, 27, 24, 0)');
      b.fillStyle = rg; b.beginPath(); b.arc(e.x * S, e.y * S, r, 0, TAU); b.fill();
    }
  }

  // ---- bamboo --------------------------------------------------------------
  function makeStalk(x, grown) {
    const segs = [], target = H * rnd(0.55, 0.85);
    for (let tot = 0; tot < target;) { const l = rnd(58, 96); segs.push(l); tot += l; }
    const leaves = segs.map((_, j) => (j < 2 || Math.random() < 0.45 ? [] :
      Array.from({ length: 1 + (Math.random() * 3 | 0) }, () => ({ side: Math.random() < 0.5 ? -1 : 1, ang: rnd(1.2, 2.2), len: rnd(46, 84), ph: rnd(0, TAU) }))));
    return { x, segs, leaves, grown, w: rnd(9, 13), lean: rnd(-0.07, 0.05), ph: rnd(0, TAU), alpha: 1, dying: false };
  }
  function makeBamboo() {
    stalks = [makeStalk(W - 150, rnd(3, 6)), makeStalk(W - 205, rnd(2, 4)), makeStalk(W - 112, rnd(1.5, 3))];
  }
  function growBamboo(dt) {
    for (const s of stalks) {
      if (s.dying) { s.alpha -= dt * 0.35; if (s.alpha <= 0) Object.assign(s, makeStalk(s.x, 0.3), { alpha: 0 }); }
      else if (s.alpha < 1) s.alpha = Math.min(1, s.alpha + dt * 0.6);
    }
    if (busy < 0.05) return;
    const s = stalks.find((q) => !q.dying && q.grown < q.segs.length);
    if (s) s.grown = Math.min(s.segs.length, s.grown + dt * 0.5 * busy);
    else if (!stalks.some((q) => q.dying)) stalks.reduce((a, b) => (b.grown > a.grown ? b : a)).dying = true;   // all grown: oldest makes room
  }
  function leaf(px0, py0, ang, len) {
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, wm = len * 0.17;
    const mx = px0 + dx * len * 0.32, my = py0 + dy * len * 0.32;
    g.beginPath(); g.moveTo(px0 * S, py0 * S);
    g.quadraticCurveTo((mx + nx * wm) * S, (my + ny * wm) * S, (px0 + dx * len) * S, (py0 + dy * len) * S);
    g.quadraticCurveTo((mx - nx * wm * 0.55) * S, (my - ny * wm * 0.55) * S, px0 * S, py0 * S);
    g.fill();
  }
  function drawBamboo() {
    const wind = 1 + busy * 1.5;
    g.lineCap = 'butt';
    for (const s of stalks) {
      if (s.grown <= 0 || s.alpha <= 0) continue;
      let x = s.x, y = H + 6, a = -Math.PI / 2 + s.lean;
      const n = Math.ceil(s.grown);
      for (let i = 0; i < n; i++) {
        const full = Math.min(1, s.grown - i), len = s.segs[i] * full;
        a += Math.sin(T * 0.55 + s.ph) * 0.006 * wind * (i + 1) / 3;
        const nx2 = x + Math.cos(a) * len, ny2 = y + Math.sin(a) * len;
        const gap = 2.2, ux = Math.cos(a), uy = Math.sin(a), w = s.w * (1 - i * 0.025);
        g.globalAlpha = 0.78 * s.alpha; g.strokeStyle = 'rgb(38, 35, 31)'; g.lineWidth = w * S;
        g.beginPath(); g.moveTo((x + ux * gap) * S, (y + uy * gap) * S); g.lineTo((nx2 - ux * gap) * S, (ny2 - uy * gap) * S); g.stroke();
        g.globalAlpha = 0.16 * s.alpha; g.strokeStyle = 'rgb(250, 244, 232)'; g.lineWidth = w * 0.28 * S;   // wet highlight
        g.beginPath(); g.moveTo((x + ux * gap * 3 - uy * w * 0.18) * S, (y + uy * gap * 3 + ux * w * 0.18) * S); g.lineTo((nx2 - ux * gap * 3 - uy * w * 0.18) * S, (ny2 - uy * gap * 3 + ux * w * 0.18) * S); g.stroke();
        if (full >= 1) {   // node
          g.globalAlpha = 0.9 * s.alpha; g.strokeStyle = 'rgb(24, 22, 19)'; g.lineWidth = 2.4 * S;
          g.beginPath(); g.moveTo((nx2 - uy * w * 0.62) * S, (ny2 + ux * w * 0.62) * S); g.quadraticCurveTo((nx2 + ux * 2) * S, (ny2 + uy * 2) * S, (nx2 + uy * w * 0.62) * S, (ny2 - ux * w * 0.62) * S); g.stroke();
          const grow = clamp((s.grown - i - 1) / 0.9, 0, 1);
          if (grow > 0) {
            g.fillStyle = 'rgb(30, 28, 25)';
            for (const lf of s.leaves[i + 1] || []) {
              g.globalAlpha = 0.74 * s.alpha * grow;
              const la = a + lf.side * lf.ang + Math.sin(T * 1.1 * wind + lf.ph) * 0.07 * wind;   // ang > 90deg from stalk = leaves hang down, sumi style
              leaf(nx2, ny2, la, lf.len * (0.4 + 0.6 * grow));
            }
          }
        }
        x = nx2; y = ny2;
      }
    }
    g.globalAlpha = 1;
  }

  // ---- living scene: swaying trees, drifting boat, moving water, birds -----
  let scene = null;
  function genTree(r, size) {
    const R = (a, z) => a + r() * (z - a);
    const mk = (ang, len, wd, d) => {
      const n = { ang, len, wd, bend: R(-0.12, 0.12), ph: R(0, TAU), kids: [] };
      if (d > 0 && len >= 3) { const m = r() < 0.35 ? 3 : 2; for (let k = 0; k < m; k++) n.kids.push(mk(R(-0.75, 0.75) + (k - (m - 1) / 2) * 0.35, len * R(0.62, 0.8), Math.max(0.5, wd * 0.62), d - 1)); }
      return n;
    };
    return mk(R(-0.12, 0.12), size * 0.34, Math.max(2, size * 0.045), 7);
  }
  function drawTree(c2, root, x, y, sw) {                     // sw = wind strength; tips sway more than trunk
    c2.strokeStyle = 'rgb(34, 32, 30)'; c2.lineCap = 'round';
    const go = (n, x0, y0, pa, d) => {
      const a = pa + n.ang + sw * Math.sin(T * 0.9 + n.ph) * 0.014 * d;
      const x1 = x0 + Math.cos(a) * n.len, y1 = y0 + Math.sin(a) * n.len, bx = n.bend * n.len;
      c2.lineWidth = n.wd; c2.beginPath(); c2.moveTo(x0, y0);
      c2.quadraticCurveTo((x0 + x1) / 2 - Math.sin(a) * bx, (y0 + y1) / 2 + Math.cos(a) * bx, x1, y1); c2.stroke();
      for (const k of n.kids) go(k, x1, y1, a, d + 1);
    };
    go(root, x, y, -Math.PI / 2, 0);
  }
  function makeScene() {
    const r = rng(SEED ^ 0x5bd1e995), R = (a, z) => a + r() * (z - a);
    const iy = H * 0.875, ix1 = W * 0.3, old = scene;
    const isTop = (x) => { const u = (x + 10) / (ix1 + 10); return iy - H * 0.035 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (0.85 + 0.15 * Math.sin(u * 17)); };
    scene = {
      W, iy, isTop,
      trees: [[0.05, 0.9], [0.12, 1.25], [0.2, 0.8], [0.255, 0.55]].map(([fx, k]) => ({ x: W * fx, tr: genTree(r, H * 0.13 * k) })),
      ripples: Array.from({ length: 34 }, () => ({ x: R(0, W), y: R(H * 0.83, H * 0.985), l: R(14, 80), a: R(0.05, 0.13), w: R(0.6, 1.3), sp: R(3, 9), ph: R(0, TAU) })),
      glints: Array.from({ length: 12 }, () => ({ dx: R(-46, 46), y: R(H * 0.84, H * 0.97), l: R(10, 34), ph: R(0, TAU) })),
      boat: old ? { ...old.boat, x: old.boat.x * W / old.W } : { x: W * 0.63, dir: -1, sp: 5 },
      flock: old ? old.flock : Array.from({ length: 14 }, () => ({ x: R(W * 0.4, W * 0.68), y: R(H * 0.08, H * 0.24), s: R(3.5, 7.5), ph: R(0, TAU), f: R(2.2, 3.4), vx: R(7, 12), vy: 0, life: -1 })),
    };
  }
  function updateScene(dt) {
    const bt = scene.boat;
    bt.x += bt.dir * bt.sp * dt;
    if (bt.x < W * 0.4) bt.dir = 1; else if (bt.x > W * 0.8) bt.dir = -1;
    const fl = scene.flock;
    for (let i = fl.length - 1; i >= 0; i--) {
      const b = fl[i];
      b.x += b.vx * dt; b.y += b.vy * dt + Math.sin(T * 0.5 + b.ph) * 3 * dt;
      if (b.life < 0) { if (b.x > W + 30) { b.x = -30; b.y = rnd(H * 0.06, H * 0.26); } continue; }
      b.life -= dt;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > 60) { b.vx *= 1 - dt * 0.45; b.vy *= 1 - dt * 0.45; }
      b.vy -= 5 * dt; b.f += (3 - b.f) * dt * 0.3;
      if (b.life <= 0 || b.x < -40 || b.x > W + 40 || b.y < -40) fl.splice(i, 1);
    }
  }
  function drawBird(c2, b) {
    const s = b.s, up = 0.25 + 0.6 * Math.sin(T * b.f * 2 + b.ph);
    c2.save(); c2.translate(b.x, b.y); c2.rotate(clamp(Math.atan2(b.vy, Math.abs(b.vx) + 1) * 0.35, -0.5, 0.5) * Math.sign(b.vx || 1));
    c2.beginPath(); c2.moveTo(-s * 1.4, -s * up); c2.quadraticCurveTo(-s * 0.5, -s * 0.15 - s * up * 0.2, 0, 0.6); c2.quadraticCurveTo(s * 0.5, -s * 0.15 - s * up * 0.2, s * 1.4, -s * up * 1.05);
    c2.quadraticCurveTo(s * 0.5, s * 0.1, 0, s * 0.35); c2.quadraticCurveTo(-s * 0.5, s * 0.1, -s * 1.4, -s * up); c2.fill();
    c2.restore();
  }
  function drawBoat(c2) {
    const bt = scene.boat, INKc = 'rgb(34, 32, 30)';
    c2.save(); c2.translate(bt.x, H * 0.9 + Math.sin(T * 1.3) * 1.1); c2.rotate(Math.sin(T * 1.1) * 0.015); if (bt.dir > 0) c2.scale(-1, 1);
    c2.fillStyle = INKc; c2.strokeStyle = INKc; c2.lineCap = 'round';
    c2.globalAlpha = 0.1; c2.beginPath(); c2.ellipse(-2, 5, 46, 3.2, 0, 0, TAU); c2.fill();
    c2.globalAlpha = 0.86;
    c2.beginPath(); c2.moveTo(-50, -11); c2.quadraticCurveTo(-30, 5, 0, 5); c2.quadraticCurveTo(30, 5, 47, -9);
    c2.quadraticCurveTo(28, -2, 0, -2.5); c2.quadraticCurveTo(-28, -2.5, -50, -11); c2.fill();
    c2.globalAlpha = 0.7; c2.beginPath(); c2.moveTo(-24, -2.5); c2.bezierCurveTo(-25, -18, 9, -18, 8, -2.5); c2.closePath(); c2.fill();
    c2.strokeStyle = 'rgb(246, 240, 228)'; c2.globalAlpha = 0.28; c2.lineWidth = 0.8;
    for (const u of [-16, -8, 0]) { c2.beginPath(); c2.moveTo(u, -3); c2.quadraticCurveTo(u + 1, -12, u + 2, -14.5); c2.stroke(); }
    const pl = Math.sin(T * 0.8);                                   // poling stroke
    c2.strokeStyle = INKc; c2.globalAlpha = 0.88;
    c2.lineWidth = 2.6; c2.beginPath(); c2.moveTo(27, -3); c2.quadraticCurveTo(28.5 + pl, -10, 28 + pl * 1.5, -17); c2.stroke();
    c2.beginPath(); c2.moveTo(21.5 + pl * 1.5, -16.5); c2.lineTo(28 + pl * 1.5, -23); c2.lineTo(34.5 + pl * 1.5, -16.5); c2.closePath(); c2.fill();
    c2.lineWidth = 1.1; c2.beginPath(); c2.moveTo(25 + pl * 1.5, -13); c2.lineTo(56 + pl * 7, 9); c2.stroke();
    c2.globalAlpha = 0.12; c2.lineWidth = 0.9;
    for (const [x0, l] of [[-58, 30], [-20, 46], [40, 26]]) { c2.beginPath(); c2.moveTo(x0 + Math.sin(T * 0.7 + x0) * 4, 9); c2.lineTo(x0 + l + Math.sin(T * 0.7 + x0) * 4, 9); c2.stroke(); }
    c2.restore();
  }
  function drawScene() {
    const c2 = g;
    c2.save(); c2.setTransform(S, 0, 0, S, 0, 0); c2.lineCap = 'round';
    c2.strokeStyle = 'rgb(34, 32, 30)';
    for (const rp of scene.ripples) {
      const x = ((rp.x + T * rp.sp) % (W + 120)) - 60;
      c2.globalAlpha = rp.a * (0.65 + 0.35 * Math.sin(T * 0.8 + rp.ph)); c2.lineWidth = rp.w;
      c2.beginPath(); c2.moveTo(x, rp.y); c2.quadraticCurveTo(x + rp.l / 2, rp.y - 1 - Math.sin(T * 1.2 + rp.ph), x + rp.l, rp.y); c2.stroke();
    }
    c2.strokeStyle = 'rgb(226, 110, 60)';                           // sun glitter on the water
    for (const gl of scene.glints) {
      c2.globalAlpha = 0.2 * Math.max(0, Math.sin(T * 1.5 + gl.ph)); c2.lineWidth = 1.2;
      const x = W * 0.7 + gl.dx + Math.sin(T * 0.6 + gl.ph) * 6;
      c2.beginPath(); c2.moveTo(x - gl.l / 2, gl.y); c2.lineTo(x + gl.l / 2, gl.y); c2.stroke();
    }
    c2.globalAlpha = 0.85;
    for (const tr of scene.trees) drawTree(c2, tr.tr, tr.x, scene.isTop(tr.x) + 2, 1 + busy * 0.8);
    drawBoat(c2);
    c2.fillStyle = 'rgb(34, 32, 30)';
    for (const b of scene.flock) { c2.globalAlpha = 0.72; drawBird(c2, b); }
    c2.restore(); c2.globalAlpha = 1;
  }

  // ---- loop ----------------------------------------------------------------
  function update(dt) {
    busy += (busyTarget - busy) * Math.min(1, dt * (busyTarget > busy ? 2 : 0.7));
    growBamboo(dt);
    updateScene(dt);
  }
  function draw() {
    g.globalAlpha = 1;
    g.drawImage(base, 0, 0);
    drawScene();
    drawBamboo();
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const lively = busy > 0.02 || busyTarget > 0 || T - ptr.t < 2 || scene.flock.some((b) => b.life >= 0);
    if (now - last < (lively ? 15 : 33)) return;    // ~60 fps active, ~30 idle
    const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
    update(dt); draw();
  }

  // ---- events --------------------------------------------------------------
  function onMove(e) {
    if (!styleEl || styleEl.disabled) return;
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = T;
  }
  // ---- ink drops: click = a drop lands and blooms into the paper ----------
  const drops = [];
  function makeDrop(x, y, R, delay = 0) {
    const n = 56, lobes = [], f = [rnd(0, TAU), rnd(0, TAU), rnd(0, TAU)];
    for (let i = 0; i < n; i++) { const a = i / n * TAU; lobes.push(1 + 0.13 * Math.sin(a * 3 + f[0]) + 0.08 * Math.sin(a * 5 + f[1]) + 0.05 * Math.sin(a * 9 + f[2]) + rnd(-0.03, 0.03)); }
    const fibres = Array.from({ length: 10 + (Math.random() * 8 | 0) }, () => ({ a: rnd(0, TAU), l: rnd(0.25, 0.7), w: rnd(0.5, 1.3), bend: rnd(-0.4, 0.4) }));
    return { x, y, R, t: -delay, life: 2.6, lobes, fibres, ink: rnd(0.62, 0.8) };
  }
  function drawDrop(c2, d) {
    if (d.t <= 0) return;
    const k = 1 - Math.exp(-d.t * 2.4), r = d.R * (0.12 + 0.88 * k), n = d.lobes.length;
    c2.save(); c2.setTransform(S, 0, 0, S, 0, 0);
    const outline = () => { c2.beginPath(); for (let i = 0; i <= n; i++) { const a = i / n * TAU, q = r * d.lobes[i % n]; i ? c2.lineTo(d.x + Math.cos(a) * q, d.y + Math.sin(a) * q) : c2.moveTo(d.x + Math.cos(a) * q, d.y + Math.sin(a) * q); } c2.closePath(); };
    c2.filter = `blur(${Math.max(1, r * 0.12) * S}px)`;                                   // wet halo soaking outward
    c2.globalAlpha = 0.22 * d.ink; c2.fillStyle = 'rgb(40, 36, 32)';
    c2.save(); c2.translate(d.x, d.y); c2.scale(1.18, 1.18); c2.translate(-d.x, -d.y); outline(); c2.fill(); c2.restore();
    c2.filter = `blur(${0.8 * S}px)`;
    const gr = c2.createRadialGradient(d.x, d.y, 0, d.x, d.y, r * 1.15);
    gr.addColorStop(0, `rgba(22, 20, 18, ${d.ink})`); gr.addColorStop(0.55, `rgba(30, 27, 24, ${d.ink * 0.72})`); gr.addColorStop(0.92, `rgba(34, 31, 28, ${d.ink * 0.55})`); gr.addColorStop(1, `rgba(34, 31, 28, ${d.ink * 0.35})`);
    c2.globalAlpha = 1; c2.fillStyle = gr; outline(); c2.fill();
    c2.filter = 'none'; c2.strokeStyle = 'rgb(20, 18, 16)'; c2.globalAlpha = 0.18 * d.ink; c2.lineWidth = 1.6; outline(); c2.stroke();   // pooled rim
    c2.lineCap = 'round'; c2.globalAlpha = 0.22 * d.ink * Math.min(1, d.t * 1.5);                                                       // ink wicking along paper fibres
    for (const fb of d.fibres) {
      const r0 = r * d.lobes[Math.floor((fb.a / TAU) * n) % n] * 0.96, L = d.R * fb.l * k;
      const x0 = d.x + Math.cos(fb.a) * r0, y0 = d.y + Math.sin(fb.a) * r0, a2 = fb.a + fb.bend;
      c2.lineWidth = fb.w; c2.beginPath(); c2.moveTo(x0, y0);
      c2.quadraticCurveTo(x0 + Math.cos(fb.a) * L * 0.5, y0 + Math.sin(fb.a) * L * 0.5, x0 + Math.cos(a2) * L, y0 + Math.sin(a2) * L); c2.stroke();
    }
    c2.restore();
  }
  function onDown(e) {
    if (!styleEl || styleEl.disabled || !scene) return;
    const x = e.clientX, y = e.clientY;
    for (let k = 0, n = 10 + (Math.random() * 8 | 0); k < n; k++) {
      const a = -Math.PI / 2 + rnd(-1.1, 1.1), sp = rnd(130, 230);
      scene.flock.push({ x: x + rnd(-14, 14), y: y + rnd(-10, 10), s: rnd(4, 7.5), ph: rnd(0, TAU), f: rnd(7, 9.5), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 14 });
    }
    if (scene.flock.length > 90) scene.flock.splice(14, scene.flock.length - 90);
    ptr.t = T;
  }
  function resize() {
    W = innerWidth; H = innerHeight; S = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(W * S)), h = Math.max(1, Math.round(H * S));
    cv.width = w; cv.height = h;
    makeScene();
    base = makeBase(w, h);
    const ox = stalks.length ? W - 150 - stalks[0].x : 0;
    for (const s of stalks) s.x += ox;
    if (!stalks.length) makeBamboo();
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
  // Stop button present = Claude is answering. Only checks that a control exists; never reads messages.
  const BUSY_SEL = 'button[aria-label*="Stop" i], button[aria-label*="Dừng" i], button[aria-label*="Interrupt" i]';
  const checkBusy = () => { busyTarget = document.querySelector(BUSY_SEL) ? 1 : 0; };

  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  function mount() {
    if (isDark()) { window.__claudeSkinState = 'skipped-dark'; return; }
    styleEl = document.createElement('style'); styleEl.id = 'cs-style'; styleEl.textContent = css;
    document.head.appendChild(styleEl);
    backdrop = document.createElement('div'); backdrop.id = 'cs-backdrop';
    cv = document.createElement('canvas'); cv.id = 'cs-paper'; backdrop.appendChild(cv);
    document.body.prepend(backdrop);
    g = cv.getContext('2d', { alpha: false });
    resize();
    clearUnder(); clearTimer = setInterval(clearUnder, 2000);
    checkBusy(); busyTimer = setInterval(checkBusy, 500);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('resize', resize);
    start();
    // debug: advance + snapshot (works while window hidden); optional forced busy and a test stroke
    window.__claudeSkinStep = (n = 1, opts = {}) => {
      if (opts.busy != null) busyTarget = opts.busy;
      if (opts.stroke) { const now = performance.now(); brush.lt = 0; newStroke(...opts.stroke[0]); brush.lt = now - 30; for (const [x, y] of opts.stroke) { brush.lt -= 0; paint(x, y, brush.lt + 30); } }
      if (opts.click) onDown({ clientX: opts.click[0], clientY: opts.click[1] });
      for (let i = 0; i < n; i++) { T += 1 / 30; update(1 / 30); }
      draw(); return cv.toDataURL('image/png');
    };
    window.__claudeSkinState = 'on';
  }

  let glassA = 0.5, toastT = 0;
  function setGlass(a) {
    glassA = Math.round(clamp(a, 0.2, 0.9) * 10) / 10;
    document.documentElement.style.setProperty('--cs-a', String(glassA));
    let t = document.getElementById('cs-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cs-toast'; document.body.appendChild(t); }
    t.textContent = `Glass ${Math.round(glassA * 100)}%`; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1100);
  }
  const onKey = (e) => {   // Ctrl+Alt+Up/Down glass, Ctrl+Alt+G on/off
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
    window.__claudeSkin = false; window.__claudeSkinState = 'off'; delete window.__claudeSkinStep;
  };

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();
