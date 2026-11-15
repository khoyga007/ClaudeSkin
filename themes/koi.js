// ClaudeSkin theme "Koi Pond": live canvas pond (koi, lily pads, caustics, ripples)
// behind light liquid-glass panels. Keeps app light mode + dark text.
// Pure local code: no network, no storage, no images (everything drawn in code).
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;
  window.__claudeSkinBase = [70, 128, 120];   // deep pond tone under glass (audit worst case)

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const KOI = '226, 88, 44';
  const EDGE = 'rgba(255, 255, 255, 0.7)';
  const SHADOW = 'rgba(12, 48, 44, 0.16)';
  const css = `
:root:not([data-mode="dark"]) {
  /* cool, slightly darker text than stock -> >=4.5:1 on translucent glass */
  --text-000: 190 18% 8% !important;
  --text-100: 190 16% 11% !important;
  --text-200: 190 10% 19% !important;
  --text-300: 190 10% 19% !important;
  --text-400: 190 9% 24% !important;
  --text-500: 190 9% 24% !important;
  --cds-text-primary: #121c1c !important;
  --cds-text-secondary: #2a3634 !important;
  --cds-text-stays-secondary: #2a3634 !important;
  --cds-text-muted: #354240 !important;
  --border-100: 185 30% 20% !important;
  --border-200: 185 30% 20% !important;
  --border-300: 185 30% 20% !important;
  --border-400: 185 30% 20% !important;
  --cds-border: rgba(20, 72, 68, 0.15) !important;
  --cds-border-line: rgba(20, 72, 68, 0.17) !important;
  --cds-surface-0: rgba(246, 252, 250, 0.36) !important;
  --cds-surface-1: rgba(246, 252, 250, 0.36) !important;
  --cds-surface-2: rgba(248, 253, 251, 0.56) !important;
  --cds-surface-3: rgba(250, 254, 253, 0.86) !important;
  --cds-surface-popover: rgba(250, 254, 253, 0.95) !important;
}
:root:not([data-mode="dark"]) { background: #7fb3a8 !important; --cs-a: 0.5; }   /* --cs-a = glass opacity, Ctrl+Alt+Up/Down */
:root:not([data-mode="dark"]) body { background: transparent !important; }
:root:not([data-mode="dark"]) body > div.grid,
:root:not([data-mode="dark"]) .dframe-content,
:root:not([data-mode="dark"]) .dframe-nav-scroll,
:root:not([data-mode="dark"]) div.pointer-events-none.absolute.inset-0.bg-surface-1,
:root:not([data-mode="dark"]) [class*="bg-[var(--epitaxy-transc"],
:root:not([data-mode="dark"]) [data-cs-clear] { background: transparent !important; }

/* glass: no backdrop-filter anywhere (pond animates -> blur would recompute every frame) */
:root:not([data-mode="dark"]) .dframe-sidebar {
  background: rgba(243, 251, 248, calc(var(--cs-a) + 0.12)) !important;   /* no backdrop-filter: re-blurring a live canvas every frame caused ~100ms hitches */
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px rgba(255,255,255,0.35), 0 10px 40px ${SHADOW};
}
:root:not([data-mode="dark"]) .tiles-shell {
  background: rgba(248, 253, 252, var(--cs-a)) !important;
  border-radius: 18px;
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px rgba(255,255,255,0.4), 0 10px 40px ${SHADOW};
}
:root:not([data-mode="dark"]) .epitaxy-code-card {
  background: rgba(252, 255, 254, 0.8) !important;
  box-shadow: inset 0 1px 0 ${EDGE};
  transition: transform .2s ease, box-shadow .2s ease;
}
:root:not([data-mode="dark"]) .epitaxy-code-card:hover { transform: translateY(-1px); box-shadow: inset 0 1px 0 ${EDGE}, 0 8px 24px ${SHADOW}; }
/* thin glass: links + 'muted-as-secondary' (timestamps) need deeper ink */
:root:not([data-mode="dark"]) .prose-link { color: #123f7a !important; }
:root:not([data-mode="dark"]) .text-muted-as-secondary { color: var(--cds-text-secondary) !important; }
:root:not([data-mode="dark"]) ::selection { background: rgba(${KOI}, 0.26); }
:root:not([data-mode="dark"]) textarea:focus-visible,
:root:not([data-mode="dark"]) [contenteditable="true"]:focus-visible { outline-color: rgb(${KOI}) !important; }
:root:not([data-mode="dark"]) .dframe-sidebar a, :root:not([data-mode="dark"]) .dframe-sidebar button { transition: background-color .18s ease, transform .18s ease; }
:root:not([data-mode="dark"]) .dframe-sidebar a:hover, :root:not([data-mode="dark"]) .dframe-sidebar button:hover { background-color: rgba(255, 255, 255, 0.6) !important; transform: translateX(2px); }

#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: #7fb3a8; }
:root[data-mode="dark"] #cs-backdrop { display: none; }
#cs-pond { display: block; width: 100%; height: 100%; }
#cs-toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 2147483000; pointer-events: none;
  padding: 6px 14px; border-radius: 999px; background: rgba(18, 40, 38, 0.82); color: #f2fbf8; font: 500 13px system-ui, sans-serif;
  opacity: 0; transition: opacity .25s ease; }
#cs-toast.show { opacity: 1; }
`;

  // ---- helpers -------------------------------------------------------------
  const TAU = Math.PI * 2;
  const MAXB = 0.36;                              // max bend per spine joint (rad)
  let S = 1;                                       // render scale = devicePixelRatio (set in resize)
  const K = () => S / 0.5;                          // sizes below were tuned at S = 0.5
  const rnd = (a, b) => a + Math.random() * (b - a);
  const wrapA = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const px = new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true });
  function alphaOf(c) { px.clearRect(0, 0, 1, 1); px.fillStyle = 'rgba(0,0,0,0)'; px.fillStyle = c; px.fillRect(0, 0, 1, 1); return px.getImageData(0, 0, 1, 1).data[3] / 255; }

  let styleEl, backdrop, cv, g, bed, causPat, raf = 0, last = 0, T = 0, W = 0, H = 0, clearTimer = 0, nextAmb = 2;
  const fish = [], pads = [], ripples = [];
  const ptr = { x: -1e4, y: -1e4, t: -1e9 };

  // ---- static layers (built once per resize) -------------------------------
  function makeBed(w, h) {
    const c = new OffscreenCanvas(w, h), x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#b4dacb'); gr.addColorStop(0.45, '#86bbad'); gr.addColorStop(1, '#538f86');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) {                  // deeper patches
      const cx = Math.random() * w, cy = Math.random() * h, r = rnd(0.15, 0.35) * Math.max(w, h);
      const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      rg.addColorStop(0, 'rgba(28, 82, 76, 0.22)'); rg.addColorStop(1, 'rgba(28, 82, 76, 0)');
      x.fillStyle = rg; x.fillRect(0, 0, w, h);
    }
    const n = Math.round((w * h) / (2400 * K() * K()));   // pebbles
    for (let i = 0; i < n; i++) {
      const k = Math.random(), r = rnd(1.5, 7) * K();
      x.fillStyle = `rgba(${k < 0.5 ? '64, 92, 82' : k < 0.8 ? '124, 112, 92' : '214, 214, 198'}, ${rnd(0.1, 0.3)})`;
      x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, r, r * rnd(0.55, 0.9), rnd(0, TAU), 0, TAU); x.fill();
    }
    const v = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(18, 52, 50, 0)'); v.addColorStop(1, 'rgba(18, 52, 50, 0.32)');
    x.fillStyle = v; x.fillRect(0, 0, w, h);
    return c;
  }

  // Tileable caustic net: Voronoi F2-F1 edges on a torus.
  function makeCaustics() {
    const N = 192, P = 11, c = new OffscreenCanvas(N, N), x = c.getContext('2d');
    const pts = Array.from({ length: P }, () => [Math.random() * N, Math.random() * N]);
    const img = x.createImageData(N, N), d = img.data;
    for (let y = 0; y < N; y++) for (let X = 0; X < N; X++) {
      let f1 = 1e9, f2 = 1e9;
      for (const [qx, qy] of pts) {
        let dx = Math.abs(X - qx); dx = Math.min(dx, N - dx);
        let dy = Math.abs(y - qy); dy = Math.min(dy, N - dy);
        const dd = Math.sqrt(dx * dx + dy * dy);
        if (dd < f1) { f2 = f1; f1 = dd; } else if (dd < f2) f2 = dd;
      }
      const v = Math.max(0, 1 - (f2 - f1) / 10), i = (y * N + X) * 4;
      d[i] = 236; d[i + 1] = 255; d[i + 2] = 246; d[i + 3] = v * v * v * 255;
    }
    x.putImageData(img, 0, 0);
    const soft = new OffscreenCanvas(N, N), y2 = soft.getContext('2d');   // soften the straight Voronoi edges
    y2.filter = 'blur(1.6px)';
    for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) y2.drawImage(c, ox, oy);   // wrap so the tile stays seamless
    return soft;
  }

  function padSprite(r, flower) {
    const R = Math.ceil(r * S), size = R * 2 + 6, c = new OffscreenCanvas(size, size), x = c.getContext('2d');
    x.translate(size / 2, size / 2);
    const notch = 0.34;
    x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, R, notch / 2, TAU - notch / 2); x.closePath();
    const gr = x.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
    gr.addColorStop(0, '#9ccc72'); gr.addColorStop(0.7, '#62a04c'); gr.addColorStop(1, '#40793a');
    x.fillStyle = gr; x.fill();
    x.strokeStyle = 'rgba(36, 76, 32, 0.55)'; x.lineWidth = Math.max(1, R * 0.04); x.stroke();
    x.strokeStyle = 'rgba(222, 242, 192, 0.38)'; x.lineWidth = Math.max(0.6, R * 0.025);
    for (let k = 0; k < 9; k++) {
      const a = notch / 2 + ((TAU - notch) * (k + 0.5)) / 9;
      x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.92); x.stroke();
    }
    if (flower) {
      for (const [cnt, len, col, rot] of [[9, R * 0.62, '#f4bccd', 0], [7, R * 0.42, '#fbe1e9', 0.35]]) {
        for (let k = 0; k < cnt; k++) {
          x.save(); x.rotate(rot + (k * TAU) / cnt);
          x.beginPath(); x.ellipse(len * 0.5, 0, len * 0.5, len * 0.21, 0, 0, TAU);
          x.fillStyle = col; x.fill(); x.strokeStyle = 'rgba(196, 84, 118, 0.35)'; x.lineWidth = 0.8; x.stroke();
          x.restore();
        }
      }
      x.beginPath(); x.arc(0, 0, R * 0.12, 0, TAU); x.fillStyle = '#f2cc48'; x.fill();
    }
    return c;
  }

  // ---- creatures -----------------------------------------------------------
  // spot: [spine index, lateral offset (-1..1 of half-width), radius (x L), color]
  const PATTERNS = [
    { body: '#f7f3ec', spots: [[1.3, 0.1, 0.13, '#e2471f'], [3.7, -0.3, 0.15, '#e2471f'], [6, 0.25, 0.11, '#e2471f']] },   // kohaku
    { body: '#f6f1e8', spots: [[1.1, -0.2, 0.12, '#e04a22'], [4.2, 0.2, 0.14, '#e04a22'], [3, 0.55, 0.05, '#1c1c1e'], [6.3, -0.45, 0.05, '#1c1c1e']] }, // sanke
    { body: '#211e20', spots: [[1.1, 0, 0.12, '#e24d24'], [3.8, 0.35, 0.11, '#f4efe6'], [5.6, -0.3, 0.12, '#e24d24']] },  // showa
    { body: '#efb23b', spots: [], sheen: 0.5 },                                                                       // ogon
    { body: '#f2802e', spots: [[2.6, 0, 0.09, '#f8b45c']] },                                                           // orange
    { body: '#f8f5ef', spots: [[0.7, 0, 0.09, '#d93a1c']] },                                                           // tancho
    { body: '#ece5d7', spots: [[2, 0.3, 0.1, '#5d6f86'], [4.6, -0.3, 0.11, '#5d6f86'], [3.2, 0, 0.08, '#ec7a3c']] },    // asagi-ish
    { body: '#f7f3ec', spots: [[2.2, -0.1, 0.16, '#e5531f'], [5.2, 0.2, 0.1, '#e5531f']] },
  ];

  function makeFish(i) {
    const L = rnd(95, 150), n = 12, seg = L / n;
    const x = rnd(0.12, 0.88) * W, y = rnd(0.12, 0.88) * H, a = rnd(-Math.PI, Math.PI);
    const sp = [];
    for (let k = 0; k < n; k++) sp.push([x - Math.cos(a) * seg * k, y - Math.sin(a) * seg * k]);
    return { L, n, seg, sp, a, v: rnd(28, 44), base: rnd(26, 44), wt: 0, ph: rnd(0, TAU),
      depth: rnd(0.68, 1), pat: PATTERNS[i % PATTERNS.length], flee: 0, lure: null };
  }

  function makePads() {
    pads.length = 0;
    const count = W * H > 1.6e6 ? 7 : 6;
    for (let i = 0; i < count; i++) {
      let x = 0, y = 0;
      for (let t = 0; t < 30; t++) {               // keep pads off the central reading area
        x = Math.random() * W; y = Math.random() * H;
        if (!(x > W * 0.28 && x < W * 0.78 && y > H * 0.18 && y < H * 0.82)) break;
      }
      const r = rnd(30, 58), flower = i < 2;
      pads.push({ x, y, r, a: rnd(0, TAU), dx: rnd(-4, 4), dy: rnd(-3, 3), vx: 0, vy: 0, va: rnd(-0.03, 0.03),
        bob: rnd(0, TAU), spr: padSprite(r, flower) });
    }
    for (const p of pads) { p.vx = p.dx; p.vy = p.dy; }
  }

  const widthAt = (f, t) => f.L * (t < 0.18 ? 0.07 + 0.45 * t : 0.15 * Math.pow(1 - (t - 0.18) / 0.82, 1.1) + 0.012);
  function spinePt(f, si) {
    const i = clamp(Math.floor(si), 0, f.n - 2), u = si - i, a = f.sp[i], b = f.sp[i + 1];
    const ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
    return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, ang, nx: -Math.sin(ang), ny: Math.cos(ang), w: widthAt(f, si / (f.n - 1)) };
  }

  // ---- simulation ----------------------------------------------------------
  function update(dt) {
    for (const f of fish) {
      const h = f.sp[0];
      let dx = Math.cos(f.a), dy = Math.sin(f.a);
      const m = 110;                                // soft walls
      if (h[0] < m) dx += ((m - h[0]) / m) * 2.4; if (h[0] > W - m) dx -= ((h[0] - (W - m)) / m) * 2.4;
      if (h[1] < m) dy += ((m - h[1]) / m) * 2.4; if (h[1] > H - m) dy -= ((h[1] - (H - m)) / m) * 2.4;
      for (const o of fish) {                       // separation
        if (o === f) continue;
        const ex = h[0] - o.sp[0][0], ey = h[1] - o.sp[0][1], dd = Math.hypot(ex, ey);
        if (dd > 0 && dd < f.L * 0.7) { dx += (ex / dd) * 0.8; dy += (ey / dd) * 0.8; }
      }
      let tgt = null, slow = 1;
      if (f.flee > 0) { f.flee -= dt; dx += Math.cos(f.fleeA) * 3; dy += Math.sin(f.fleeA) * 3; }
      else if (f.lure && f.lure.t > 0) { tgt = f.lure; f.lure.t -= dt; }
      else if (T - ptr.t < 4 && Math.hypot(ptr.x - h[0], ptr.y - h[1]) < 380) tgt = ptr;   // "waiting for food"
      if (tgt) {
        const ex = tgt.x - h[0], ey = tgt.y - h[1], dd = Math.hypot(ex, ey) || 1, w = dd < 70 ? 0.3 : 1.4;
        dx += (ex / dd) * w; dy += (ey / dd) * w; if (dd < 90) slow = 0.45;
      }
      f.wt = clamp(f.wt * 0.995 + (Math.random() - 0.5) * 2.4 * dt, -0.9, 0.9);   // wander
      const maxT = (f.flee > 0 ? 3.4 : 1.8) * dt;
      f.a = wrapA(f.a + clamp(wrapA(Math.atan2(dy, dx) - f.a), -maxT, maxT) + f.wt * dt);
      const tv = f.flee > 0 ? 230 : f.base * slow * (tgt ? 1.25 : 1);
      f.v += (tv - f.v) * Math.min(1, dt * (f.flee > 0 ? 6 : 1.2));
      f.ph += dt * (3 + f.v / 22);
      const ma = f.a + Math.sin(f.ph) * 0.22;      // swimming undulation, body follows the head
      h[0] = clamp(h[0] + Math.cos(ma) * f.v * dt, -40, W + 40);
      h[1] = clamp(h[1] + Math.sin(ma) * f.v * dt, -40, H + 40);
      let back = ma + Math.PI;
      for (let k = 1; k < f.n; k++) {
        const p = f.sp[k], q = f.sp[k - 1];
        let ang = Math.atan2(p[1] - q[1], p[0] - q[0]);
        const bend = wrapA(ang - back);
        if (Math.abs(bend) > MAXB) ang = back + Math.sign(bend) * MAXB;
        p[0] = q[0] + Math.cos(ang) * f.seg; p[1] = q[1] + Math.sin(ang) * f.seg; back = ang;
      }
    }
    for (const p of pads) {
      p.vx += (p.dx - p.vx) * 0.25 * dt; p.vy += (p.dy - p.vy) * 0.25 * dt; p.va *= 1 - 0.3 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
      if (p.x < -p.r) p.x = W + p.r; else if (p.x > W + p.r) p.x = -p.r;
      if (p.y < -p.r) p.y = H + p.r; else if (p.y > H + p.r) p.y = -p.r;
    }
    for (const r of ripples) r.t += dt;
    while (ripples.length && ripples[0].t > ripples[0].life) ripples.shift();
    if (T > nextAmb) {                              // a fish kisses the surface now and then
      const f = fish[(Math.random() * fish.length) | 0];
      const at = Math.random() < 0.6 && f ? f.sp[0] : [Math.random() * W, Math.random() * H];
      ripples.push({ x: at[0], y: at[1], t: 0, life: 1.6, R: 55, s: 0.6 });
      nextAmb = T + rnd(2.5, 6);
    }
  }

  // ---- drawing (world coords in CSS px; ctx scaled by S) -------------------
  function bodyPath(f, ox, oy) {
    const n = f.n, sp = f.sp, left = [], right = [];
    for (let k = 0; k < n; k++) {
      const p = sp[k], q = sp[Math.min(n - 1, k + 1)], r = sp[Math.max(0, k - 1)];
      let tx = r[0] - q[0], ty = r[1] - q[1];
      const d = Math.hypot(tx, ty) || 1; tx /= d; ty /= d;
      const w = widthAt(f, k / (n - 1));
      left.push([p[0] - ty * w + ox, p[1] + tx * w + oy]);
      right.push([p[0] + ty * w + ox, p[1] - tx * w + oy]);
    }
    const fa = Math.atan2(sp[0][1] - sp[1][1], sp[0][0] - sp[1][0]);
    g.beginPath();
    g.moveTo(left[0][0], left[0][1]);
    for (let k = 1; k < n; k++) g.lineTo(left[k][0], left[k][1]);
    for (let k = n - 1; k >= 0; k--) g.lineTo(right[k][0], right[k][1]);
    g.arc(sp[0][0] + ox, sp[0][1] + oy, widthAt(f, 0), fa - Math.PI / 2, fa + Math.PI / 2);
    g.closePath();
  }

  function tailPath(f, ox, oy) {
    const p = f.sp[f.n - 1], q = f.sp[f.n - 3];
    const A = Math.atan2(p[1] - q[1], p[0] - q[0]) + Math.sin(f.ph + 1.2) * 0.35, len = f.L * 0.26;
    const P = (da, d) => [p[0] + Math.cos(A + da) * d + ox, p[1] + Math.sin(A + da) * d + oy];
    g.beginPath(); g.moveTo(...P(0, 0));
    g.quadraticCurveTo(...P(-0.2, len * 0.6), ...P(-0.5, len));
    g.quadraticCurveTo(...P(-0.1, len * 0.78), ...P(0, len * 0.66));
    g.quadraticCurveTo(...P(0.1, len * 0.78), ...P(0.5, len));
    g.quadraticCurveTo(...P(0.2, len * 0.6), ...P(0, 0));
  }

  function fins(f, col) {
    const sw = Math.sin(f.ph * 0.5) * 0.3;
    for (const [si, len] of [[2.4, f.L * 0.17], [6, f.L * 0.09]]) {
      const s = spinePt(f, si);
      for (const side of [-1, 1]) {
        const a = s.ang + side * (Math.PI / 2 + 0.55 + sw), rx = s.x + side * s.nx * s.w * 0.75, ry = s.y + side * s.ny * s.w * 0.75;
        g.beginPath();
        g.ellipse(rx + Math.cos(a) * len * 0.5, ry + Math.sin(a) * len * 0.5, len * 0.5, len * 0.22, a, 0, TAU);
        g.fillStyle = col; g.fill();
      }
    }
  }

  function drawShadow(f) {
    g.globalAlpha = 0.15 * f.depth; g.fillStyle = '#0b2826';
    bodyPath(f, 14, 20); g.fill(); tailPath(f, 14, 20); g.fill();
  }

  function drawFish(f) {
    const base = 0.55 + 0.45 * f.depth;
    g.globalAlpha = base * 0.62; fins(f, f.pat.body); tailPath(f, 0, 0); g.fillStyle = f.pat.body; g.fill();
    g.globalAlpha = base;
    bodyPath(f, 0, 0); g.fillStyle = f.pat.body; g.fill();
    g.strokeStyle = 'rgba(20, 30, 30, 0.14)'; g.lineWidth = 1.2; g.stroke();
    g.save(); g.clip();
    for (const [si, off, rr, col] of f.pat.spots) {
      const s = spinePt(f, si);
      g.beginPath(); g.ellipse(s.x + s.nx * off * s.w, s.y + s.ny * off * s.w, rr * f.L, rr * f.L * 0.72, s.ang, 0, TAU);
      g.fillStyle = col; g.fill();
    }
    g.strokeStyle = `rgba(255, 255, 255, ${f.pat.sheen || 0.22})`; g.lineWidth = f.L * 0.035; g.lineCap = 'round';
    g.beginPath(); g.moveTo(f.sp[1][0], f.sp[1][1]);
    for (let k = 2; k < f.n - 2; k++) g.lineTo(f.sp[k][0], f.sp[k][1]);
    g.stroke();
    g.restore();
    const e = spinePt(f, 0.5);
    g.fillStyle = 'rgba(14, 14, 16, 0.8)';
    for (const side of [-1, 1]) { g.beginPath(); g.arc(e.x + side * e.nx * e.w * 0.72, e.y + side * e.ny * e.w * 0.72, f.L * 0.017, 0, TAU); g.fill(); }
  }

  function draw() {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.drawImage(bed, 0, 0);
    g.setTransform(S, 0, 0, S, 0, 0);
    g.fillStyle = 'rgba(10, 40, 36, 0.17)';
    for (const p of pads) { g.beginPath(); g.ellipse(p.x + 10, p.y + 14, p.r, p.r * 0.92, 0, 0, TAU); g.fill(); }
    for (const f of fish) drawShadow(f);
    for (const f of fish) drawFish(f);              // sorted by depth at creation
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    for (const [sc, vx, vy, al] of [[1.7, 9, 5, 0.1], [2.6, -6, 8, 0.075]]) {
      causPat.setTransform(new DOMMatrix().translate(T * vx * K(), T * vy * K()).scale(sc * K()));
      g.globalAlpha = al; g.fillStyle = causPat; g.fillRect(0, 0, cv.width, cv.height);
    }
    g.globalCompositeOperation = 'source-over';
    g.setTransform(S, 0, 0, S, 0, 0);
    for (const r of ripples) {
      const k0 = r.t / r.life;
      for (let j = 0; j < 3; j++) {
        const k = k0 - j * 0.13; if (k <= 0 || k >= 1) continue;
        const rad = k * r.R;
        g.globalAlpha = (1 - k) * 0.35 * r.s; g.strokeStyle = '#123c38'; g.lineWidth = 2;
        g.beginPath(); g.arc(r.x + 1.5, r.y + 2, rad, 0, TAU); g.stroke();
        g.globalAlpha = (1 - k) * 0.7 * r.s; g.strokeStyle = '#f0fffa'; g.lineWidth = 2.4 * (1 - k) + 0.6;
        g.beginPath(); g.arc(r.x, r.y, rad, 0, TAU); g.stroke();
      }
    }
    g.globalAlpha = 1;
    for (const p of pads) {
      const sz = p.spr.width / S, b = 1 + 0.015 * Math.sin(T * 0.8 + p.bob);
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.scale(b, b);
      g.drawImage(p.spr, -sz / 2, -sz / 2, sz, sz); g.restore();
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < 13) return;                    // <=~75 fps: every vsync at 60Hz, every 2nd at 144Hz
    const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
    update(dt); draw();
  }

  // ---- events --------------------------------------------------------------
  function onMove(e) { ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = T; }
  function onDown(e) {
    if (!styleEl || styleEl.disabled) return;
    const x = e.clientX, y = e.clientY;
    ripples.push({ x, y, t: 0, life: 1.7, R: 170, s: 1 });
    for (const f of fish) {
      const h = f.sp[0], dd = Math.hypot(h[0] - x, h[1] - y);
      if (dd < 170) { f.flee = rnd(1.2, 2); f.fleeA = Math.atan2(h[1] - y, h[0] - x) + rnd(-0.4, 0.4); f.lure = null; }
      else if (dd < 520) f.lure = { x, y, t: rnd(2.5, 4) };
    }
    for (const p of pads) {
      const ex = p.x - x, ey = p.y - y, dd = Math.hypot(ex, ey) || 1;
      if (dd < 260) { const k = 40 * (1 - dd / 260); p.vx += (ex / dd) * k; p.vy += (ey / dd) * k; p.va += rnd(-0.3, 0.3); }
    }
  }
  function resize() {
    const ow = W || innerWidth, oh = H || innerHeight;
    W = innerWidth; H = innerHeight; S = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(W * S)); cv.height = Math.max(1, Math.round(H * S));
    bed = makeBed(cv.width, cv.height);
    if (causPat) draw();
    for (const p of pads) { p.x *= W / ow; p.y *= H / oh; }
  }

  // Opaque wrappers under the glass hide the pond; app re-renders -> re-check.
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
    cv = document.createElement('canvas'); cv.id = 'cs-pond'; backdrop.appendChild(cv);
    document.body.prepend(backdrop);
    g = cv.getContext('2d', { alpha: false });
    resize();
    causPat = g.createPattern(makeCaustics(), 'repeat');
    const count = W * H > 1.6e6 ? 8 : 7;
    for (let i = 0; i < count; i++) fish.push(makeFish(i));
    fish.sort((a, b) => a.depth - b.depth);
    makePads();
    clearUnder(); clearTimer = setInterval(clearUnder, 2000);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('resize', resize);
    update(0.033); draw(); start();
    window.__claudeSkinStep = (n = 1) => { for (let i = 0; i < n; i++) { T += 1 / 30; update(1 / 30); } draw(); return cv.toDataURL("image/png"); };   // debug: advance + snapshot (works while window hidden)
    window.__claudeSkinFish = () => fish.map((f) => {   // debug: head pos, heading, worst joint bend
      let worst = 0;
      for (let k = 2; k < f.n; k++) { const a1 = Math.atan2(f.sp[k-1][1] - f.sp[k-2][1], f.sp[k-1][0] - f.sp[k-2][0]), a2 = Math.atan2(f.sp[k][1] - f.sp[k-1][1], f.sp[k][0] - f.sp[k-1][0]); worst = Math.max(worst, Math.abs(wrapA(a2 - a1))); }
      return [Math.round(f.sp[0][0]), Math.round(f.sp[0][1]), +f.a.toFixed(2), +worst.toFixed(2)];
    });
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
    clearInterval(clearTimer); stop(); clearTimeout(toastT); document.documentElement.style.removeProperty('--cs-a');
    for (const el of document.querySelectorAll('[id^="cs-"]')) el.remove();
    for (const el of document.querySelectorAll('[data-cs-clear]')) el.removeAttribute('data-cs-clear');
    window.__claudeSkin = false; window.__claudeSkinState = 'off'; delete window.__claudeSkinStep; delete window.__claudeSkinFish;
  };

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();
