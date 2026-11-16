// ClaudeSkin theme "Night City": Wallpaper Engine workshop scene 2341692415 re-rendered in WebGL behind glass.
// Light + dark mode (dark glass in dark mode, frosted light glass in light mode).
// Art + music are NOT in this file: `node we-extract.mjs 2341692415 nightcity` unpacks them into assets/ and
// music/ (gitignored, belong to the wallpaper author); inject.mjs hands them over as base64. No network, no storage
// besides the music volume, never reads messages.
// Port of the scene's visible graph (audiovisualizer property = 0, its saved state):
//   City1 layer : pulse (red->yellow antenna lights, masked) -> shine (bright windows cast a 4-way star, noise-flickered,
//                 5 passes) -> scroll x 0.1 (= 0.01 uv/s, wraps)
//   Citylow x2  : foreground skyline strip at the bottom, scroll x 0.2 (= 0.04 uv/s), top edge faded by opacity mask
//   clear colour 0.7 grey under everything. Scene is 1920x1080, fitted to the window as "cover".
// @assets City1 Citylow pulse_mask_ee0d9bbc6d0516b8583c8fb3e841485c0b7ec4e8 opacity_mask_681d95af21112ea41fc4cd51aa49d9c553ef1173
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };
  // Audit worst case under the glass: dark mode = brightest pixel (output capped at CAP_DARK), light mode = black sky.
  const CAP_DARK = 0.7;
  const BASE = { dark: [179, 172, 150], light: [6, 5, 10] };

  const Q = ':root[data-cs-n]';
  const D = `${Q}[data-cs-dark]`, L = `${Q}:not([data-cs-dark])`;
  const css = `
${D}, ${D} .cds-root {   /* app redefines tokens on .cds-root[data-mode], root alone is not enough */
  --text-400: 40 8% 83% !important;
  --text-500: 40 8% 83% !important;
  --cds-text-secondary: #ffffffcc !important;
  --cds-text-stays-secondary: #ffffffcc !important;
  --cds-text-muted: #ffffffb8 !important;
  --cds-border: rgba(255, 255, 255, 0.10) !important;
  --cds-border-line: rgba(255, 255, 255, 0.12) !important;
  --cds-surface-0: rgba(10, 7, 14, 0.34) !important;
  --cds-surface-1: rgba(10, 7, 14, 0.34) !important;
  --cds-surface-2: rgba(14, 10, 19, 0.58) !important;
  --cds-surface-3: rgba(18, 13, 24, 0.88) !important;
  --cds-surface-popover: rgba(18, 13, 24, 0.97) !important;
}
${L}, ${L} .cds-root {
  --text-000: 270 14% 7% !important;
  --text-100: 270 12% 10% !important;
  --text-200: 270 8% 18% !important;
  --text-300: 270 8% 18% !important;
  --text-400: 270 7% 23% !important;
  --text-500: 270 7% 23% !important;
  --cds-text-primary: #141118 !important;
  --cds-text-secondary: #2b2731 !important;
  --cds-text-stays-secondary: #2b2731 !important;
  --cds-text-muted: #37323d !important;
  --border-100: 275 20% 22% !important;
  --border-200: 275 20% 22% !important;
  --border-300: 275 20% 22% !important;
  --border-400: 275 20% 22% !important;
  --cds-border: rgba(50, 30, 70, 0.15) !important;
  --cds-border-line: rgba(50, 30, 70, 0.17) !important;
  --cds-surface-0: rgba(251, 248, 245, 0.36) !important;
  --cds-surface-1: rgba(251, 248, 245, 0.36) !important;
  --cds-surface-2: rgba(252, 250, 247, 0.56) !important;
  --cds-surface-3: rgba(253, 251, 249, 0.88) !important;
  --cds-surface-popover: rgba(253, 251, 249, 0.96) !important;
}
${D} { --cs-g: 9, 7, 14; --cs-a: var(--cs-ad, 0.55); --cs-edge: rgba(255, 255, 255, 0.07); --cs-rim: rgba(255, 170, 70, 0.10); --cs-sh: rgba(0, 0, 0, 0.55); }
${L} { --cs-g: 250, 247, 243; --cs-a: var(--cs-al, 0.78); --cs-edge: rgba(255, 255, 255, 0.75); --cs-rim: rgba(255, 255, 255, 0.35); --cs-sh: rgba(20, 8, 30, 0.35); }
${Q} { background: #0b0810 !important; }
${Q} body { background: transparent !important; }
${Q} body > div.grid,
${Q} .dframe-content,
${Q} .dframe-nav-scroll,
${Q} div.pointer-events-none.absolute.inset-0.bg-surface-1,
${Q} [class*="bg-[var(--epitaxy-transc"],
${Q} [data-cs-clear] { background: transparent !important; }
/* no backdrop-filter: blurring a live canvas every frame costs ~100 ms hitches */
${Q} .dframe-sidebar {
  background: rgba(var(--cs-g), calc(var(--cs-a) + 0.12)) !important;
  box-shadow: inset 0 1px 0 var(--cs-edge), inset -1px 0 0 var(--cs-rim), 0 10px 40px var(--cs-sh);
}
${Q} .tiles-shell {
  background: rgba(var(--cs-g), var(--cs-a)) !important;
  border-radius: 18px;
  box-shadow: inset 0 1px 0 var(--cs-edge), inset 0 0 0 1px var(--cs-rim), 0 10px 50px var(--cs-sh);
}
${D} .epitaxy-code-card { background: rgba(14, 10, 19, 0.84) !important; box-shadow: inset 0 1px 0 var(--cs-edge); }
${L} .epitaxy-code-card { background: rgba(253, 251, 249, 0.86) !important; box-shadow: inset 0 1px 0 var(--cs-edge); }
${L} .prose-link { color: #3a1d7a !important; }
${Q} .text-muted-as-secondary { color: var(--cds-text-secondary) !important; }
${Q} ::selection { background: rgba(255, 176, 60, 0.32); }
${Q} textarea:focus-visible, ${Q} [contenteditable="true"]:focus-visible { outline-color: #e8902a !important; }
${Q} .dframe-sidebar a, ${Q} .dframe-sidebar button { transition: background-color .18s ease, transform .18s ease; }
${D} .dframe-sidebar a:hover, ${D} .dframe-sidebar button:hover { background-color: rgba(255, 180, 80, 0.10) !important; transform: translateX(2px); }
${L} .dframe-sidebar a:hover, ${L} .dframe-sidebar button:hover { background-color: rgba(255, 255, 255, 0.6) !important; transform: translateX(2px); }
#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: #0b0810; }
#cs-city { display: block; width: 100%; height: 100%; }
#cs-toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 2147483000; pointer-events: none;
  padding: 6px 14px; border-radius: 999px; background: rgba(20, 14, 26, 0.88); color: #fbf3e6; font: 500 13px system-ui, sans-serif;
  opacity: 0; transition: opacity .25s ease; }
#cs-toast.show { opacity: 1; }
`;

  // ---- shaders ---------------------------------------------------------------
  // Convention: framebuffer row 0 = image top (textures uploaded unflipped), only the final pass flips to screen.
  const VERT = 'attribute vec2 a; varying vec2 v; void main(){ v = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }';
  const H = 'precision highp float; varying vec2 v;\n';
  const FS = {
    // effects/pulse: tintlow 1 0 0, tinthigh 1 1 0, speed 3, power 4, blend 9 (add), masked
    pulse: H + `uniform sampler2D t0, t1; uniform float uT;
void main(){
  vec4 s = texture2D(t0, v);
  float p = pow(smoothstep(0., 1., sin(uT * 3.) * .5 + .5), 4.);
  vec3 a = s.rgb * vec3(1., 0., 0.) + s.rgb * vec3(1., 1., 0.) * p;
  gl_FragColor = vec4(mix(s.rgb, a, texture2D(t1, v).r), s.a);
}`,
    // effects/shine pass 1 (shine_downsample2): threshold 0.5, NOISE=1 clouds, noise amount .4 speed .15 scale 10
    down: H + `uniform sampler2D t0, t1; uniform float uT;
void main(){
  vec4 s = texture2D(t0, v);
  vec2 q = vec2(v.y, -v.x) * .633 + vec2(-uT, uT) * .075;
  float n = texture2D(t1, (v + uT * .15) * 10.).r * texture2D(t1, q.yx * 10.).r;
  float na = mix(s.a, s.a * n, .4);
  vec3 c = s.rgb * s.a;
  vec4 o = vec4(c, 1.) * step(.5, dot(vec3(.11, .59, .3), c));
  gl_FragColor = vec4(o.rgb, o.a * na);
}`,
    // pass 2 (shine_cast): EDGES 4 (left/right/up/down), 30 samples, length .1, intensity .84
    cast: H + `uniform sampler2D t0; uniform float uRatio;
vec4 gather(vec2 tc, vec2 dir){
  float dist = length(dir); dir /= dist; dist *= .1;
  tc += dir * dist; vec2 st = dir * dist / 29.;
  vec4 acc = vec4(0.);
  for (int i = 0; i < 30; i++) { acc += texture2D(t0, tc) * (float(i) / 29.); tc -= st; }
  return acc;
}
void main(){
  vec2 d1 = vec2(.5, 0.), d2 = vec2(0., .5 * uRatio);
  vec4 acc = gather(v, d1) + gather(v, -d1) + gather(v, d2) + gather(v, -d2);
  gl_FragColor = vec4(.084 * acc.rgb, clamp(.084 * acc.a, 0., 1.));
}`,
    // pass 3/4 (shine_gaussian, 13 taps)
    blur: H + `uniform sampler2D t0; uniform vec2 uD;
void main(){
  vec4 acc = vec4(0.); float ws = 0.;
  for (int i = -6; i <= 6; i++) { float w = exp(-float(i * i) / 12.5); acc += texture2D(t0, v + uD * float(i)) * w; ws += w; }
  gl_FragColor = acc / ws;
}`,
    // pass 5 (shine_combine): blend 9 (add) with ray alpha as opacity
    combine: H + `uniform sampler2D t0, t1;
void main(){
  vec4 r = texture2D(t0, v), p = texture2D(t1, v);
  gl_FragColor = vec4(p.rgb + r.rgb * r.a, clamp(p.a + r.a, 0., 1.));
}`,
    // scene composite straight to the canvas: clear .7, City1 scrolled, two Citylow strips (scroll + opacity mask)
    final: H + `uniform sampler2D t0, t1, t2; uniform vec2 uRes; uniform vec4 uMap; uniform float uT, uCap;
vec3 low(vec3 col, vec2 s, vec2 mn){
  vec2 l = (s - mn) / vec2(1280., 340.);
  if (l.x < 0. || l.x > 1. || l.y < 0. || l.y > 1.) return col;
  vec4 t = texture2D(t1, vec2(fract(l.x + uT * .04), l.y));
  t.a *= texture2D(t2, l).r;
  return mix(col, t.rgb, t.a);
}
void main(){
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) * uMap.xy + uMap.zw;   // scene px, y down
  vec4 c = texture2D(t0, vec2(fract(s.x / 1920. + uT * .01), clamp(s.y / 1080., 0., 1.)));
  vec3 col = mix(vec3(.7), c.rgb, c.a);
  col = low(col, s, vec2(-215.35147, 747.24554));
  col = low(col, s, vec2(1064.25745, 747.24554));
  gl_FragColor = vec4(col * uCap, 1.);
}`,
  };

  // ---- GL ----------------------------------------------------------------------
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const LW = 1920, LH = 1080;                     // layer buffers at the scene's native size
  let styleEl, backdrop, cv, gl, P = {}, F = {}, TX = {}, raf = 0, last = 0, T = 0, W = 0, Hh = 0, S = 1;
  let clearTimer = 0, busyTimer = 0, mounted = false, busy = 0, ptrT = -99, dark = false;
  const bitmaps = {};                             // decoded assets, kept to re-upload after a context loss
  const KEYS = { City1: 'city', Citylow: 'low', pulse_mask: 'pmask', opacity_mask: 'omask' };
  const ready = () => gl && TX.city && TX.low && TX.pmask && TX.omask;

  function program(src) {
    const sh = (type, s) => { const o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, src));
    gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    return { p, u: (n) => (n in u ? u[n] : (u[n] = gl.getUniformLocation(p, n))) };
  }
  function texture(w, h, src, repeat) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    if (src && !(src instanceof Uint8Array)) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, src || null);
    return t;
  }
  function fbo(w, h) { const tex = texture(w, h); const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0); return { fb, tex, w, h }; }
  // stand-in for WE's util/clouds_256: tileable 256x256 value-noise fbm
  function clouds() {
    const N = 256, px = new Uint8Array(N * N * 4), rnd = [];
    const lat = (g) => { const a = new Float32Array(g * g); for (let i = 0; i < a.length; i++) a[i] = Math.random(); return a; };
    for (let o = 0; o < 5; o++) rnd.push(lat(4 << o));
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let v = 0, amp = 0.5, tot = 0;
      for (let o = 0; o < 5; o++) {
        const g = 4 << o, fx = x / N * g, fy = y / N * g, ix = Math.floor(fx), iy = Math.floor(fy);
        let tx = fx - ix, ty = fy - iy; tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
        const at = (i, j) => rnd[o][((j + g) % g) * g + ((i + g) % g)];
        v += amp * (at(ix, iy) * (1 - tx) * (1 - ty) + at(ix + 1, iy) * tx * (1 - ty) + at(ix, iy + 1) * (1 - tx) * ty + at(ix + 1, iy + 1) * tx * ty);
        tot += amp; amp *= 0.5;
      }
      const c = Math.round(clamp((v / tot - 0.5) * 1.6 + 0.5, 0, 1) * 255), k = (y * N + x) * 4;
      px[k] = px[k + 1] = px[k + 2] = c; px[k + 3] = 255;
    }
    return px;
  }
  let cloudPx = null;
  function initGL() {
    gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
    if (!gl) return false;
    for (const k in FS) P[k] = program(FS[k]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    F = { l1: fbo(LW, LH), l2: fbo(LW, LH), h1: fbo(LW / 2, LH / 2), h2: fbo(LW / 2, LH / 2) };
    TX = { cloud: texture(256, 256, cloudPx || (cloudPx = clouds()), true) };
    for (const k in bitmaps) TX[k] = texture(0, 0, bitmaps[k]);
    return true;
  }
  function pass(name, out, texs, uni) {
    const pr = P[name];
    gl.useProgram(pr.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, out ? out.fb : null);
    gl.viewport(0, 0, out ? out.w : cv.width, out ? out.h : cv.height);
    texs.forEach((t, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(pr.u('t' + i), i); });
    for (const k in uni) { const v = uni[k], l = pr.u(k); if (typeof v === 'number') gl.uniform1f(l, v); else if (v.length === 2) gl.uniform2fv(l, v); else gl.uniform4fv(l, v); }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function draw() {
    if (!ready()) return;
    const t = T % 1200;
    pass('pulse', F.l1, [TX.city, TX.pmask], { uT: t });
    pass('down', F.h1, [F.l1.tex, TX.cloud], { uT: t });
    pass('cast', F.h2, [F.h1.tex], { uRatio: LW / LH });
    pass('blur', F.h1, [F.h2.tex], { uD: [2 / LW, 0] });
    pass('blur', F.h2, [F.h1.tex], { uD: [0, 2 / LH] });
    pass('combine', F.l2, [F.h2.tex, F.l1.tex], {});
    const k = Math.max(cv.width / LW, cv.height / LH);   // cover
    pass('final', null, [F.l2.tex, TX.low, TX.omask], {
      uRes: [cv.width, cv.height], uT: t, uCap: dark ? CAP_DARK : 1,
      uMap: [1 / k, 1 / k, -(cv.width - LW * k) / 2 / k, -(cv.height - LH * k) / 2 / k],
    });
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const el = now - last;
    if (el < (busy || T - ptrT < 3 ? 31 : 48)) return;   // ~30 fps while something happens, ~20 fps otherwise
    T += Math.min(0.1, el / 1000); last = now;
    draw();
  }
  function resize() {
    W = innerWidth; Hh = innerHeight; S = Math.min(1.5, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(W * S)); cv.height = Math.max(1, Math.round(Hh * S));
    draw();
  }

  // ---- assets (inject.mjs -> __claudeSkinAssets.add) ----
  window.__claudeSkinAssets = {
    async add(name, b64, mime) {
      const key = name.startsWith('Citylow') ? 'Citylow' : Object.keys(KEYS).find((p) => name.startsWith(p));
      if (!key) return 0;
      const bin = atob(b64), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const bmp = await createImageBitmap(new Blob([u8], { type: mime }), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
      const k = KEYS[key];
      bitmaps[k] = bmp;
      if (gl) { TX[k] = texture(0, 0, bmp); draw(); }
      return 1;
    },
    state: () => Object.keys(bitmaps),
  };

  // ---- glue ----
  const px1 = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  px1.canvas.width = px1.canvas.height = 1;
  function alphaOf(c) { px1.clearRect(0, 0, 1, 1); px1.fillStyle = 'rgba(0,0,0,0)'; px1.fillStyle = c; px1.fillRect(0, 0, 1, 1); return px1.getImageData(0, 0, 1, 1).data[3] / 255; }
  function clearUnder() {
    for (const sel of ['.tiles-shell', '.dframe-sidebar']) {
      const el = document.querySelector(sel);
      for (let p = el?.parentElement; p && p !== document.body; p = p.parentElement) {
        if (!p.hasAttribute('data-cs-clear') && alphaOf(getComputedStyle(p).backgroundColor) > 0.85) p.setAttribute('data-cs-clear', '');
      }
    }
  }
  const BUSY_SEL = 'button[aria-label*="Stop" i], button[aria-label*="Dừng" i], button[aria-label*="Interrupt" i]';
  const checkBusy = () => { busy = document.querySelector(BUSY_SEL) ? 1 : 0; };
  const onMove = () => { ptrT = T; };
  function setMode() {
    dark = isDark();
    document.documentElement.toggleAttribute('data-cs-dark', dark);
    window.__claudeSkinBase = dark ? BASE.dark : BASE.light;
    draw();
  }
  function start() { if (!raf && gl) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  const onLost = (e) => { e.preventDefault(); stop(); };
  const onRestored = () => { try { if (initGL()) { resize(); start(); } } catch { /* stays plain */ } };

  function mount() {
    backdrop = document.createElement('div'); backdrop.id = 'cs-backdrop';
    cv = document.createElement('canvas'); cv.id = 'cs-city'; backdrop.appendChild(cv);
    try { if (!initGL()) throw new Error('no webgl'); }
    catch (err) { window.__claudeSkinState = 'no-webgl'; window.__claudeSkinError = String(err && err.message || err); gl = null; return; }
    styleEl = document.createElement('style'); styleEl.id = 'cs-style'; styleEl.textContent = css;
    document.head.appendChild(styleEl);
    document.body.prepend(backdrop);
    document.documentElement.setAttribute('data-cs-n', '');
    mounted = true; setMode();
    cv.addEventListener('webglcontextlost', onLost); cv.addEventListener('webglcontextrestored', onRestored);
    resize();
    clearUnder(); clearTimer = setInterval(clearUnder, 2000);
    checkBusy(); busyTimer = setInterval(checkBusy, 500);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('resize', resize);
    start();
    window.__claudeSkinStep = (n = 1) => { for (let i = 0; i < n; i++) T += 1 / 30; draw(); return cv.toDataURL('image/png'); };
    window.__claudeSkinPerf = (n = 20) => { const b = new Uint8Array(4), t0 = performance.now(); for (let i = 0; i < n; i++) { draw(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b); } return { ms: (performance.now() - t0) / n, w: cv.width, h: cv.height, tex: Object.keys(bitmaps) }; };
    window.__claudeSkinState = 'on';
  }
  const modeObs = new MutationObserver(setMode);
  const mq = matchMedia('(prefers-color-scheme: dark)');

  const glass = { d: 0.55, l: 0.78 };
  let toastT = 0;
  function toast(text) {
    let t = document.getElementById('cs-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cs-toast'; document.body.appendChild(t); }
    t.textContent = text; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1100);
  }
  function stepGlass(d) {   // separate memory per mode: light glass must stay thick enough for dark text
    const k = dark ? 'd' : 'l';
    glass[k] = Math.round(clamp(glass[k] + d, dark ? 0.3 : 0.5, 0.95) * 100) / 100;
    document.documentElement.style.setProperty(dark ? '--cs-ad' : '--cs-al', String(glass[k]));
    toast(`Glass ${Math.round(glass[k] * 100)}%`);
  }

  // ---- music (same player as quasar; files from music/nightcity/) ----
  const tracks = [];
  let audio = null, actx = null, gainN = null, srcN = null, ti = 0, useWA = false, paused = false, vol = 0.4, muted = false;
  try { const s = JSON.parse(localStorage.getItem('cs-nightcity-music') || '{}'); if (s.vol >= 0 && s.vol <= 1) vol = s.vol; muted = !!s.muted; } catch { /* defaults */ }
  const level = () => (muted ? 0 : vol * vol);
  function saveMusic() { try { localStorage.setItem('cs-nightcity-music', JSON.stringify({ vol, muted })); } catch { /* not persisted */ } }
  function applyLevel() { if (audio) audio.volume = level(); if (gainN) gainN.gain.value = level(); }
  function onGesture() { removeEventListener('pointerdown', onGesture, true); if (!paused) { audio?.play().catch(() => {}); actx?.resume().catch(() => {}); } }
  function stopTrack() {
    if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; }
    if (srcN) { srcN.onended = null; try { srcN.stop(); } catch { /* never started */ } srcN.disconnect(); srcN = null; }
  }
  function playTrack(i) {
    if (!tracks.length) return;
    stopTrack();
    ti = ((i % tracks.length) + tracks.length) % tracks.length;
    const tr = tracks[ti], loop = tracks.length === 1;
    if (!useWA) {
      tr.url = tr.url || URL.createObjectURL(new Blob([tr.buf], { type: tr.mime }));
      const a = audio = new Audio(); a.loop = loop; a.volume = level();
      a.onended = () => playTrack(ti + 1);
      a.onerror = () => { if (audio === a) { useWA = true; playTrack(ti); } };
      a.src = tr.url;
      if (!paused) a.play().catch((err) => { if (err && err.name === 'NotAllowedError') addEventListener('pointerdown', onGesture, true); });
    } else {
      if (!actx) { actx = new AudioContext(); gainN = actx.createGain(); gainN.connect(actx.destination); }
      gainN.gain.value = level();
      const cx = actx;
      cx.decodeAudioData(tr.buf.slice(0)).then((pcm) => {
        if (actx !== cx || tracks[ti] !== tr || srcN || audio) return;
        const n = srcN = cx.createBufferSource(); n.buffer = pcm; n.loop = loop; n.connect(gainN);
        n.onended = () => { if (srcN === n) playTrack(ti + 1); };
        n.start();
        if (paused) cx.suspend(); else if (cx.state !== 'running') { cx.resume().catch(() => {}); addEventListener('pointerdown', onGesture, true); }
      }).catch(() => toast(`Music: cannot decode ${tr.name}`));
    }
    if (tracks.length > 1 && !paused) toast(`♪ ${tr.name}`);
  }
  function musicPause() { paused = true; audio?.pause(); if (actx && actx.state === 'running') actx.suspend(); }
  function musicResume() { paused = false; audio?.play().catch(() => {}); actx?.resume().catch(() => {}); }
  function musicKill() {
    stopTrack(); removeEventListener('pointerdown', onGesture, true);
    for (const tr of tracks) if (tr.url) URL.revokeObjectURL(tr.url);
    tracks.length = 0; actx?.close().catch(() => {}); actx = gainN = null;
  }
  window.__claudeSkinMusic = {
    add(b64, mime, name) {
      const bin = atob(b64), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      tracks.push({ name, mime, buf: u8.buffer, url: null });
      if (tracks.length === 1) { paused = !mounted || styleEl.disabled; playTrack(0); }
      else { if (audio) audio.loop = false; if (srcN) srcN.loop = false; }
      return tracks.length;
    },
    state: () => ({ tracks: tracks.map((t) => t.name), i: ti, mode: useWA ? 'webaudio' : 'audio', paused, vol, muted,
      playing: audio ? !audio.paused : !!(srcN && actx.state === 'running'), t: +(audio ? audio.currentTime : actx ? actx.currentTime : 0).toFixed(2) }),
  };

  const onKey = (e) => {   // Ctrl+Alt+Up/Down glass, Ctrl+Alt+G on/off; music: Ctrl+Alt+M mute, [ ] volume, N next
    if (!mounted || !e.ctrlKey || !e.altKey) return;
    if ((e.code === 'ArrowUp' || e.code === 'ArrowDown') && !styleEl.disabled) { e.preventDefault(); stepGlass(e.code === 'ArrowUp' ? 0.05 : -0.05); return; }
    if (tracks.length && !styleEl.disabled && (e.code === 'KeyM' || e.code === 'BracketLeft' || e.code === 'BracketRight' || e.code === 'KeyN')) {
      e.preventDefault();
      if (e.code === 'KeyN') { playTrack(ti + 1); if (tracks.length === 1) toast(`♪ ${tracks[0].name}`); return; }
      if (e.code === 'KeyM') muted = !muted;
      else { muted = false; vol = Math.round(clamp(vol + (e.code === 'BracketRight' ? 0.1 : -0.1), 0, 1) * 10) / 10; }
      applyLevel(); saveMusic(); toast(muted ? 'Music muted' : `Music ${Math.round(vol * 100)}%`);
      return;
    }
    if (e.code === 'KeyG') {
      styleEl.disabled = !styleEl.disabled;
      backdrop.style.display = styleEl.disabled ? 'none' : '';
      document.documentElement.toggleAttribute('data-cs-n', !styleEl.disabled);
      if (styleEl.disabled) { stop(); musicPause(); } else { start(); musicResume(); }
    }
  };
  addEventListener('keydown', onKey, true);
  window.__claudeSkinCleanup = () => {
    removeEventListener('keydown', onKey, true);
    modeObs.disconnect(); mq.removeEventListener('change', setMode);
    musicKill(); delete window.__claudeSkinMusic; delete window.__claudeSkinAssets;
    if (mounted) {
      mounted = false; stop();
      clearInterval(clearTimer); clearInterval(busyTimer);
      removeEventListener('pointermove', onMove); removeEventListener('resize', resize);
      gl?.getExtension('WEBGL_lose_context')?.loseContext(); gl = null;
      styleEl.remove(); backdrop.remove();
    }
    for (const b of Object.values(bitmaps)) b.close?.();
    clearTimeout(toastT);
    const de = document.documentElement;
    de.removeAttribute('data-cs-n'); de.removeAttribute('data-cs-dark');
    de.style.removeProperty('--cs-ad'); de.style.removeProperty('--cs-al');
    for (const el of document.querySelectorAll('[data-cs-clear]')) el.removeAttribute('data-cs-clear');
    for (const el of document.querySelectorAll('[id^="cs-"]')) el.remove();
    delete window.__claudeSkinStep; delete window.__claudeSkinPerf;
    window.__claudeSkin = false; window.__claudeSkinState = 'off';
  };

  const boot = () => { modeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] }); mq.addEventListener('change', setMode); mount(); };
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
