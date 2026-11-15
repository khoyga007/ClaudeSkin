// ClaudeSkin theme "Cyber": light sci-fi HUD (Futura, ice blueprint grid, cyan + signal orange).
// Reticle, radar, oscilloscope, hex streams, frame brackets. Send = uplink beam, answering = NEURAL LINK
// ACTIVE + processing bar + faster instruments, done = TASK COMPLETE lock rings, click = target lock.
// Pure local code: no network, no storage, no images (everything drawn in code).
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;
  window.__claudeSkinBase = [150, 168, 176];   // cream with a shape under the glass (audit worst case)

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const C = { coral: '#ff6a1a', cobalt: '#0a8fb0', mustard: '#ffb000', ink: '#12202c', cream: '#eaf1f4' };
  const EDGE = 'rgba(255, 255, 255, 0.75)';
  const SHADOW = 'rgba(16, 40, 56, 0.12)';
  const css = `
:root:not([data-mode="dark"]) {
  --text-000: 200 8% 8% !important;
  --text-100: 200 8% 11% !important;
  --text-200: 200 6% 19% !important;
  --text-300: 200 6% 19% !important;
  --text-400: 200 5% 24% !important;
  --text-500: 200 5% 24% !important;
  --cds-text-primary: #101b24 !important;
  --cds-text-secondary: #26343e !important;
  --cds-text-stays-secondary: #26343e !important;
  --cds-text-muted: #2f3d47 !important;
  --border-100: 200 10% 20% !important;
  --border-200: 200 10% 20% !important;
  --border-300: 200 10% 20% !important;
  --border-400: 200 10% 20% !important;
  --cds-border: rgba(16, 40, 56, 0.13) !important;
  --cds-border-line: rgba(16, 40, 56, 0.15) !important;
  --cds-surface-0: rgba(246, 251, 253, 0.4) !important;
  --cds-surface-1: rgba(246, 251, 253, 0.4) !important;
  --cds-surface-2: rgba(246, 251, 253, 0.6) !important;
  --cds-surface-3: rgba(249, 252, 254, 0.88) !important;
  --cds-surface-popover: rgba(249, 252, 254, 0.96) !important;
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
  background: rgba(244, 250, 252, calc(var(--cs-a) + 0.12)) !important;
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px rgba(255,255,255,0.4), 0 10px 40px ${SHADOW};
}
:root:not([data-mode="dark"]) .tiles-shell {
  background: rgba(246, 251, 253, var(--cs-a)) !important;
  border-radius: 18px;
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px rgba(255,255,255,0.45), 0 10px 40px ${SHADOW};
}
:root:not([data-mode="dark"]) .epitaxy-code-card {
  background: rgba(249, 252, 254, 0.82) !important;
  box-shadow: inset 0 1px 0 ${EDGE};
  transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease;
}
:root:not([data-mode="dark"]) .epitaxy-code-card:hover { transform: translateY(-2px); box-shadow: inset 0 1px 0 ${EDGE}, 0 8px 24px ${SHADOW}; }
:root:not([data-mode="dark"]) .prose-link { color: #0b5a75 !important; }
:root:not([data-mode="dark"]) .text-muted-as-secondary { color: var(--cds-text-secondary) !important; }
:root:not([data-mode="dark"]) ::selection { background: rgba(10, 143, 176, 0.25); }
:root:not([data-mode="dark"]) textarea:focus-visible,
:root:not([data-mode="dark"]) [contenteditable="true"]:focus-visible { outline-color: ${C.cobalt} !important; }
:root:not([data-mode="dark"]) .dframe-sidebar a, :root:not([data-mode="dark"]) .dframe-sidebar button { transition: background-color .18s ease, transform .22s cubic-bezier(.34,1.56,.64,1); }
:root:not([data-mode="dark"]) .dframe-sidebar a:hover, :root:not([data-mode="dark"]) .dframe-sidebar button:hover { background-color: rgba(255, 255, 255, 0.62) !important; transform: translateX(3px); }

:root:not([data-mode="dark"]) .tiles-shell { border-radius: 6px !important; outline: 1px solid rgba(10, 143, 176, 0.28); outline-offset: -1px; }
:root:not([data-mode="dark"]) .dframe-sidebar { box-shadow: inset -1px 0 0 rgba(10, 143, 176, 0.3), 0 10px 40px rgba(16, 40, 56, 0.1) !important; }
#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: ${C.cream}; }
:root[data-mode="dark"] #cs-backdrop { display: none; }
#cs-cyber { display: block; width: 100%; height: 100%; }
#cs-toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 2147483000; pointer-events: none;
  padding: 6px 14px; border-radius: 999px; background: rgba(16, 40, 56, 0.86); color: #fbf6ee; font: 500 13px system-ui, sans-serif;
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

  // ---- static base: ice gradient + blueprint grid with crosshair marks at major nodes -----
  const CY = '10, 143, 176', OR = '255, 106, 26', NAVY = '18, 32, 44';
  function makeBase(w, h) {
    const c = new OffscreenCanvas(w, h), b = c.getContext('2d');
    const gr = b.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4f8fa'); gr.addColorStop(1, '#e4edf1');
    b.fillStyle = gr; b.fillRect(0, 0, w, h);
    b.setTransform(S, 0, 0, S, 0, 0); b.lineWidth = 1;
    for (let x = 0; x < W; x += 24) { b.strokeStyle = `rgba(${CY}, ${x % 120 ? 0.05 : 0.11})`; b.beginPath(); b.moveTo(x + 0.5, 0); b.lineTo(x + 0.5, H); b.stroke(); }
    for (let y = 0; y < H; y += 24) { b.strokeStyle = `rgba(${CY}, ${y % 120 ? 0.05 : 0.11})`; b.beginPath(); b.moveTo(0, y + 0.5); b.lineTo(W, y + 0.5); b.stroke(); }
    b.strokeStyle = `rgba(${CY}, 0.32)`;
    for (let x = 120; x < W; x += 120) for (let y = 120; y < H; y += 120) { b.beginPath(); b.moveTo(x - 4, y + 0.5); b.lineTo(x + 5, y + 0.5); b.moveTo(x + 0.5, y - 4); b.lineTo(x + 0.5, y + 5); b.stroke(); }
    return c;
  }

  // ---- HUD pieces ----------------------------------------------------------------
  const FONT = (px, wt = 500) => `${wt} ${px}px Futura, "Century Gothic", "Trebuchet MS", "Segoe UI", sans-serif`;
  const BUSY_SEL = 'button[aria-label*="Stop" i], button[aria-label*="Dừng" i], button[aria-label*="Interrupt" i]';
  const COMPS = [];                                  // (frame() checks it; HUD has no kick loops)
  const HEX = '0123456789ABCDEF';
  const hexLine = () => Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => HEX[(Math.random() * 16) | 0]).join('')).join(' ');
  const streams = [Array.from({ length: 90 }, hexLine), Array.from({ length: 90 }, hexLine)];
  const targets = Array.from({ length: 7 }, () => ({ a: rnd(0, TAU), d: rnd(0.25, 0.92) }));
  function text(str, x, y, px, col, align = 'left', ls = 2, wt = 500) {
    g.font = FONT(px, wt); g.letterSpacing = `${ls}px`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(str, x, y); g.letterSpacing = '0px';
  }
  const accent = () => `rgba(${OR}, ${0.55 + 0.45 * busy * (0.5 + 0.5 * Math.sin(T * 6))})`;

  function reticle(cx, cy, R) {
    g.save(); g.translate(cx, cy);
    g.strokeStyle = `rgba(${CY}, 0.5)`; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
    g.save(); g.rotate(-clock * 0.18);                                  // tick ring
    for (let i = 0; i < 72; i++) { const a = (i / 72) * TAU, l = i % 6 ? 4 : 10; g.strokeStyle = `rgba(${CY}, ${i % 6 ? 0.45 : 0.8})`;
      g.beginPath(); g.moveTo(Math.cos(a) * (R + 4), Math.sin(a) * (R + 4)); g.lineTo(Math.cos(a) * (R + 4 + l), Math.sin(a) * (R + 4 + l)); g.stroke(); }
    g.restore();
    g.save(); g.rotate(clock * 0.35); g.setLineDash([R * 0.22, R * 0.09]); g.lineWidth = 2; g.strokeStyle = `rgba(${CY}, 0.7)`;
    g.beginPath(); g.arc(0, 0, R * 0.8, 0, TAU); g.stroke(); g.setLineDash([]); g.restore();
    g.save(); g.rotate(-clock * 0.6); g.lineWidth = 4; g.lineCap = 'butt';                   // three heavy arcs, one orange
    for (let i = 0; i < 3; i++) { g.strokeStyle = i ? `rgba(${NAVY}, 0.55)` : accent(); g.beginPath(); g.arc(0, 0, R * 0.58, (i / 3) * TAU, (i / 3) * TAU + 1.1); g.stroke(); }
    g.restore();
    g.strokeStyle = `rgba(${NAVY}, 0.5)`; g.lineWidth = 1; g.beginPath();                    // crosshair with centre gap
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.moveTo(dx * R * 0.18, dy * R * 0.18); g.lineTo(dx * R * 0.45, dy * R * 0.45); }
    g.stroke();
    g.save(); g.rotate(clock * 1.2); g.strokeStyle = accent(); g.lineWidth = 1.5; g.beginPath();
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU - Math.PI / 2; g.lineTo(Math.cos(a) * R * 0.1, Math.sin(a) * R * 0.1); } g.closePath(); g.stroke(); g.restore();
    g.restore();
    const deg = ((clock * 20.6) % 360).toFixed(1).padStart(5, '0');
    text(`SCAN ${deg}°`, cx - R - 18, cy - R * 0.55, 10, `rgba(${NAVY}, 0.7)`, 'right');
    text(`RNG ${(1240 + Math.sin(clock * 0.7) * 80).toFixed(0)} KM`, cx - R - 18, cy - R * 0.55 + 14, 10, `rgba(${CY}, 0.85)`, 'right');
  }
  function radar(cx, cy, R) {
    g.save(); g.translate(cx, cy);
    g.strokeStyle = `rgba(${CY}, 0.35)`; g.lineWidth = 1;
    for (const k of [1, 0.66, 0.33]) { g.beginPath(); g.arc(0, 0, R * k, 0, TAU); g.stroke(); }
    g.beginPath(); g.moveTo(-R, 0); g.lineTo(R, 0); g.moveTo(0, -R); g.lineTo(0, R); g.stroke();
    const sw = clock * 1.3;
    for (let i = 0; i < 18; i++) {                                         // fading wedge trailing the sweep
      g.fillStyle = `rgba(${CY}, ${0.16 * (1 - i / 18)})`; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, sw - (i + 1) * 0.05, sw - i * 0.05); g.closePath(); g.fill();
    }
    g.strokeStyle = `rgba(${CY}, 0.9)`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(sw) * R, Math.sin(sw) * R); g.stroke();
    for (const t of targets) {                                             // blips glow when the sweep passes, then fade
      const diff = (((sw - t.a) % TAU) + TAU) % TAU, al = Math.max(0, 1 - diff / (TAU * 0.75));
      if (al <= 0) continue;
      const x = Math.cos(t.a) * t.d * R, y = Math.sin(t.a) * t.d * R;
      g.fillStyle = `rgba(${OR}, ${al})`; g.beginPath(); g.arc(x, y, 3.2, 0, TAU); g.fill();
      g.strokeStyle = `rgba(${OR}, ${al * 0.5})`; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 3.2 + (1 - al) * 9, 0, TAU); g.stroke();
    }
    g.restore();
    text('RADAR // SECTOR 7G', cx, cy + R + 18, 10, `rgba(${NAVY}, 0.7)`, 'center', 3);
  }
  function waveform(x0, y0, w, h) {
    const amp = 0.3 + 0.65 * busy;
    g.strokeStyle = `rgba(${CY}, 0.35)`; g.lineWidth = 1; g.strokeRect(x0 + 0.5, y0 + 0.5, w, h);
    g.beginPath(); g.moveTo(x0, y0 + h / 2 + 0.5); g.lineTo(x0 + w, y0 + h / 2 + 0.5); g.setLineDash([2, 4]); g.stroke(); g.setLineDash([]);
    g.strokeStyle = `rgba(${CY}, 0.95)`; g.lineWidth = 1.6; g.beginPath();
    for (let i = 0; i <= 90; i++) {
      const v = 0.6 * Math.sin(i * 0.22 + clock * 3) + 0.3 * Math.sin(i * 0.61 - clock * 5) + 0.15 * Math.sin(i * 1.7 + clock * 9);
      const x = x0 + (i / 90) * w, y = y0 + h / 2 + v * amp * h * 0.45; i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    text(`SIGNAL α-7   ${(48 + amp * 40).toFixed(1)} Hz`, x0, y0 - 10, 10, `rgba(${NAVY}, 0.7)`);
  }
  function stream(col, x, align, speed, yMax) {
    const lines = streams[col], lh = 15, off = (clock * speed) % lh, first = Math.floor(clock * speed / lh);
    if (Math.random() < 0.3) lines[(Math.random() * lines.length) | 0] = hexLine();
    for (let i = 0; i * lh < H + lh; i++) {
      const y = i * lh - off + 104; if (y > yMax) break;
      const hot = (first + i) % 23 === 0;
      text(lines[(first + i) % lines.length], x, y, 9.5, hot ? `rgba(${OR}, 0.85)` : `rgba(${CY}, 0.42)`, align, 1);
    }
  }
  function corners() {
    const m = 14, L = 46, col = busy > 0.05 ? accent() : `rgba(${CY}, 0.8)`;
    g.strokeStyle = col; g.lineWidth = 2;
    for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
      g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke();
      g.fillStyle = col; g.fillRect(x + sx * (L + 6) - (sx < 0 ? 6 : 0), y - (sy < 0 ? 2 : 0), 6, 2);
    }
    const now = new Date(), hh = String(now.getHours()).padStart(2, '0'), mm = String(now.getMinutes()).padStart(2, '0'), ss = String(now.getSeconds()).padStart(2, '0');
    text('SYS.ONLINE', m + 8, m + 58, 9.5, `rgba(${NAVY}, 0.65)`, 'left', 3);
    text(`T ${hh}:${mm}:${ss}`, W - m - 8, m + 58, 9.5, `rgba(${NAVY}, 0.65)`, 'right', 3);
    text('NODE 07 // CLAUDE', m + 8, H - m - 58, 9.5, `rgba(${NAVY}, 0.65)`, 'left', 3);
    text(`${busy > 0.5 ? 'LOAD' : 'IDLE'} ${(busy * 87 + 4).toFixed(0).padStart(2, '0')}%`, W - m - 8, H - m - 58, 9.5, `rgba(${NAVY}, 0.65)`, 'right', 3);
  }
  function header() {
    text(`◇  NEURAL LINK · ${busy > 0.5 ? 'ACTIVE' : 'STANDBY'}  ◇`, W / 2, 18, 10, busy > 0.5 ? accent() : `rgba(${NAVY}, 0.6)`, 'center', 5);
    if (busy > 0.02) {                                                     // segmented "processing" bar with a running head
      const n = 28, sw = 9, gap = 3, x0 = W / 2 - (n * (sw + gap)) / 2, head = (trainT * 16) % (n + 6);
      for (let i = 0; i < n; i++) {
        const d = head - i, lit = d >= 0 && d < 6 ? 1 - d / 6 : 0;
        g.fillStyle = lit > 0 ? `rgba(${OR}, ${busy * (0.25 + 0.75 * lit)})` : `rgba(${CY}, ${busy * 0.2})`;
        g.fillRect(x0 + i * (sw + gap), 30, sw, 4);
      }
    }
  }

  function spawnBurst(x, y) { bursts.push({ kind: 'target', x, y, t: 0, life: 1.5 }); if (bursts.length > 12) bursts.shift(); }

  function update(dt) {
    if (busyTarget !== wasBusy) {
      if (busyTarget) wipe = { t: 0 };                                                     // sent: uplink beam sweeps up
      else bursts.push({ kind: 'lock', x: W / 2, y: H * 0.45, t: 0, life: 2 });           // done: task-complete lock rings
      wasBusy = busyTarget;
    }
    busy += ((busyTarget ? 1 : 0) - busy) * Math.min(1, dt * 3);
    clock += dt * (reduced ? 0.35 : 1) * (1 + 1.4 * busy); trainT += dt;
    if (wipe && (wipe.t += dt) > 1.1) wipe = null;
    for (let i = bursts.length - 1; i >= 0; i--) if ((bursts[i].t += dt) > bursts[i].life) bursts.splice(i, 1);
  }

  function draw() {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    g.drawImage(base, 0, 0);
    g.setTransform(S, 0, 0, S, 0, 0);
    const U = clamp(Math.min(W / 1700, H / 950), 0.6, 1.25);
    const sy = frac(clock / 9) * H, sg = g.createLinearGradient(0, sy - 70, 0, sy);   // slow scan line
    sg.addColorStop(0, `rgba(${CY}, 0)`); sg.addColorStop(1, `rgba(${CY}, 0.07)`); g.fillStyle = sg; g.fillRect(0, sy - 70, W, 70);
    g.fillStyle = `rgba(${CY}, 0.22)`; g.fillRect(0, sy, W, 1);
    stream(0, 34, 'left', 9, H * 0.84 - 34); stream(1, W - 34, 'right', 6, H - 104);
    reticle(W * 0.83, H * 0.22, 82 * U);
    radar(W * 0.835, H * 0.74, 74 * U);
    waveform(W * 0.025, H * 0.84, Math.min(260, W * 0.15), 56);
    corners(); header();
    if (wipe) {
      const q = Ease.io(clamp(wipe.t / 1, 0, 1)), y = H * (1 - q);
      const bg = g.createLinearGradient(0, y, 0, y + 120); bg.addColorStop(0, `rgba(${CY}, 0.18)`); bg.addColorStop(1, `rgba(${CY}, 0)`);
      g.fillStyle = bg; g.fillRect(0, y, W, 120); g.fillStyle = `rgba(${CY}, 0.8)`; g.fillRect(0, y, W, 1.5);
      text('▲  UPLINK · TRANSMITTING', W / 2, y - 12, 11, `rgba(${NAVY}, ${0.7 * Math.sin(Math.PI * q)})`, 'center', 6, 600);
    }
    for (const b of bursts) {
      const k = b.t / b.life, fade = 1 - seg(k, 0.6, 1);
      g.save(); g.globalAlpha = fade;
      if (b.kind === 'target') {                                           // click: brackets snap onto the point, coords readout
        const e = Ease.out(seg(k, 0, 0.35)), s = 60 - 42 * e, l = 9, ext = 40 * Ease.out(seg(k, 0.2, 0.5));
        g.strokeStyle = `rgba(${OR}, 1)`; g.lineWidth = 2;
        for (const [sx, sy2] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x = b.x + sx * s, y = b.y + sy2 * s; g.beginPath(); g.moveTo(x, y - sy2 * l); g.lineTo(x, y); g.lineTo(x - sx * l, y); g.stroke(); }
        g.strokeStyle = `rgba(${CY}, 0.9)`; g.lineWidth = 1; g.beginPath();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.moveTo(b.x + dx * (s + 4), b.y + dy * (s + 4)); g.lineTo(b.x + dx * (s + 4 + ext), b.y + dy * (s + 4 + ext)); }
        g.stroke();
        g.save(); g.translate(b.x, b.y); g.rotate(k * 4); g.setLineDash([5, 4]); g.strokeStyle = `rgba(${CY}, 0.8)`; g.beginPath(); g.arc(0, 0, s + 12, 0, TAU); g.stroke(); g.restore();
        if (k > 0.3) { text('LOCK', b.x + s + 12, b.y - s - 6, 10, `rgba(${OR}, 1)`, 'left', 3, 600); text(`X ${Math.round(b.x)} · Y ${Math.round(b.y)}`, b.x + s + 12, b.y - s + 8, 9.5, `rgba(${NAVY}, 0.8)`, 'left', 2); }
      } else {                                                             // done: expanding lock rings + TASK COMPLETE
        for (let i = 0; i < 3; i++) { const q = Ease.out(seg(k, i * 0.12, 0.6 + i * 0.12)); g.strokeStyle = `rgba(${CY}, ${0.5 * (1 - q)})`; g.lineWidth = 2; g.beginPath(); g.arc(b.x, b.y, 40 + q * 260, 0, TAU); g.stroke(); }
        text('TASK COMPLETE // 100%', b.x, b.y, 14, `rgba(${NAVY}, ${0.35 * Ease.out(seg(k, 0, 0.2))})`, 'center', 8, 600);
      }
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
  const BAND_CSS = `[data-engine-tree]{font-size:12px;font-variant-numeric:tabular-nums;}[data-engine-row]{align-items:center;}span[style*='opacity'],span[style*='dim-ink']{letter-spacing:.02em;}span[style*='color: rgb(70, 167, 88)']{color:#2440b8 !important;}div[style*='background-color: rgb(70, 167, 88)']{background:linear-gradient(90deg,#7d93ee,#2c4fd6) !important;}span[style*='color: rgb(245, 217, 10)']{color:#a86f08 !important;}div[style*='background-color: rgb(245, 217, 10)']{background:linear-gradient(90deg,#f0c860,#e3a823) !important;}span[style*='color: rgb(5, 162, 194)']{color:#3a3a44 !important;}div[style*='background-color: rgb(5, 162, 194)']{background:linear-gradient(90deg,#8b8b96,#26262b) !important;}span[style*='color: rgb(229, 72, 77)']{color:#c94129 !important;}div[style*='background-color: rgb(229, 72, 77)']{background:linear-gradient(90deg,#f39a86,#ec6a52) !important;}div[style*='background-color: rgba(127, 127, 127, 0.22)']{background:rgba(16, 40, 56, 0.1) !important;}div[style*='background-color: rgba(127, 127, 127, 0.75)']{background:#26262b !important;width:2px !important;}div:has(> div[style*='background-color']){height:4px !important;align-self:center;border-radius:999px;overflow:hidden;}div:has(> div[style*='background-color']) > div{height:4px !important;}`;
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
    cv = document.createElement('canvas'); cv.id = 'cs-cyber'; backdrop.appendChild(cv);
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
