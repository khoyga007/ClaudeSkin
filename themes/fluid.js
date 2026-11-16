// ClaudeSkin theme "Fluid": real-time stable-fluids simulation (Navier-Stokes on the GPU) behind glass.
// Light mode: ink spreading in water on cream paper (dye = absorbance). Dark mode: glowing neon dye on black.
// Pointer drag stirs the water, a click drops fresh ink, while Claude works a gentle plume rises from the input box,
// idle -> the water calms down and only a rare drop falls. No assets, no network, never reads messages.
// Sim step: curl -> vorticity -> divergence -> pressure (Jacobi x20) -> subtract gradient -> advect velocity -> advect dye.
// Velocity/pressure on a ~128-row grid, dye on a 512-row grid, half-float textures (WebGL1 + OES_texture_half_float).
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };
  // Audit worst case under the glass. Light: densest ink = paper * exp(-0.9) ~ 0.37. Dark: glow capped at CAP_DARK.
  const CAP_DARK = 0.88;
  const BASE = { dark: [224, 224, 224], light: [90, 92, 108] };
  const PAPER = [0.95, 0.935, 0.905], NIGHT = [0.025, 0.025, 0.045];

  const Q = ':root[data-cs-n]';
  const D = `${Q}[data-cs-dark]`, L = `${Q}:not([data-cs-dark])`;
  const css = `
${D}, ${D} .cds-root {   /* app redefines tokens on .cds-root[data-mode], root alone is not enough */
  --text-400: 220 10% 83% !important;
  --text-500: 220 10% 83% !important;
  --cds-text-secondary: #ffffffcc !important;
  --cds-text-stays-secondary: #ffffffcc !important;
  --cds-text-muted: #ffffffb8 !important;
  --cds-border: rgba(255, 255, 255, 0.10) !important;
  --cds-border-line: rgba(255, 255, 255, 0.12) !important;
  --cds-surface-0: rgba(7, 8, 14, 0.34) !important;
  --cds-surface-1: rgba(7, 8, 14, 0.34) !important;
  --cds-surface-2: rgba(10, 11, 19, 0.58) !important;
  --cds-surface-3: rgba(13, 14, 24, 0.88) !important;
  --cds-surface-popover: rgba(13, 14, 24, 0.97) !important;
}
${L}, ${L} .cds-root {
  --text-000: 225 18% 8% !important;
  --text-100: 225 16% 11% !important;
  --text-200: 225 10% 19% !important;
  --text-300: 225 10% 19% !important;
  --text-400: 225 8% 24% !important;
  --text-500: 225 8% 24% !important;
  --cds-text-primary: #10131a !important;
  --cds-text-secondary: #282c35 !important;
  --cds-text-stays-secondary: #282c35 !important;
  --cds-text-muted: #343843 !important;
  --border-100: 225 22% 24% !important;
  --border-200: 225 22% 24% !important;
  --border-300: 225 22% 24% !important;
  --border-400: 225 22% 24% !important;
  --cds-border: rgba(30, 40, 70, 0.15) !important;
  --cds-border-line: rgba(30, 40, 70, 0.17) !important;
  --cds-surface-0: rgba(250, 248, 243, 0.36) !important;
  --cds-surface-1: rgba(250, 248, 243, 0.36) !important;
  --cds-surface-2: rgba(251, 249, 245, 0.56) !important;
  --cds-surface-3: rgba(252, 251, 248, 0.88) !important;
  --cds-surface-popover: rgba(252, 251, 248, 0.96) !important;
}
${D} { --cs-g: 7, 8, 14; --cs-a: var(--cs-ad, 0.62); --cs-edge: rgba(255, 255, 255, 0.07); --cs-rim: rgba(90, 200, 255, 0.10); --cs-sh: rgba(0, 0, 0, 0.55); }
${L} { --cs-g: 250, 248, 243; --cs-a: var(--cs-al, 0.66); --cs-edge: rgba(255, 255, 255, 0.75); --cs-rim: rgba(255, 255, 255, 0.35); --cs-sh: rgba(20, 30, 60, 0.30); }
${D} { background: #06070c !important; }
${L} { background: #f2eee6 !important; }
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
${D} .epitaxy-code-card { background: rgba(10, 11, 19, 0.84) !important; box-shadow: inset 0 1px 0 var(--cs-edge); }
${L} .epitaxy-code-card { background: rgba(252, 251, 248, 0.86) !important; box-shadow: inset 0 1px 0 var(--cs-edge); }
${L} .prose-link { color: #1d3a8a !important; }
${Q} .text-muted-as-secondary { color: var(--cds-text-secondary) !important; }
${D} ::selection { background: rgba(80, 200, 255, 0.30); }
${L} ::selection { background: rgba(40, 70, 170, 0.22); }
${D} textarea:focus-visible, ${D} [contenteditable="true"]:focus-visible { outline-color: #4cc9f0 !important; }
${L} textarea:focus-visible, ${L} [contenteditable="true"]:focus-visible { outline-color: #2b4fb3 !important; }
${Q} .dframe-sidebar a, ${Q} .dframe-sidebar button { transition: background-color .18s ease, transform .18s ease; }
${D} .dframe-sidebar a:hover, ${D} .dframe-sidebar button:hover { background-color: rgba(80, 200, 255, 0.10) !important; transform: translateX(2px); }
${L} .dframe-sidebar a:hover, ${L} .dframe-sidebar button:hover { background-color: rgba(255, 255, 255, 0.6) !important; transform: translateX(2px); }
#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
#cs-fluid { display: block; width: 100%; height: 100%; }
#cs-toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 2147483000; pointer-events: none;
  padding: 6px 14px; border-radius: 999px; background: rgba(14, 16, 26, 0.88); color: #eef3fb; font: 500 13px system-ui, sans-serif;
  opacity: 0; transition: opacity .25s ease; }
#cs-toast.show { opacity: 1; }
`;

  // ---- shaders (uv y up, row 0 = bottom) ---------------------------------------
  const VERT = `precision highp float; attribute vec2 a; uniform vec2 uTx;
varying vec2 v, vL, vR, vT, vB;
void main(){ v = a * .5 + .5; vL = v - vec2(uTx.x, 0.); vR = v + vec2(uTx.x, 0.); vT = v + vec2(0., uTx.y); vB = v - vec2(0., uTx.y);
  gl_Position = vec4(a, 0., 1.); }`;
  const H = 'precision highp float; varying vec2 v, vL, vR, vT, vB;\n';
  const FS = {
    clear: H + 'uniform sampler2D t0; uniform float uK; void main(){ gl_FragColor = uK * texture2D(t0, v); }',
    splat: H + `uniform sampler2D t0; uniform float uAsp, uR; uniform vec2 uP; uniform vec4 uC;
void main(){ vec2 p = v - uP; p.x *= uAsp; gl_FragColor = vec4(texture2D(t0, v).xyz + exp(-dot(p, p) / uR) * uC.xyz, 1.); }`,
    // semi-Lagrangian advection; manual bilinear when half-float linear filtering is missing
    advect: H + `uniform sampler2D t0, t1; uniform vec2 uSrcTx; uniform float uDt, uDiss, uManual;
vec4 bil(sampler2D s, vec2 uv, vec2 tx){
  vec2 st = uv / tx - .5, i = floor(st), f = fract(st);
  vec4 a = texture2D(s, (i + vec2(.5, .5)) * tx), b = texture2D(s, (i + vec2(1.5, .5)) * tx);
  vec4 c = texture2D(s, (i + vec2(.5, 1.5)) * tx), d = texture2D(s, (i + vec2(1.5, 1.5)) * tx);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
void main(){
  vec2 vtx = vec2(vR.x - v.x, vT.y - v.y);   // uTx = velocity grid texel (velocity is in texels/s)
  vec2 vel = uManual > .5 ? bil(t0, v, vtx).xy : texture2D(t0, v).xy;
  vec2 c = v - uDt * vel * vtx;
  vec4 r = uManual > .5 ? bil(t1, c, uSrcTx) : texture2D(t1, c);
  gl_FragColor = r / (1. + uDiss * uDt);
}`,
    divergence: H + `uniform sampler2D t0;
void main(){
  float l = texture2D(t0, vL).x, r = texture2D(t0, vR).x, t = texture2D(t0, vT).y, b = texture2D(t0, vB).y;
  vec2 c = texture2D(t0, v).xy;
  if (vL.x < 0.) l = -c.x; if (vR.x > 1.) r = -c.x; if (vT.y > 1.) t = -c.y; if (vB.y < 0.) b = -c.y;
  gl_FragColor = vec4(.5 * (r - l + t - b), 0., 0., 1.);
}`,
    curl: H + `uniform sampler2D t0;
void main(){
  float l = texture2D(t0, vL).y, r = texture2D(t0, vR).y, t = texture2D(t0, vT).x, b = texture2D(t0, vB).x;
  gl_FragColor = vec4(.5 * (r - l - t + b), 0., 0., 1.);
}`,
    vorticity: H + `uniform sampler2D t0, t1; uniform float uCurl, uDt;
void main(){
  float l = texture2D(t1, vL).x, r = texture2D(t1, vR).x, t = texture2D(t1, vT).x, b = texture2D(t1, vB).x, c = texture2D(t1, v).x;
  vec2 f = .5 * vec2(abs(t) - abs(b), abs(r) - abs(l));
  f /= length(f) + .0001; f *= uCurl * c; f.y *= -1.;
  vec2 vel = texture2D(t0, v).xy + f * uDt;
  gl_FragColor = vec4(clamp(vel, -1000., 1000.), 0., 1.);
}`,
    pressure: H + `uniform sampler2D t0, t1;
void main(){
  float l = texture2D(t0, vL).x, r = texture2D(t0, vR).x, t = texture2D(t0, vT).x, b = texture2D(t0, vB).x;
  gl_FragColor = vec4((l + r + b + t - texture2D(t1, v).x) * .25, 0., 0., 1.);
}`,
    gradient: H + `uniform sampler2D t0, t1;
void main(){
  float l = texture2D(t0, vL).x, r = texture2D(t0, vR).x, t = texture2D(t0, vT).x, b = texture2D(t0, vB).x;
  gl_FragColor = vec4(texture2D(t1, v).xy - vec2(r - l, t - b), 0., 1.);
}`,
    // light: paper * exp(-ink absorbance) (dye clamped -> darkest ~ paper*0.4); dark: 1-exp glow, capped
    display: H + `uniform sampler2D t0; uniform float uDark, uCap; uniform vec3 uBg;
void main(){
  vec3 d = max(texture2D(t0, v).rgb, 0.);
  vec3 col;
  if (uDark > .5) {   // neon: punchy saturated glow, dense cores burn toward white
    // split hue from intensity: mixed dyes add up to grey mud, so re-saturate the hue, then light it
    float s = max(d.r, max(d.g, d.b));
    vec3 h = pow(d / (s + .0001), vec3(2.6));
    float b = 1. - exp(-s * 4.5);
    vec3 g = h * b + vec3(pow(b, 6.) * .35);   // thin dim edges, dense cores burn toward white
    col = uBg + clamp(g, 0., 1.) * (1. - uBg);
    col *= uCap; col = max(col, uBg);
  } else {
    vec3 k = min(d, vec3(.9));
    col = uBg * exp(-k);
    float vig = smoothstep(1.25, .35, length(v - .5));
    col *= mix(.97, 1., vig);
  }
  gl_FragColor = vec4(col, 1.);
}`,
  };

  // ---- inks ------------------------------------------------------------------
  const INK_LIGHT = [[0.85, 0.6, 0.2], [0.1, 0.7, 0.85], [0.03, 0.22, 0.8], [0.7, 0.15, 0.45], [0.4, 0.75, 0.3]];   // absorbance: indigo, vermilion, turmeric, jade, plum
  const INK_DARK = [[0.0, 0.9, 1.0], [1.0, 0.05, 0.7], [0.6, 0.15, 1.0], [0.35, 1.0, 0.15], [1.0, 0.5, 0.0]];   // emission: cyan, hot pink, violet, acid lime, amber

  // ---- GL ----------------------------------------------------------------------
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const SIM_H = 128, DYE_H = 512, ITER = 20;
  const CFG = { velDiss: 0.2, dyeDiss: 0.28, pressK: 0.8, curl: 22, force: 5200, rMove: 0.0016, rClick: 0.0034 };
  let styleEl, backdrop, cv, gl, P = {}, half = 0, linear = false, quad = null;
  let vel, dye, prs, div, crl, simW = 0, simH = 0, dyeW = 0, dyeH = 0;
  let raf = 0, last = 0, T = 0, W = 0, Hh = 0, S = 1, dark = false;
  let clearTimer = 0, busyTimer = 0, mounted = false, busy = 0, ptrT = -99, clickT = -99, lastAct = 0, nextAmb = 0, ink = 0;
  const ptr = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, init: false, moved: false };

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
  function target(w, h) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const f = linear ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, half, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('half-float render target unsupported');
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    return { fb, tex, w, h, tx: [1 / w, 1 / h] };
  }
  function pair(w, h) {
    const o = { a: target(w, h), b: target(w, h), w, h, tx: [1 / w, 1 / h] };
    o.swap = () => { const t = o.a; o.a = o.b; o.b = t; };
    return o;
  }
  function freeTargets() {
    for (const t of [vel?.a, vel?.b, dye?.a, dye?.b, prs?.a, prs?.b, div, crl]) if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); }
    vel = dye = prs = div = crl = null;
  }
  function buildTargets() {
    freeTargets();
    const asp = Math.max(0.3, W / Math.max(1, Hh));
    simH = SIM_H; simW = Math.round(SIM_H * asp); dyeH = DYE_H; dyeW = Math.round(DYE_H * asp);
    vel = pair(simW, simH); prs = pair(simW, simH); div = target(simW, simH); crl = target(simW, simH); dye = pair(dyeW, dyeH);
  }
  function initGL() {
    gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
    if (!gl) return false;
    const ext = gl.getExtension('OES_texture_half_float');
    if (!ext) throw new Error('no OES_texture_half_float');
    half = ext.HALF_FLOAT_OES;
    linear = !!gl.getExtension('OES_texture_half_float_linear');
    gl.getExtension('EXT_color_buffer_half_float');
    for (const k in FS) P[k] = program(FS[k]);
    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    return true;
  }
  function pass(name, out, texs, uni, tx) {
    const pr = P[name];
    gl.useProgram(pr.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, out ? out.fb : null);
    gl.viewport(0, 0, out ? out.w : cv.width, out ? out.h : cv.height);
    gl.uniform2fv(pr.u('uTx'), tx || (out ? out.tx : [1 / cv.width, 1 / cv.height]));
    texs.forEach((t, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(pr.u('t' + i), i); });
    for (const k in uni) { const v = uni[k], l = pr.u(k); if (typeof v === 'number') gl.uniform1f(l, v); else if (v.length === 2) gl.uniform2fv(l, v); else if (v.length === 3) gl.uniform3fv(l, v); else gl.uniform4fv(l, v); }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // ---- simulation ----------------------------------------------------------------
  function splat(x, y, dx, dy, color, r) {
    const asp = cv.width / Math.max(1, cv.height);
    pass('splat', vel.b, [vel.a.tex], { uP: [x, y], uR: r, uAsp: asp, uC: [dx, dy, 0, 0] }); vel.swap();
    pass('splat', dye.b, [dye.a.tex], { uP: [x, y], uR: r, uAsp: asp, uC: [color[0], color[1], color[2], 0] }); dye.swap();
  }
  function inkColor(k, amt) {
    const pal = dark ? INK_DARK : INK_LIGHT, n = pal.length;
    const i = Math.floor(k) % n, j = (i + 1) % n, f = k - Math.floor(k), a = pal[i], b = pal[j];
    return [(a[0] + (b[0] - a[0]) * f) * amt, (a[1] + (b[1] - a[1]) * f) * amt, (a[2] + (b[2] - a[2]) * f) * amt];
  }
  function randomSplat(amt) {
    const a = Math.random() * Math.PI * 2, sp = 260 + Math.random() * 420;
    splat(0.15 + Math.random() * 0.7, 0.15 + Math.random() * 0.7, Math.cos(a) * sp, Math.sin(a) * sp,
      inkColor(Math.random() * 5, amt), CFG.rClick * (0.7 + Math.random() * 0.8));
  }
  function seed() { for (let i = 0; i < 6; i++) randomSplat(dark ? 0.9 : 0.75); }
  function step(dt) {
    pass('curl', crl, [vel.a.tex], {});
    pass('vorticity', vel.b, [vel.a.tex, crl.tex], { uCurl: CFG.curl, uDt: dt }); vel.swap();
    pass('divergence', div, [vel.a.tex], {});
    pass('clear', prs.b, [prs.a.tex], { uK: CFG.pressK }); prs.swap();
    for (let i = 0; i < ITER; i++) { pass('pressure', prs.b, [prs.a.tex, div.tex], {}); prs.swap(); }
    pass('gradient', vel.b, [prs.a.tex, vel.a.tex], {}); vel.swap();
    pass('advect', vel.b, [vel.a.tex, vel.a.tex], { uDt: dt, uDiss: CFG.velDiss, uSrcTx: vel.tx, uManual: linear ? 0 : 1 }); vel.swap();
    pass('advect', dye.b, [vel.a.tex, dye.a.tex], { uDt: dt, uDiss: CFG.dyeDiss, uSrcTx: dye.tx, uManual: linear ? 0 : 1 }, vel.tx); dye.swap();
  }
  function render() {
    pass('display', null, [dye.a.tex], { uDark: dark ? 1 : 0, uCap: CAP_DARK, uBg: dark ? NIGHT : PAPER });
  }
  function inputs(dt) {
    if (ptr.moved) {
      ptr.moved = false;
      let dx = ptr.x - ptr.px, dy = ptr.y - ptr.py;
      ptr.px = ptr.x; ptr.py = ptr.y;
      const asp = cv.width / Math.max(1, cv.height), len = Math.hypot(dx, dy);
      if (asp < 1) dx *= asp; else dy /= asp;
      if (len > 1e-5) splat(ptr.x, ptr.y, dx * CFG.force, dy * CFG.force, inkColor(ink + T / 7, Math.min(1, len * 30) * (dark ? 0.32 : 0.16)), CFG.rMove);
    }
    if (busy) {   // plume from the input box while Claude works
      const x = 0.5 + 0.09 * Math.sin(T * 0.7) + 0.03 * Math.sin(T * 2.3);
      splat(x, 0.13, 30 * Math.sin(T * 1.3), 170, inkColor(ink + T / 9, (dark ? 0.06 : 0.035) * dt * 60), 0.0011);
      lastAct = T;
    }
    if (T > nextAmb) { randomSplat(dark ? 0.45 : 0.32); nextAmb = T + 5 + Math.random() * 5; }
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const el = now - last;
    const active = busy || T - ptrT < 3 || T - clickT < 4;
    if (el < (active ? 31 : (T - lastAct < 20 ? 42 : 80))) return;   // ~30 fps lively, ~24 settling, ~12 calm
    const dt = Math.min(el / 1000, 1 / 30);
    T += dt; last = now;
    inputs(dt); step(dt); render();
  }
  function resize() {
    W = innerWidth; Hh = innerHeight; S = Math.min(1.25, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(W * S)); cv.height = Math.max(1, Math.round(Hh * S));
    if (!gl) return;
    const asp = W / Math.max(1, Hh);
    if (!vel || Math.abs(simW / simH - asp) > 0.02) { buildTargets(); seed(); }
    render();
  }

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
  const onMove = (e) => {
    const x = e.clientX / Math.max(1, innerWidth), y = 1 - e.clientY / Math.max(1, innerHeight);
    if (!ptr.init) { ptr.init = true; ptr.px = x; ptr.py = y; }
    ptr.x = x; ptr.y = y; ptr.moved = true; ptrT = T; lastAct = T;
  };
  const onDown = (e) => {
    if (!gl || !vel || styleEl.disabled) return;
    const x = e.clientX / Math.max(1, innerWidth), y = 1 - e.clientY / Math.max(1, innerHeight), a = Math.random() * Math.PI * 2;
    ink += 1;
    splat(x, y, Math.cos(a) * 520, Math.sin(a) * 520, inkColor(ink, dark ? 1.1 : 0.85), CFG.rClick);
    ptr.px = x; ptr.py = y; clickT = T; lastAct = T;
  };
  function setMode() {
    const was = dark;
    dark = isDark();
    document.documentElement.toggleAttribute('data-cs-dark', dark);
    window.__claudeSkinBase = dark ? BASE.dark : BASE.light;
    if (gl && dye && was !== dark) {   // dye means absorbance in light, emission in dark: restart the water
      for (const t of [dye.a, dye.b]) { gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb); gl.viewport(0, 0, t.w, t.h); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
      seed();
    }
    if (gl && dye) render();
  }
  function start() { if (!raf && gl) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  const onLost = (e) => { e.preventDefault(); stop(); vel = dye = prs = div = crl = null; };
  const onRestored = () => { try { if (initGL()) { buildTargets(); seed(); resize(); start(); } } catch { /* stays plain */ } };

  function mount() {
    backdrop = document.createElement('div'); backdrop.id = 'cs-backdrop';
    cv = document.createElement('canvas'); cv.id = 'cs-fluid'; backdrop.appendChild(cv);
    W = innerWidth; Hh = innerHeight; S = Math.min(1.25, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(W * S)); cv.height = Math.max(1, Math.round(Hh * S));
    dark = isDark();
    try { if (!initGL()) throw new Error('no webgl'); buildTargets(); }
    catch (err) { window.__claudeSkinState = 'no-webgl'; window.__claudeSkinError = String(err && err.message || err); gl?.getExtension('WEBGL_lose_context')?.loseContext(); gl = null; return; }
    styleEl = document.createElement('style'); styleEl.id = 'cs-style'; styleEl.textContent = css;
    document.head.appendChild(styleEl);
    document.body.prepend(backdrop);
    document.documentElement.setAttribute('data-cs-n', '');
    mounted = true; setMode(); seed(); nextAmb = 4;
    cv.addEventListener('webglcontextlost', onLost); cv.addEventListener('webglcontextrestored', onRestored);
    resize();
    clearUnder(); clearTimer = setInterval(clearUnder, 2000);
    checkBusy(); busyTimer = setInterval(checkBusy, 500);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('resize', resize);
    start();
    // debug: advance n frames (+ random drops) and snapshot; works while the window is hidden
    window.__claudeSkinStep = (n = 1, opts = {}) => {
      if (opts.busy != null) busy = opts.busy;
      if (opts.dark != null && opts.dark !== dark) {   // preview the other palette without touching the app's mode
        dark = opts.dark;
        for (const t of [dye.a, dye.b]) { gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb); gl.viewport(0, 0, t.w, t.h); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
        seed();
      }
      for (let i = 0; i < n; i++) { T += 1 / 30; if (opts.drops && i % 25 === 0) randomSplat(dark ? 0.9 : 0.75); inputs(1 / 30); step(1 / 30); }
      render(); return cv.toDataURL('image/png');
    };
    window.__claudeSkinPerf = (n = 20) => { const b = new Uint8Array(4), t0 = performance.now();
      for (let i = 0; i < n; i++) { step(1 / 30); render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b); }
      return { ms: (performance.now() - t0) / n, w: cv.width, h: cv.height, sim: [simW, simH], dye: [dyeW, dyeH], linear }; };
    window.__claudeSkinState = 'on';
  }
  const modeObs = new MutationObserver(setMode);
  const mq = matchMedia('(prefers-color-scheme: dark)');

  const glass = { d: 0.62, l: 0.66 };   // dark default thicker: neon cap 0.88 is bright
  let toastT = 0;
  function toast(text) {
    let t = document.getElementById('cs-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cs-toast'; document.body.appendChild(t); }
    t.textContent = text; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1100);
  }
  function stepGlass(d) {   // separate memory per mode
    const k = dark ? 'd' : 'l';
    glass[k] = Math.round(clamp(glass[k] + d, 0, 0.95) * 100) / 100;   // free range by Yang's call (11-16)
    document.documentElement.style.setProperty(dark ? '--cs-ad' : '--cs-al', String(glass[k]));
    toast(`Glass ${Math.round(glass[k] * 100)}%`);
  }
  const onKey = (e) => {   // Ctrl+Alt+Up/Down glass, Ctrl+Alt+G on/off
    if (!mounted || !e.ctrlKey || !e.altKey) return;
    if ((e.code === 'ArrowUp' || e.code === 'ArrowDown') && !styleEl.disabled) { e.preventDefault(); stepGlass(e.code === 'ArrowUp' ? 0.05 : -0.05); return; }
    if (e.code === 'KeyG') {
      styleEl.disabled = !styleEl.disabled;
      backdrop.style.display = styleEl.disabled ? 'none' : '';
      document.documentElement.toggleAttribute('data-cs-n', !styleEl.disabled);
      if (styleEl.disabled) stop(); else start();
    }
  };
  addEventListener('keydown', onKey, true);
  window.__claudeSkinCleanup = () => {
    removeEventListener('keydown', onKey, true);
    modeObs.disconnect(); mq.removeEventListener('change', setMode);
    if (mounted) {
      mounted = false; stop();
      clearInterval(clearTimer); clearInterval(busyTimer);
      removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown); removeEventListener('resize', resize);
      if (gl) { freeTargets(); gl.getExtension('WEBGL_lose_context')?.loseContext(); gl = null; }
      styleEl.remove(); backdrop.remove();
    }
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
