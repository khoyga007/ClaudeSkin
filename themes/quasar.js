// ClaudeSkin theme "Quasar": ultramassive black hole behind dark glass. DARK MODE ONLY (dormant in light,
// wakes when the app flips to dark). One WebGL fragment shader: bent light rays (Schwarzschild, rs = 1),
// lensed accretion disk with Doppler beaming, photon ring, twin jets, lensed starfield.
// Claude answering (Stop button present) = accretion rate up, jets fire. Idle = fades to the inner ring.
// Mouse = small lensing mass. Click = matter clump spirals in, crosses the horizon, jets flare.
// Pure local code: no network, no storage, no images, never reads messages.
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;
  window.__claudeSkinBase = [179, 172, 162];   // shader output is capped at 0.70 -> brightest pixel under glass (audit worst case)

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const Q = ':root[data-cs-q]';   // attribute set only while mounted (covers data-mode="system" too)
  const EDGE = 'rgba(255, 255, 255, 0.07)';
  const RIM = 'rgba(255, 160, 80, 0.10)';
  const css = `
${Q}, ${Q} .cds-root {   /* app redefines tokens on .cds-root[data-mode], root alone is not enough */
  --text-400: 40 8% 83% !important;
  --text-500: 40 8% 83% !important;
  --cds-text-secondary: #ffffffcc !important;
  --cds-text-stays-secondary: #ffffffcc !important;
  --cds-text-muted: #ffffffb8 !important;
  --cds-border: rgba(255, 255, 255, 0.10) !important;
  --cds-border-line: rgba(255, 255, 255, 0.12) !important;
  --cds-surface-0: rgba(8, 9, 14, 0.34) !important;
  --cds-surface-1: rgba(8, 9, 14, 0.34) !important;
  --cds-surface-2: rgba(12, 13, 20, 0.58) !important;
  --cds-surface-3: rgba(16, 17, 25, 0.88) !important;
  --cds-surface-popover: rgba(16, 17, 25, 0.97) !important;
}
${Q} { background: #030407 !important; --cs-a: 0.55; }
${Q} body { background: transparent !important; }
${Q} body > div.grid,
${Q} .dframe-content,
${Q} .dframe-nav-scroll,
${Q} div.pointer-events-none.absolute.inset-0.bg-surface-1,
${Q} [class*="bg-[var(--epitaxy-transc"],
${Q} [data-cs-clear] { background: transparent !important; }
${Q} .dframe-sidebar {
  background: rgba(7, 8, 13, calc(var(--cs-a) + 0.12)) !important;
  box-shadow: inset 0 1px 0 ${EDGE}, inset -1px 0 0 ${RIM}, 0 10px 40px rgba(0, 0, 0, 0.5);
}
${Q} .tiles-shell {
  background: rgba(7, 8, 13, var(--cs-a)) !important;
  border-radius: 18px;
  box-shadow: inset 0 1px 0 ${EDGE}, inset 0 0 0 1px ${RIM}, 0 10px 50px rgba(0, 0, 0, 0.55);
}
${Q} .epitaxy-code-card { background: rgba(12, 13, 20, 0.84) !important; box-shadow: inset 0 1px 0 ${EDGE}; }
${Q} .text-muted-as-secondary { color: var(--cds-text-secondary) !important; }
${Q} ::selection { background: rgba(255, 150, 60, 0.32); }
${Q} textarea:focus-visible, ${Q} [contenteditable="true"]:focus-visible { outline-color: #ff9d4d !important; }
${Q} .dframe-sidebar a, ${Q} .dframe-sidebar button { transition: background-color .18s ease, transform .18s ease; }
${Q} .dframe-sidebar a:hover, ${Q} .dframe-sidebar button:hover { background-color: rgba(255, 170, 90, 0.10) !important; transform: translateX(2px); }
#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: #030407; }
#cs-quasar { display: block; width: 100%; height: 100%; }
#cs-toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 2147483000; pointer-events: none;
  padding: 6px 14px; border-radius: 999px; background: rgba(255, 240, 220, 0.9); color: #14110d; font: 500 13px system-ui, sans-serif;
  opacity: 0; transition: opacity .25s ease; }
#cs-toast.show { opacity: 1; }
`;

  // ---- shader ----------------------------------------------------------------
  // Units: Schwarzschild radius = 1. Camera 16 rs out, 8 deg above the disk plane, rolled for style.
  // Ray bending: a = -1.5 h^2 p / r^5 (exact null-geodesic shape for Schwarzschild, h = |p x v|).
  const VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }';
  const FRAG = `
precision highp float;
uniform vec2 uRes, uCenter, uMouse;
uniform float uT, uPow, uJet, uFlare, uMouseK, uTau1, uTau2, uMix;
uniform vec4 uClump[3];   // r, phi, angular width, strength
uniform vec3 uClick;      // uv.xy, age seconds (<0 = none)
const float RIN = 3.0, ROUT = 11.5, DIST = 16.0, EL = 0.14, ZOOM = 0.80, ROLL = -0.32;
const float PI = 3.14159265;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float hash3(vec3 p){ p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return s; }

vec3 stars(vec3 d){
  // 2D sky coords (pole is behind the camera) -> round, crisp points; two densities
  vec2 sp = vec2(atan(d.x, d.z), asin(clamp(d.y, -1., 1.)));
  vec3 col = vec3(0.);
  for (int l = 0; l < 2; l++) {
    float sc = l == 0 ? 38. : 95.;
    vec2 q = sp * sc, id = floor(q), f = fract(q) - .5;
    vec2 o = (vec2(hash(id + 3.1), hash(id + 7.7)) - .5) * .7;
    float h = hash(id + 1.3);
    float s = smoothstep(l == 0 ? .075 : .10, 0., length(f - o)) * step(.78, h) * (.35 + .65 * fract(h * 37.));
    col += s * mix(vec3(1., .82, .65), vec3(.7, .82, 1.), hash(id + 5.)) * (l == 0 ? 1.3 : .7);
  }
  float neb = fbm(sp * 2.2);
  return col + vec3(.10, .05, .14) * neb * neb * .45;
}

// Differentially rotating gas: pattern sheared by angle a (grows with time, see uTau1/uTau2 cross-fade).
float flow(vec2 p, float a, float r, float off){
  float cs = cos(a), sn = sin(a);
  vec2 q = vec2(cs * p.x + sn * p.y, -sn * p.x + cs * p.y);
  float n = fbm(q * 2.4 + off);
  float bands = .5 + .5 * sin(r * 9. + fbm(q * .8 + off) * 6.);
  return n * (.5 + .5 * bands);
}

vec4 disk(vec3 c, vec3 vn){
  float r = length(c.xz);
  if (r < RIN || r > ROUT) return vec4(0.);
  float x = (r - RIN) / (ROUT - RIN);
  float edge = smoothstep(RIN, RIN + .45, r) * (1. - smoothstep(ROUT * .5, ROUT, r));
  float w = 1.9 * pow(r, -1.5);
  float tex = mix(flow(c.xz, w * uTau1, r, 0.), flow(c.xz, w * uTau2, r, 31.7), uMix);
  vec3 col = mix(vec3(.78, .87, 1.), vec3(1., .72, .38), smoothstep(0., .22, x));
  col = mix(col, vec3(.88, .25, .07), smoothstep(.18, 1., x));
  float pw = mix(max(uPow, .5), uPow, smoothstep(0., .35, x));   // idle: outer disk fades, inner ring stays
  float I = 5.5 * pow(RIN / r, 1.9) * (.3 + 1.7 * tex * tex) * pw;
  I += uFlare * 2.2 * exp(-(r - RIN) * 1.1);
  float phi = atan(c.z, c.x);
  for (int k = 0; k < 3; k++) {
    vec4 cl = uClump[k];
    if (cl.w <= 0.) continue;
    float dphi = abs(mod(phi - cl.y + PI, 2. * PI) - PI);
    float g = exp(-pow((r - cl.x) / .55, 2.)) * exp(-pow(dphi / cl.z, 2.));
    I += cl.w * g * 5.; col = mix(col, vec3(1., .93, .8), clamp(g * cl.w, 0., 1.));
  }
  vec3 vd = normalize(vec3(-c.z, 0., c.x));               // orbital direction (+phi)
  float beta = sqrt(.5 / r);                             // Keplerian speed, c = 1
  float dop = sqrt(1. - beta * beta) / (1. - beta * dot(vd, -vn));
  I *= dop * dop * dop;                                  // relativistic beaming
  col *= mix(vec3(1.25, .82, .58), vec3(.8, .95, 1.3), smoothstep(.6, 1.5, dop));
  return vec4(col * I * edge, edge * clamp(.3 + 1.1 * tex, 0., 1.) * .95);
}

void main(){
  vec2 uv0 = (gl_FragCoord.xy - uCenter) / uRes.y;
  vec2 dm = uv0 - uMouse;
  vec2 uv = uv0 - uMouseK * dm * (.0011 / (dot(dm, dm) + .00012));   // cursor = point lens, Einstein radius ~.033
  float cr = cos(ROLL), sr = sin(ROLL);
  vec2 u2 = vec2(cr * uv.x - sr * uv.y, sr * uv.x + cr * uv.y);
  vec3 ro = vec3(0., sin(EL), -cos(EL)) * DIST;
  vec3 f = normalize(-ro), rt = normalize(cross(vec3(0., 1., 0.), f)), up = cross(f, rt);
  vec3 v = normalize(f * ZOOM + u2.x * rt + u2.y * up);
  vec3 p = ro, hv = cross(p, v), v0 = v;
  float h2 = dot(hv, hv), tr = 1.;
  vec3 col = vec3(0.);
  bool cap = false, done = false;
  float bimp = sqrt(h2);   // impact parameter: exact + smooth per pixel (critical value 2.598)
  for (int i = 0; i < 100; i++) {
    float r = length(p);
    if (r < 1.) { cap = true; done = true; break; }
    float rax = length(p.xz);
    if (dot(p, v) > 0. && (r > 45. || (r > 13.5 && (rax > 6. || uJet <= .003)))) { done = true; break; }   // outbound past the disk, clear of the jets
    float dt = min(clamp(.16 * (r - .75), .04, 3.), .3 + .35 * rax);   // fine near the hole and the jet axis
    float r2 = r * r;
    vec3 v1 = v - 1.5 * h2 * p / (r2 * r2 * r) * dt;
    vec3 p1 = p + v1 * dt;
    if (p.y * p1.y < 0.) {
      vec4 d = disk(mix(p, p1, p.y / (p.y - p1.y)), normalize(v1));
      col += tr * d.rgb; tr *= 1. - d.a;
    }
    float ay = abs(p1.y);
    float wj = .26 + .075 * ay, rj = length(p1.xz);
    if (ay > 1.3 && uJet > .003 && rj < 3. * wj) {
      float w = wj;
      float e = exp(-rj * rj / (w * w)) * exp(-ay / 16.) / (1. + .12 * ay) * smoothstep(1.3, 2.8, ay);
      e *= .6 + .4 * sin(ay * 1.4 - uT * 5.) * sin(ay * .37 - uT * 1.3);   // knots travelling outward
      col += tr * vec3(.42, .64, 1.) * e * dt * uJet * 2.2 * (p1.y > 0. ? 1.25 : .8);
    }
    p = p1; v = v1;
    if (tr < .02) { done = true; break; }
  }
  if (!done) cap = true;   // ray still orbiting after 100 steps = on the photon sphere: horizon, not speckle
  col += vec3(1., .86, .66) * exp(-pow((bimp - 2.63) / .03, 2.)) * (.5 + .9 * uPow + 1.5 * uFlare);   // photon ring, analytic so it never aliases
  if (!cap) {
    col += tr * stars(normalize(mix(v0, normalize(v), .35))) * 1.7;   // partial lensing: full strength smears every star into an arc at this distance
    float rr = length(u2 * vec2(1., 2.4));
    col += vec3(1., .55, .25) * uPow * .012 / (rr * rr + .02);   // soft glow along the disk
  }
  if (uClick.z >= 0.) {
    float ring = exp(-pow((length(uv0 - uClick.xy) - (.012 + uClick.z * .3)) / .005, 2.)) * (1. - uClick.z / .7);
    col += vec3(1., .8, .58) * max(0., ring) * .7;
  }
  col = 1. - exp(-col * 2.6);
  gl_FragColor = vec4(pow(col, vec3(.92)) * .70, 1.);   // .70 cap keeps text readable over the hottest pixel
}`;

  // ---- state -----------------------------------------------------------------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const RIN = 3.0, ROUT = 11.5, ROLL = -0.32, PERIOD = 40;
  let styleEl, backdrop, cv, gl, prog, U = {}, raf = 0, last = 0, T = 0, W = 0, H = 0, S = 0.5;
  let clearTimer = 0, busyTimer = 0, mounted = false, slowN = 0, frames = 0, tuned = false;
  let busyTarget = 0, busy = 0, power = 0.55, flare = 0, flowT = 0, lastActive = 0;
  const ptr = { x: -9, y: -9, t: -99, k: 0 };
  const click = { x: 0, y: 0, age: -1 };
  const clumps = [];
  const px = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  px.canvas.width = px.canvas.height = 1;
  function alphaOf(c) { px.clearRect(0, 0, 1, 1); px.fillStyle = 'rgba(0,0,0,0)'; px.fillStyle = c; px.fillRect(0, 0, 1, 1); return px.getImageData(0, 0, 1, 1).data[3] / 255; }

  const center = () => [W * 0.6, H * 0.42];                                  // CSS px, hole position
  const toUv = (x, y) => { const [cx, cy] = center(); return [(x - cx) / H, (cy - y) / H]; };   // shader uv (y up)

  function initGL() {
    gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false });
    if (!gl) return false;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const n of ['uRes', 'uCenter', 'uMouse', 'uT', 'uPow', 'uJet', 'uFlare', 'uMouseK', 'uTau1', 'uTau2', 'uMix', 'uClump', 'uClick']) U[n] = gl.getUniformLocation(prog, n);
    return true;
  }

  function update(dt) {
    busy += (busyTarget - busy) * Math.min(1, dt * (busyTarget > busy ? 1.6 : 0.5));
    const target = busyTarget ? 1 : (T - lastActive < 25 ? 0.55 : 0.16);
    power += (target - power) * Math.min(1, dt * (target > power ? 1.2 : 0.045));   // wakes fast, dims over ~a minute
    flare = Math.max(0, flare - dt / 2.6);
    flowT += dt * (0.55 + 1.5 * busy);
    ptr.k += ((T - ptr.t < 3 ? 1 : 0) - ptr.k) * Math.min(1, dt * 3);
    if (click.age >= 0) { click.age += dt; if (click.age > 0.7) click.age = -1; }
    for (let i = clumps.length - 1; i >= 0; i--) {
      const c = clumps[i];
      c.r -= dt * (0.55 + 7 / c.r);                       // inspiral accelerates
      c.phi += dt * 6.5 * Math.pow(c.r, -1.5);
      c.s = Math.min(1, c.s + dt * 2.5);
      if (c.r < RIN + 0.05) { clumps.splice(i, 1); flare = 1; lastActive = T; }
    }
  }
  function draw() {
    if (!gl) return;
    const [cx, cy] = center(), m = toUv(ptr.x, ptr.y);
    const t1 = flowT % PERIOD, t2 = (flowT + PERIOD / 2) % PERIOD;
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform2f(U.uCenter, cx * S, (H - cy) * S);
    gl.uniform2f(U.uMouse, m[0], m[1]);
    gl.uniform1f(U.uT, T % 3600);
    gl.uniform1f(U.uPow, power);
    gl.uniform1f(U.uJet, clamp(busy * busy + flare * 1.3 + power * 0.05, 0, 2.2));
    gl.uniform1f(U.uFlare, flare);
    gl.uniform1f(U.uMouseK, ptr.k);
    gl.uniform1f(U.uTau1, t1); gl.uniform1f(U.uTau2, t2);
    gl.uniform1f(U.uMix, Math.abs(2 * t1 / PERIOD - 1));     // weight of phase 2; phase 1 weight is 0 at its reset
    const cl = new Float32Array(12);
    clumps.slice(0, 3).forEach((c, i) => cl.set([c.r, c.phi, 0.22 + 1.5 * (1 - (c.r - RIN) / (ROUT - RIN)), c.s], i * 4));   // tidal stretch as it falls
    gl.uniform4fv(U.uClump, cl);
    gl.uniform3f(U.uClick, click.x, click.y, click.age);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const el = now - last;
    const lively = busyTarget || busy > 0.03 || flare > 0 || clumps.length || T - ptr.t < 4 || click.age >= 0;
    if (el < (lively ? 31 : 80)) return;                  // ~30 fps while something happens, ~12 fps when just drifting (GPU rest)
    const dt = Math.min(0.05, el / 1000); last = now; T += dt;
    update(dt); draw();
    if (++frames > 60 && S > 0.4) {                       // still can't hold 30 fps -> one step smaller
      slowN = el > 50 ? slowN + 1 : Math.max(0, slowN - 1);
      if (slowN > 45) { S *= 0.8; slowN = 0; frames = 0; resize(); }
    }
  }

  // ---- events ----------------------------------------------------------------
  function onMove(e) { if (!mounted || styleEl.disabled) return; ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = T; lastActive = T; }
  function onDown(e) {
    if (!mounted || styleEl.disabled) return;
    const [ux, uy] = toUv(e.clientX, e.clientY);
    click.x = ux; click.y = uy; click.age = 0; lastActive = T;
    const cr = Math.cos(ROLL), sr = Math.sin(ROLL);       // same roll as the shader; far side of the disk is up-screen
    const phi = Math.atan2(sr * ux + cr * uy, cr * ux - sr * uy);
    if (clumps.length >= 3) clumps.shift();
    clumps.push({ r: ROUT - 1.2, phi, s: 0 });
  }
  // Pick the sharpest render scale the GPU can draw in ~26 ms: time a few frames small, cost scales with pixel count.
  function tune() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), b = new Uint8Array(4);
    const run = (n) => { const t0 = performance.now(); for (let i = 0; i < n; i++) { draw(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b); } return (performance.now() - t0) / n; };
    const sv = { busy, power }; busy = 1; power = 1;      // measure the expensive state (jets on)
    S = 0.5 * dpr; sizeCanvas(); run(3);
    const perPx = run(6) / (cv.width * cv.height);
    busy = sv.busy; power = sv.power;
    const q = [1, 0.85, 0.72, 0.6, 0.5, 0.4].find((k) => perPx * W * H * dpr * dpr * k * k <= 26) || 0.4;
    S = dpr * q; tuned = true;
    window.__claudeSkinInfo = { scale: q, dpr, msAtHalf: +(perPx * cv.width * cv.height).toFixed(1) };
  }
  function sizeCanvas() { cv.width = Math.max(1, Math.round(W * S)); cv.height = Math.max(1, Math.round(H * S)); }
  function resize() {
    W = innerWidth; H = innerHeight;
    if (!tuned && gl) tune();
    cv.width = Math.max(1, Math.round(W * S)); cv.height = Math.max(1, Math.round(H * S));
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
  const checkBusy = () => { busyTarget = document.querySelector(BUSY_SEL) ? 1 : 0; if (busyTarget) lastActive = T; };

  function start() { if (!raf && gl) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  const onLost = (e) => { e.preventDefault(); stop(); };
  const onRestored = () => { try { if (initGL()) { resize(); start(); } } catch { /* stays black */ } };

  function mount() {
    if (mounted) return;
    if (!isDark()) { window.__claudeSkinState = 'skipped-light'; return; }
    backdrop = document.createElement('div'); backdrop.id = 'cs-backdrop';
    cv = document.createElement('canvas'); cv.id = 'cs-quasar'; backdrop.appendChild(cv);
    try { if (!initGL()) throw new Error('no webgl'); }
    catch (err) { window.__claudeSkinState = 'no-webgl'; window.__claudeSkinError = String(err && err.message || err); gl = null; return; }
    styleEl = document.createElement('style'); styleEl.id = 'cs-style'; styleEl.textContent = css;
    document.head.appendChild(styleEl);
    document.body.prepend(backdrop);
    document.documentElement.setAttribute('data-cs-q', '');
    mounted = true; frames = 0; slowN = 0; tuned = false;
    cv.addEventListener('webglcontextlost', onLost); cv.addEventListener('webglcontextrestored', onRestored);
    resize();
    clearUnder(); clearTimer = setInterval(clearUnder, 2000);
    checkBusy(); busyTimer = setInterval(checkBusy, 500);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('resize', resize);
    start(); if (tracks.length) musicResume();
    // debug: advance n frames + snapshot (works while window hidden). opts: busy, power, mouse [x,y], click [x,y]
    window.__claudeSkinStep = (n = 1, opts = {}) => {
      if (opts.busy != null) { busyTarget = opts.busy; busy = opts.busy; }
      if (opts.power != null) power = opts.power;
      if (opts.mouse) { ptr.x = opts.mouse[0]; ptr.y = opts.mouse[1]; ptr.t = T; ptr.k = 1; }
      if (opts.click) onDown({ clientX: opts.click[0], clientY: opts.click[1] });
      for (let i = 0; i < n; i++) { T += 1 / 30; update(1 / 30); if (opts.power != null) power = opts.power; }
      draw(); return cv.toDataURL('image/png');
    };
    window.__claudeSkinPerf = (n = 20) => { const b = new Uint8Array(4), t0 = performance.now(); for (let i = 0; i < n; i++) { draw(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b); } return { ms: (performance.now() - t0) / n, w: cv.width, h: cv.height }; };
    window.__claudeSkinState = 'on';
  }
  function unmount() {
    if (!mounted) return;
    mounted = false; stop(); musicPause();
    clearInterval(clearTimer); clearInterval(busyTimer);
    removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown); removeEventListener('resize', resize);
    gl?.getExtension('WEBGL_lose_context')?.loseContext(); gl = null;
    styleEl.remove(); backdrop.remove();
    document.documentElement.removeAttribute('data-cs-q');
    for (const el of document.querySelectorAll('[data-cs-clear]')) el.removeAttribute('data-cs-clear');
    delete window.__claudeSkinStep; delete window.__claudeSkinPerf; delete window.__claudeSkinInfo;
    window.__claudeSkinState = 'skipped-light';
  }
  // App flips light <-> dark: wake up / go dormant without re-injecting.
  const sync = () => { if (isDark()) mount(); else unmount(); };
  const modeObs = new MutationObserver(sync);
  const mq = matchMedia('(prefers-color-scheme: dark)');

  let glassA = 0.55, toastT = 0;
  function toast(text) {
    let t = document.getElementById('cs-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cs-toast'; document.body.appendChild(t); }
    t.textContent = text; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1100);
  }
  function setGlass(a) {
    glassA = Math.round(clamp(a, 0.3, 0.9) * 10) / 10;
    document.documentElement.style.setProperty('--cs-a', String(glassA));
    toast(`Glass ${Math.round(glassA * 100)}%`);
  }

  // ---- music ----
  // inject.mjs hands over the files in music/quasar/ as base64 (window.__claudeSkinMusic.add), so the page never
  // fetches a URL. Plays through <audio> on a blob: URL; if the page CSP refuses that, falls back to WebAudio decode.
  const tracks = [];
  let audio = null, actx = null, gainN = null, srcN = null, ti = 0, useWA = false, paused = false, vol = 0.4, muted = false;
  try { const s = JSON.parse(localStorage.getItem('cs-quasar-music') || '{}'); if (s.vol >= 0 && s.vol <= 1) vol = s.vol; muted = !!s.muted; } catch { /* defaults */ }
  const level = () => (muted ? 0 : vol * vol);   // squared, so each 10% step sounds like an even step
  function saveMusic() { try { localStorage.setItem('cs-quasar-music', JSON.stringify({ vol, muted })); } catch { /* not persisted */ } }
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
    if ((e.code === 'ArrowUp' || e.code === 'ArrowDown') && !styleEl.disabled) { e.preventDefault(); setGlass(glassA + (e.code === 'ArrowUp' ? 0.1 : -0.1)); return; }
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
      document.documentElement.toggleAttribute('data-cs-q', !styleEl.disabled);
      if (styleEl.disabled) { stop(); musicPause(); } else { start(); musicResume(); }
    }
  };
  addEventListener('keydown', onKey, true);
  window.__claudeSkinCleanup = () => {
    removeEventListener('keydown', onKey, true);
    modeObs.disconnect(); mq.removeEventListener('change', sync);
    musicKill(); delete window.__claudeSkinMusic;
    unmount(); clearTimeout(toastT); document.documentElement.style.removeProperty('--cs-a');
    for (const el of document.querySelectorAll('[id^="cs-"]')) el.remove();
    window.__claudeSkin = false; window.__claudeSkinState = 'off';
  };

  const boot = () => { modeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] }); mq.addEventListener('change', sync); mount(); };
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
