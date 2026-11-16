// ClaudeSkin theme "Dragon": an eastern dragon made of ink smoke, living in the Fluid simulation.
// Each frame an invisible dragon-shaped mask (spine tube + head with horns, whiskers, mane, claws, tail tuft) is drawn
// on a small 2D canvas. Inside the mask the dye is re-inked toward the body colour with brush-like noise; the mask's
// edges get a curling push, so the outline keeps smoking off while the shape holds. Where the dragon leaves, the ink is
// no longer refreshed and dissolves into the water. Fire = high-velocity coloured jets from the mouth.
// Light: black ink on paper, vermilion/gold fire. Dark: glowing silver smoke, neon orange/pink fire.
// Behaviour: plays with a glowing pearl (chases it, it darts off); follows the pointer while it moves, and when the
// pointer rests a while swims over, sniffs it and snorts; click = breathe at it; the pearl can be grabbed and thrown
// (the dragon fetches it and carries it in its mouth a while); fire that hits the pearl is swallowed and bursts out as a ring; while Claude works it coils slowly
// around the pearl, and when the reply ends breathes one big blast at it. No assets, no network, never reads messages.
// Engine shared with themes/fluid.js.
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };
  const CAP_DARK = 0.88;
  const BASE = { dark: [224, 224, 224], light: [90, 92, 108] };
  const PAPER = [0.95, 0.935, 0.905], NIGHT = [0.025, 0.025, 0.045];

  const Q = ':root[data-cs-n]';
  const D = `${Q}[data-cs-dark]`, L = `${Q}:not([data-cs-dark])`;
  const css = `
${D}, ${D} .cds-root {
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
${D} { --cs-g: 7, 8, 14; --cs-a: var(--cs-ad, 0.62); --cs-edge: rgba(255, 255, 255, 0.07); --cs-rim: rgba(255, 140, 60, 0.10); --cs-sh: rgba(0, 0, 0, 0.55); }
${L} { --cs-g: 250, 248, 243; --cs-a: var(--cs-al, 0.66); --cs-edge: rgba(255, 255, 255, 0.75); --cs-rim: rgba(255, 255, 255, 0.35); --cs-sh: rgba(40, 20, 10, 0.28); }
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
${L} .prose-link { color: #8a1d1d !important; }
${Q} .text-muted-as-secondary { color: var(--cds-text-secondary) !important; }
${D} ::selection { background: rgba(255, 130, 50, 0.30); }
${L} ::selection { background: rgba(190, 40, 30, 0.20); }
${D} textarea:focus-visible, ${D} [contenteditable="true"]:focus-visible { outline-color: #ff8a3c !important; }
${L} textarea:focus-visible, ${L} [contenteditable="true"]:focus-visible { outline-color: #b3261e !important; }
${Q} .dframe-sidebar a, ${Q} .dframe-sidebar button { transition: background-color .18s ease, transform .18s ease; }
${D} .dframe-sidebar a:hover, ${D} .dframe-sidebar button:hover { background-color: rgba(255, 140, 60, 0.10) !important; transform: translateX(2px); }
${L} .dframe-sidebar a:hover, ${L} .dframe-sidebar button:hover { background-color: rgba(255, 255, 255, 0.6) !important; transform: translateX(2px); }
${Q} [data-cs-bandbox] { background: rgba(var(--cs-g), calc(var(--cs-a) + 0.14)) !important; box-shadow: inset 0 1px 0 var(--cs-edge), inset 0 0 0 1px var(--cs-rim), 0 6px 24px var(--cs-sh) !important; }
/* usage band colours: the band lives in a mod's shadow root, so only these inherited vars reach it (see BAND_CSS) */
${L} { --cs-trk: rgba(40, 30, 20, 0.12); --cs-ok: linear-gradient(180deg, #55555a, #1d1d21); --cs-okg: none; --cs-okt: #1d1d21;
  --cs-wn: linear-gradient(180deg, #c99a3e, #9a6c1c); --cs-wng: none; --cs-wnt: #9a6c1c; --cs-bd: #b3261e; --cs-bdg: none; --cs-bdt: #b3261e; }
${D} { --cs-trk: rgba(150, 170, 220, 0.13); --cs-ok: linear-gradient(180deg, #c3d1f2, #7d93c6); --cs-okg: 0 0 6px rgba(140, 165, 230, 0.45); --cs-okt: #c3d1f2;
  --cs-wn: linear-gradient(180deg, #f0c878, #c9973c); --cs-wng: 0 0 6px rgba(240, 190, 100, 0.4); --cs-wnt: #f0c878; --cs-bd: #ff4a2a; --cs-bdg: 0 0 6px rgba(255, 70, 40, 0.6); --cs-bdt: #ff6a4a; }
html[data-cs-grab="1"], html[data-cs-grab="1"] * { cursor: grab !important; }
html[data-cs-grab="2"], html[data-cs-grab="2"] * { cursor: grabbing !important; user-select: none !important; }
#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
#cs-fluid { display: block; width: 100%; height: 100%; }
#cs-toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 2147483000; pointer-events: none;
  padding: 6px 14px; border-radius: 999px; background: rgba(14, 16, 26, 0.88); color: #eef3fb; font: 500 13px system-ui, sans-serif;
  opacity: 0; transition: opacity .25s ease; }
#cs-toast.show { opacity: 1; }
`;

  // ---- shaders (uv y up) ------------------------------------------------------------
  const VERT = `precision highp float; attribute vec2 a; uniform vec2 uTx;
varying vec2 v, vL, vR, vT, vB;
void main(){ v = a * .5 + .5; vL = v - vec2(uTx.x, 0.); vR = v + vec2(uTx.x, 0.); vT = v + vec2(0., uTx.y); vB = v - vec2(0., uTx.y);
  gl_Position = vec4(a, 0., 1.); }`;
  const H = 'precision highp float; varying vec2 v, vL, vR, vT, vB;\n';
  const NOISE = `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ return .5 * vnoise(p) + .3 * vnoise(p * 2.1 + 7.3) + .2 * vnoise(p * 4.3 + 1.7); }
`;
  const FS = {
    clear: H + 'uniform sampler2D t0; uniform float uK; void main(){ gl_FragColor = uK * texture2D(t0, v); }',
    splat: H + `uniform sampler2D t0; uniform float uAsp, uR; uniform vec2 uP; uniform vec4 uC;
void main(){ vec2 p = v - uP; p.x *= uAsp; gl_FragColor = vec4(texture2D(t0, v).xyz + exp(-dot(p, p) / uR) * uC.xyz, 1.); }`,
    splat4: H + `uniform sampler2D t0; uniform float uAsp; uniform vec4 uP[4]; uniform vec3 uC[4];
void main(){ vec3 a = texture2D(t0, v).xyz;
  for (int i = 0; i < 4; i++) { vec2 p = v - uP[i].xy; p.x *= uAsp; a += exp(-dot(p, p) / max(uP[i].z, 1e-6)) * uC[i] * uP[i].w; }
  gl_FragColor = vec4(a, 1.); }`,
    advect: H + `uniform sampler2D t0, t1; uniform vec2 uSrcTx; uniform float uDt, uDiss, uManual;
vec4 bil(sampler2D s, vec2 uv, vec2 tx){
  vec2 st = uv / tx - .5, i = floor(st), f = fract(st);
  vec4 a = texture2D(s, (i + vec2(.5, .5)) * tx), b = texture2D(s, (i + vec2(1.5, .5)) * tx);
  vec4 c = texture2D(s, (i + vec2(.5, 1.5)) * tx), d = texture2D(s, (i + vec2(1.5, 1.5)) * tx);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
void main(){
  vec2 vtx = vec2(vR.x - v.x, vT.y - v.y);
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
    // velocity: mask edges curl and push outward -> the outline keeps smoking off
    stir: H + NOISE + `uniform sampler2D t0, t1; uniform float uAmp, uT, uDt;
void main(){
  vec2 vel = texture2D(t0, v).xy;
  float l = texture2D(t1, vL).r, r = texture2D(t1, vR).r, t = texture2D(t1, vT).r, b = texture2D(t1, vB).r;
  vec2 g = vec2(r - l, t - b);
  float n = fbm(v * 9. + vec2(uT * .35, -uT * .22)) * 2. - 1.;
  vec2 f = vec2(-g.y, g.x) * n * 2.0 - g * .7;
  float m = texture2D(t1, v).r;
  gl_FragColor = vec4(clamp((vel + f * uAmp * uDt * 60.) * (1. - m * .6), -1000., 1000.), 0., 1.);   // calm inside the body, turbulent at its edge
}`,
    // dye: re-ink inside the mask toward the body colour, brush-textured
    ink: H + NOISE + `uniform sampler2D t0, t1; uniform vec3 uInk; uniform float uK, uT;
void main(){
  vec4 d = texture2D(t0, v);
  // fast path: far from the silhouette (beyond the noise warp reach) only the thinning applies; skips 4 fbm calls on most of the screen
  vec4 n0 = texture2D(t1, v) + texture2D(t1, v + vec2(.035, 0.)) + texture2D(t1, v - vec2(.035, 0.)) + texture2D(t1, v + vec2(0., .035)) + texture2D(t1, v - vec2(0., .035));
  float near = n0.r + n0.b;
  if (near < .002) { gl_FragColor = vec4(d.rgb * (1. - clamp(uK, 0., 1.) * .45), 1.); return; }
  vec2 wv =v + (vec2(fbm(v * 14. + uT * .2), fbm(v * 14. + 5.2 - uT * .17)) - .5) * .025;
  vec4 mm = texture2D(t1, wv); float m = mm.r, cb = mm.b;
  float e = clamp(abs(texture2D(t1, vR).r - texture2D(t1, vL).r) + abs(texture2D(t1, vT).r - texture2D(t1, vB).r), 0., 1.);
  float streak = smoothstep(.25, .85, fbm(vec2(v.x * 16., v.y * 9.) + vec2(uT * .12, -uT * .07)));
  float wisp = smoothstep(.4, .8, fbm(v * 30. + vec2(uT * .4, -uT * .3)));
  vec3 tgt = uInk * (.6 + 1. * streak);
  float k = clamp(uK, 0., 1.);
  vec3 o = d.rgb * (1. - (1. - m) * k * .45);          // outside the silhouette smoke thins fast
  o = mix(o, tgt, clamp(smoothstep(.2, .85, m) * k * 2., 0., 1.));            // inside it is pulled back to the brush pattern: shape holds
  // cloud (mask blue): a paler, billowing wash held in place the same way as the body
  float bill = fbm(v * 7. + vec2(uT * .05, -uT * .03));
  o = mix(o, uInk * (.25 + .55 * bill), clamp(smoothstep(.04, .8, cb) * k * 1.5, 0., 1.));
  gl_FragColor = vec4(o + max(uInk * e * 2.5 * wisp - o, 0.) * k, 1.);
}`,
    display: H + NOISE + `uniform sampler2D t0, t1, t2; uniform float uDark, uCap, uT, uAsp, uEyeR, uEyeA; uniform vec2 uEye; uniform vec4 uGape, uPearl; uniform vec3 uBg, uInk; uniform vec3 uRing;
void main(){
  vec3 d = max(texture2D(t0, v).rgb, 0.);
  vec3 col;
  // paper with calligraphy (r) and a red seal (g), dry-brush broken; the smoke drifts over it
  vec4 cg = texture2D(t2, v);
  vec3 bg = uBg;
  if (cg.r + cg.g > .004) {   // noise only where there is writing
    vec2 pv = v * vec2(uAsp, 1.);
    float dry = smoothstep(.18, .62, vnoise(pv * vec2(90., 420.)) * .6 + vnoise(pv * 260.) * .4);
    float ink = cg.r * mix(.35, 1., dry), seal = cg.g * mix(.7, 1., vnoise(pv * 300.));
    bg = uDark > .5 ? uBg + vec3(.075, .078, .095) * ink : uBg * (1. - ink * .2);
    bg = mix(bg, uDark > .5 ? vec3(.42, .06, .05) : vec3(.74, .13, .08), seal * (uDark > .5 ? .55 : .7));
  }
  if (uDark > .5) {
    float s = max(d.r, max(d.g, d.b));
    vec3 h = pow(d / (s + .0001), vec3(2.6));
    float b = 1. - exp(-s * 4.5);
    vec3 g = h * b + vec3(pow(b, 6.) * .35);
    col = bg + clamp(g, 0., 1.) * (1. - bg);
    col *= uCap; col = max(col, bg);
  } else {
    vec3 k = min(d, vec3(2.6));   // dense smoke may go near-black
    col = bg * exp(-k);
    col *= mix(.97, 1., smoothstep(1.25, .35, length(v - .5)));
  }
  // glowing red eye: the one crisp thing, tells you where the head is
  vec2 q = (v - uEye) * vec2(uAsp, 1.);
  float r2 = dot(q, q) / (uEyeR * uEyeR);
  float pulse = (.85 + .15 * sin(uT * 3.1)) * uEyeA;
  vec3 red = vec3(1., .1, .03);
  col = mix(col, red, clamp((exp(-r2 * 1.4) + exp(-r2 * .09) * .35) * pulse, 0., 1.));
  col += red * exp(-r2 * .04) * .7 * uDark * pulse;
  col += vec3(1., .75, .45) * exp(-r2 * 7.) * .7 * uEyeA;
  // fire glow in the open mouth (xy = pos, z = radius, w = how open)
  // open-mouth glow: warped, blurred, flickering - no hard wedge edge
  vec2 wg = v + (vec2(vnoise(v * 40. + uT * 3.), vnoise(v * 40. - uT * 2.7 + 9.)) - .5) * .02;
  vec2 o1 = vec2(uGape.z * .35 / uAsp, 0.), o2 = vec2(0., uGape.z * .35);
  float gm = (texture2D(t1, wg).g * 2. + texture2D(t1, wg + o1).g + texture2D(t1, wg - o1).g + texture2D(t1, wg + o2).g + texture2D(t1, wg - o2).g) / 6.;
  gm *= .55 + .7 * vnoise(v * 70. + vec2(uT * 7., -uT * 5.));
  float gl = smoothstep(.02, .7, gm) * uGape.w;
  col = mix(col, mix(vec3(1., .28, .03), vec3(1., .9, .55), smoothstep(.3, .9, gm)), clamp(gl * .9, 0., .9));
  col += vec3(1., .4, .05) * gl * .35 * uDark;
  // pearl (xy = pos, z = radius, w = glow): crisp orb with a swirling core; the body passes in front of it
  vec2 pq = (v - uPearl.xy) * vec2(uAsp, 1.) / uPearl.z;
  float pr = length(pq), occ = 1. - texture2D(t1, v).r * .8 * uRing.z;   // uRing.z = 0 while it sits in the mouth: in front of the jaws
  float core = smoothstep(1., .82, pr) * occ, halo = exp(-pr * pr * .3) * occ;
  float sw = vnoise(pq * 2.6 + vec2(uT * .9, -uT * .7)) * .6 + vnoise(pq * 5. - uT * 1.3) * .4;
  float spec = exp(-dot(pq - vec2(-.32, .34), pq - vec2(-.32, .34)) * 22.);
  if (uDark > .5) {
    vec3 pc = mix(vec3(.45, .75, 1.), vec3(.95, 1., 1.), smoothstep(.85, 0., pr));
    col += pc * halo * .4 * uPearl.w;
    col = mix(col, pc * (.8 + .35 * sw), core);
  } else {
    vec3 pc = mix(vec3(.93, .55, .2), vec3(1., .9, .62), smoothstep(.9, .05, pr));
    col *= 1. - halo * .12 * uPearl.w;                                   // faint ink-wash aura
    col = mix(col, pc * (.85 + .25 * sw), core);
    col *= 1. - exp(-pow((pr - 1.) * 9., 2.)) * .3 * occ;                // thin brush rim
  }
  // swallowed fire: the orb runs hot, then a ring bursts out of it (uRing.xy = radius in pearl radii, strength)
  float heat = clamp((uPearl.w - 1.6) / 3., 0., 1.);
  float rg = exp(-pow((pr - uRing.x) * 1.4, 2.)) * uRing.y * (.55 + .9 * vnoise(pq * .7 + uT * .8));
  if (uDark > .5) { col += vec3(1., .6, .25) * halo * heat * .7; col += vec3(.6, .85, 1.) * rg * .9; }
  else { col = mix(col, vec3(1., .7, .32), clamp(halo * heat * .55, 0., .6)); col *= 1. - rg * .32; }
  col += vec3(1.) * spec * core * .55;
  gl_FragColor = vec4(col, 1.);
}`,
  };

  // ---- palette -----------------------------------------------------------------------
  const BODY = { light: [0.86, 0.84, 0.8], dark: [0.36, 0.42, 0.56] };   // light = absorbance (black ink), dark = emission (silver)
  const FIRE = { light: [[0.08, 0.72, 0.88], [0.02, 0.3, 0.9]], dark: [[1.0, 0.62, 0.12], [1.0, 0.3, 0.05]] };   // vermilion/gold, neon orange/pink

  // ---- GL ------------------------------------------------------------------------------
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const SIM_H = 128, DYE_H = 1024, ITER = 20, MASK_H = 240;   // low-res on purpose: soft edges, fine geometry only leaks as wisps
  const CFG = { velDiss: 0.5, dyeDiss: 0.9, pressK: 0.8, curl: 14, force: 2600, rMove: 0.0014 };
  let styleEl, backdrop, cv, gl, P = {}, half = 0, linear = false, quad = null;
  let vel, dye, prs, div, crl, simW = 0, simH = 0, dyeW = 0, dyeH = 0, maskTex = null, mcv = null, mx = null;
  let raf = 0, last = 0, T = 0, W = 0, Hh = 0, S = 1, dark = false;
  let clearTimer = 0, busyTimer = 0, mounted = false, busy = 0, ptrT = -99, lastAct = 0;
  const ptr = { x: 0, y: 0, px: 0, py: 0, init: false, moved: false };

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
    mcv.height = MASK_H; mcv.width = Math.round(MASK_H * asp);
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
    maskTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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

  // ---- dragon ----------------------------------------------------------------------------
  // All dragon geometry in CSS px, y down. N spine joints, joint 0 = head.
  const N = 54;
  const HS = 1.0;   // head scale vs body radius
  const dg = { roll: 0, rollT: 0, pts: [], prev: [], hx: 0, hy: 0, ang: 0, tx: 0, ty: 0, nextWander: 0, breath: 0, bx: 0, by: 0, roar: 0, jaw: 0, fire: 0, mode: '' };
  const segLen = () => Math.max(12, Hh * 0.03);
  const rad = () => Math.max(14, Hh * 0.056);
  function dragonInit() {
    dg.hx = W * 0.62; dg.hy = Hh * 0.42; dg.ang = Math.PI * 0.85;
    dg.pts = []; dg.prev = []; dg.roll = dg.rollT = Math.cos(dg.ang) < 0 ? 1 : 0;
    const s = segLen();
    for (let i = 0; i < N; i++) {   // start coiled in an S behind the head
      const a = dg.ang + Math.PI + Math.sin(i * 0.22) * 0.9;
      const p = i ? { x: dg.pts[i - 1].x + Math.cos(a) * s, y: dg.pts[i - 1].y + Math.sin(a) * s } : { x: dg.hx, y: dg.hy };
      dg.pts.push(p); dg.prev.push({ x: p.x, y: p.y });
    }
    pl.x = pl.hx = W * 0.3; pl.y = pl.hy = Hh * 0.38; pl.vx = pl.vy = 0; pl.caught = -9;
    pickHome();
  }
  // ---- pearl: the dragon plays with it. It drifts around a home point; when the head reaches it, it darts off to a new home.
  // drag: held by the pointer. thrown: when it was let go with speed (the dragon fetches). held: in the dragon's mouth until.
  // charge: fire swallowed so far; flare: when the swallowed fire burst out as a ring.
  const pl = { x: 0, y: 0, vx: 0, vy: 0, hx: 0, hy: 0, nextHome: 0, caught: -9, drag: false, thrown: -9, held: 0, charge: 0, hot: -9, flare: -9, flareAmt: 0 };
  function pickHome() {
    const m = Math.min(W, Hh) * 0.16;
    for (let k = 0; k < 10; k++) {   // somewhere well away from the head
      pl.hx = m + Math.random() * (W - 2 * m); pl.hy = m + Math.random() * (Hh - 2 * m);
      if (Math.hypot(pl.hx - dg.hx, pl.hy - dg.hy) > Hh * 0.55) break;
    }
    pl.nextHome = T + 8 + Math.random() * 6;
  }
  function spit() {   // let go of the pearl: it shoots out ahead and the dragon gives it a moment before chasing again
    pl.held = 0; pl.vx = Math.cos(dg.ang) * Hh * 0.8; pl.vy = Math.sin(dg.ang) * Hh * 0.8; pl.caught = T + 1; pickHome();
  }
  function pearlUpdate(dt) {
    if (pl.drag) {   // in the hand: follows the pointer, keeps a smoothed velocity for the throw
      const tx = ptr.x * W, ty = (1 - ptr.y) * Hh, k = Math.min(1, dt * 14);
      pl.vx += ((tx - pl.x) / dt - pl.vx) * k; pl.vy += ((ty - pl.y) / dt - pl.vy) * k;
      pl.x = tx; pl.y = ty; pl.nextHome = T + 6; return;
    }
    if (pl.held) {   // in the mouth: rides between the jaws
      const g = gape(); pl.x = g.x; pl.y = g.y; pl.vx = pl.vy = 0;
      if (T > pl.held || busy || dg.roar || cl.ph !== 'off') spit();
      return;
    }
    if (busy) pl.nextHome = T + 4;   // hold still while the dragon circles it
    else if (T > pl.nextHome) pickHome();
    const tx = pl.hx + Math.sin(T * 0.7) * Hh * 0.05, ty = pl.hy + Math.cos(T * 0.93) * Hh * 0.04;
    pl.vx += ((tx - pl.x) * 0.5 - pl.vx * 1.3) * dt; pl.vy += ((ty - pl.y) * 0.5 - pl.vy * 1.3) * dt;
    pl.x += pl.vx * dt; pl.y += pl.vy * dt;
    const m = rad() * 1.5;
    if (pl.x < m || pl.x > W - m) pl.vx *= -0.55;   // a thrown pearl bounces off the edges
    if (pl.y < m || pl.y > Hh - m) pl.vy *= -0.55;
    pl.x = clamp(pl.x, m, W - m); pl.y = clamp(pl.y, m, Hh - m);
    // caught: dart away, roughly along the dragon's heading so it has to turn and follow
    const ex = pl.x - dg.hx, ey = pl.y - dg.hy, d = Math.hypot(ex, ey) || 1;
    if (!busy && dg.breath <= 0 && !dg.roar && d < rad() * 2.6 && T - pl.caught > 1.5) {
      // fetched after a throw, or now and then on its own: it takes the pearl in its mouth and shows it off
      if (T - pl.thrown < 6 || (cl.ph === 'off' && Math.random() < 0.3)) { pl.held = T + 3.5 + Math.random() * 2; pl.thrown = -9; pl.caught = T; return; }
      const ux = ex / d + Math.cos(dg.ang + 0.9 * (Math.random() < 0.5 ? -1 : 1)), uy = ey / d + Math.sin(dg.ang + 0.9 * (Math.random() < 0.5 ? -1 : 1)), l = Math.hypot(ux, uy) || 1;
      pl.vx += ux / l * Hh * 0.9; pl.vy += uy / l * Hh * 0.9; pl.caught = T; pickHome();
    }
  }
  // ---- sniff: pointer left still for a while -> swim over, sniff twice, snort, leave. Once per pointer rest.
  const sn = { done: true, at: 0, step: 0 };
  let wasBusy = 0, busyAt = 0;
  // ---- cloud: every minute or so the dragon dives into a cloud bank that gathers ahead of it, vanishes, and surfaces
  // from a second cloud elsewhere. Body parts inside an active cloud are cut from the mask, so it goes in head first
  // and comes out head first; the ink it leaves behind dissolves into the cloud. A global fade covers the rest of the
  // body once the head is in.
  const cl = { ph: 'off', next: 25, t: 0, headIn: 0, A: null, B: null, fade: 1, out: 0 };
  const cloudR = () => Hh * 0.2;
  function cloudSpot(x, y) { const m = Math.min(W, Hh) * 0.24; const R = cloudR(), puffs = [];
    for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2 + Math.random() * 0.6, r = j ? R * (0.35 + Math.random() * 0.3) : 0;
      puffs.push({ dx: Math.cos(a) * r * 1.4, dy: Math.sin(a) * r * 0.7, r: R * (0.45 + Math.random() * 0.25), ph: Math.random() * 6 }); }
    return { x: clamp(x, m, W - m), y: clamp(y, m, Hh - m), hide: 0, on: true, amt: 0, puffs }; }
  function visAt(x, y) {
    let h = 0;
    for (const c of [cl.A, cl.B]) if (c && c.hide > 0) { const R = cloudR(), d = Math.hypot(x - c.x, y - c.y); h = Math.max(h, c.hide * clamp((R * 0.95 - d) / (R * 0.4), 0, 1)); }
    return cl.fade * (1 - h);
  }
  function cloudUpdate(dt, free, chasing) {
    const R = cloudR();
    if (cl.ph === 'off') {
      if (T > cl.next && free) {
        cl.A = cloudSpot(dg.hx + Math.cos(dg.ang) * Hh * 0.5, dg.hy + Math.sin(dg.ang) * Hh * 0.5);
        cl.ph = 'enter'; cl.t = T; cl.headIn = 0;
      }
    } else if (cl.ph === 'enter') {
      const A = cl.A;
      A.hide = Math.min(1, (T - cl.t) / 1.2);
      if (!cl.headIn && Math.hypot(dg.hx - A.x, dg.hy - A.y) < R * 0.45) cl.headIn = T;
      if (cl.headIn) cl.fade = Math.max(0, 1 - (T - cl.headIn) / 2);
      if ((chasing || busy || T - cl.t > 14) && !cl.headIn) { A.on = false; A.hide = 0; cl.ph = 'off'; cl.next = T + 20; return; }   // interrupted before diving: forget it
      if (cl.headIn && cl.fade <= 0) {
        cl.ph = 'hidden'; cl.t = T; A.on = false;
        let bx = 0, by = 0;
        for (let k = 0; k < 12; k++) { bx = Math.random() * W; by = Math.random() * Hh; if (Math.hypot(bx - A.x, by - A.y) > Math.max(W, Hh) * 0.45) break; }
        cl.B = cloudSpot(bx, by); cl.B.hide = 1;
      }
    } else if (cl.ph === 'hidden') {
      if (T - cl.t > 1.6) {   // the second cloud has gathered: surface from it, heading for the middle of the screen
        cl.ph = 'emerge'; cl.t = T; if (cl.A) cl.A.hide = 0;
        coilAt(cl.B.x, cl.B.y, Math.atan2(Hh / 2 - cl.B.y, W / 2 - cl.B.x) + (Math.random() - 0.5));
      }
    } else if (cl.ph === 'emerge') {
      const B = cl.B, e = T - cl.t;
      cl.fade = Math.min(1, e / 1.5);
      if (e > 5) B.on = false;
      if (e > 4) B.hide = Math.max(0, 1 - (e - 4) / 3);
      if (e > 8) { cl.ph = 'off'; cl.fade = 1; cl.next = T + 45 + Math.random() * 40; }
    }
  }
  function coilAt(x, y, ang) {   // place the whole body wound up tight inside a cloud, head pointing out
    dg.hx = x; dg.hy = y; dg.ang = ang;
    const s = segLen(), rr = cloudR() * 0.4;
    let a = ang + Math.PI, px = x, py = y;
    for (let i = 0; i < N; i++) {
      if (i) { a += s / rr * 0.9; px += Math.cos(a) * s; py += Math.sin(a) * s; }
      dg.pts[i].x = dg.prev[i].x = px; dg.pts[i].y = dg.prev[i].y = py;
    }
    dg.roll = dg.rollT = Math.cos(ang) < 0 ? 1 : 0;
  }
  function cloudFeed(kx, ky, dt) {   // clouds live in the mask (blue); here only their amount and a slow roll of the water
    for (const c of [cl.A, cl.B]) {
      if (!c) continue;
      c.amt = clamp(c.amt + (c.on ? dt / 1.2 : -dt / 2), 0, 1);
      if (c.amt > 0.05) { const a = T * 0.7, sp = Hh * 0.04 * c.amt; splatVel(c.x / W, 1 - c.y / Hh, Math.cos(a) * sp * kx, Math.sin(a) * sp * ky, 0.0025); }
    }
  }
  function drawClouds(c) {   // opaque gradients on purpose: the mask upload is not premultiplied, so alpha would not reach the shader
    c.globalCompositeOperation = 'lighter';
    for (const cc of [cl.A, cl.B]) {
      if (!cc || cc.amt <= 0.01) continue;
      for (const p of cc.puffs) {
        const x = cc.x + p.dx + Math.sin(T * 0.4 + p.ph) * p.r * 0.15, y = cc.y + p.dy + Math.cos(T * 0.33 + p.ph) * p.r * 0.1, r = p.r * (0.6 + 0.4 * cc.amt);
        const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgb(0,0,${Math.round(150 * cc.amt)})`); g.addColorStop(1, 'rgb(0,0,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      }
    }
    c.globalCompositeOperation = 'source-over'; c.fillStyle = '#f00';
  }

  function wrapA(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  // head roll: instead of mirroring the instant the dragon turns past vertical, the head rolls over smoothly (with hysteresis so it never flickers)
  const headFlip = () => Math.cos(dg.roll * Math.PI);
  function updateRoll(dt) {
    if (dg.pts.length < 3) return;
    const ca = Math.cos(Math.atan2(dg.pts[0].y - dg.pts[2].y, dg.pts[0].x - dg.pts[2].x));
    if (ca < -0.3) dg.rollT = 1; else if (ca > 0.3) dg.rollT = 0;
    const d = dg.rollT - dg.roll, step = dt * 1.6;   // ~0.6 s for a full roll
    dg.roll += Math.abs(d) <= step ? d : Math.sign(d) * step;
  }
  function dragonUpdate(dt) {
    updateRoll(dt);
    pearlUpdate(dt);
    const R = rad(), idle = T - ptrT;
    // reply finished: one big breath at the pearl (only after a real reply, not a blip of the busy probe)
    if (busy && !wasBusy) busyAt = T;
    if (!busy && wasBusy && T - busyAt > 2) { dg.roar = T + 2.5; pl.caught = T + 2.5; }   // turn to face the pearl first, then fire
    wasBusy = busy;
    const chasing = idle < 2.5 && ptr.init;
    const px = ptr.x * W, py = (1 - ptr.y) * Hh;
    cloudUpdate(dt, !chasing && !busy && !dg.roar && dg.breath <= 0 && !pl.held && !pl.drag && (sn.done || idle < 6), chasing);
    if (cl.ph === 'hidden') { for (let i = 0; i < N; i++) { dg.prev[i].x = dg.pts[i].x; dg.prev[i].y = dg.pts[i].y; } dg.mode = 'hidden'; return; }
    const diving = cl.ph === 'enter' || (cl.ph === 'emerge' && T - cl.t < 2.5);
    const sniffing = !chasing && !busy && !sn.done && idle > 6 && dg.breath <= 0;
    let mode = 'pearl', near = false;
    if (diving) {
      if (cl.ph === 'enter') { const A = cl.A, oa = Math.atan2(dg.hy - A.y, dg.hx - A.x) + (cl.headIn ? 1.2 : 0), r = cl.headIn ? cloudR() * 0.3 : 0; dg.tx = A.x + Math.cos(oa) * r; dg.ty = A.y + Math.sin(oa) * r; }
      else { dg.tx = dg.hx + Math.cos(dg.ang) * Hh; dg.ty = dg.hy + Math.sin(dg.ang) * Hh; }
      mode = 'cloud';
    } else if (T - pl.thrown < 6 && !pl.drag) { dg.tx = pl.x; dg.ty = pl.y; mode = 'fetch'; }   // thrown: dash after it
    else if (chasing) { dg.tx = px; dg.ty = py; mode = 'chase'; }
    else if (busy) {   // thinking: coil slowly around the pearl, aiming a little ahead on the circle
      const oa = Math.atan2(dg.hy - pl.y, dg.hx - pl.x) + 0.8, r = Hh * 0.26;
      dg.tx = pl.x + Math.cos(oa) * r; dg.ty = pl.y + Math.sin(oa) * r; mode = 'think';
    } else if (sniffing) {
      dg.tx = px; dg.ty = py; mode = 'sniff';
      const sx = px - dg.hx, sy = py - dg.hy;
      near = Math.hypot(sx, sy) < R * 3.2;
      if (near && !sn.at) sn.at = T;
      if (sn.at) sniffFx(T - sn.at, px, py);
      if (sn.at && T - sn.at > 2.8) { sn.done = true; sn.at = 0; pickHome(); }   // bored: off to the pearl, far side
    } else if (pl.held) {   // pearl in its mouth: a slow lap of the screen to show it off
      dg.tx = W / 2 + Math.cos(T * 0.45) * W * 0.32; dg.ty = Hh / 2 + Math.sin(T * 0.45) * Hh * 0.28; mode = 'hold';
    } else { dg.tx = pl.x; dg.ty = pl.y; }
    dg.mode = mode;
    let want = Math.atan2(dg.ty - dg.hy, dg.tx - dg.hx);
    if (dg.roar) {
      want = Math.atan2(pl.y - dg.hy, pl.x - dg.hx);
      if (Math.abs(wrapA(want - dg.ang)) < 0.35 || T > dg.roar) { startBreath(pl.x, pl.y, 1.3); dg.roar = 0; }
    }
    if (dg.breath > 0) want = Math.atan2(dg.by - dg.hy, dg.bx - dg.hx);
    const turn = (dg.breath > 0 || dg.roar ? 2.2 : mode === 'sniff' ? (near ? 1.4 : 0.9) : mode === 'chase' ? 0.9 : mode === 'fetch' ? 1.6 : mode === 'think' ? 0.7 : mode === 'cloud' ? 1.0 : 0.6) * dt;   // wide turns keep the body in open S-curves
    dg.ang += clamp(wrapA(want - dg.ang), -turn, turn);
    dg.ang += Math.sin(T * 1.3) * (mode === 'sniff' && near ? 0.3 : 0.7) * dt;   // serpentine sway, travels down the body through follow-the-leader
    const calm = !busy && T - lastAct > 20 && mode === 'pearl';
    const sp = Hh * (dg.breath > 0 || dg.roar ? 0.05 : mode === 'sniff' ? (near ? 0.035 : 0.13) : mode === 'think' ? 0.085 : mode === 'cloud' ? 0.1 : mode === 'fetch' ? 0.28 : mode === 'hold' ? 0.1 : calm ? 0.07 : chasing ? 0.2 : 0.12);
    dg.hx += Math.cos(dg.ang) * sp * dt; dg.hy += Math.sin(dg.ang) * sp * dt;
    // soft walls
    const m = Math.min(W, Hh) * 0.14;
    if (dg.hx < m || dg.hx > W - m || dg.hy < m || dg.hy > Hh - m) dg.ang += clamp(wrapA(Math.atan2(Hh / 2 - dg.hy, W / 2 - dg.hx) - dg.ang), -1.4 * dt, 1.4 * dt);
    const s = segLen();
    for (let i = 0; i < N; i++) { dg.prev[i].x = dg.pts[i].x; dg.prev[i].y = dg.pts[i].y; }
    dg.pts[0].x = dg.hx; dg.pts[0].y = dg.hy;
    for (let i = 1; i < N; i++) {
      const a = dg.pts[i - 1], b = dg.pts[i], ex = b.x - a.x, ey = b.y - a.y, l = Math.hypot(ex, ey) || 1;
      b.x = a.x + ex / l * s; b.y = a.y + ey / l * s;
    }
    dg.breath = Math.max(0, dg.breath - dt);
    dg.jaw += ((dg.breath > 0 ? 1 : pl.held ? 0.42 : 0) - dg.jaw) * Math.min(1, dt * 8);   // a little open around the pearl
    dg.fire += ((dg.breath > 0 ? 1 : 0) - dg.fire) * Math.min(1, dt * 8);
  }
  function startBreath(x, y, dur) { dg.bx = x; dg.by = y; dg.breath = dur; }
  // sniff effects, t = seconds since the head arrived: two inhales draw smoke from the cursor into the nose, then a snort
  function sniffFx(t, px, py) {
    const n = headPt(2.75, -0.3), kx = simW / Math.max(1, W), ky = simH / Math.max(1, Hh), b = dark ? BODY.dark : BODY.light;
    if ((t > 0.3 && t < 0.75) || (t > 1.1 && t < 1.55)) {
      const l = Math.max(1, Math.hypot(n.x - px, n.y - py)), ux = (n.x - px) / l, uy = (n.y - py) / l, sp = Hh * 0.7;
      splat(px / W, 1 - py / Hh, ux * sp * kx, -uy * sp * ky, b.map(v => v * 0.12), 0.0004);
      splatVel((px + n.x) / 2 / W, 1 - (py + n.y) / 2 / Hh, ux * sp * kx, -uy * sp * ky, 0.0007);
    }
    if (t > 2.0 && t < 2.2) {   // snort: two short jets out of the nostrils, sideways off the snout
      const a = Math.atan2(dg.pts[0].y - dg.pts[2].y, dg.pts[0].x - dg.pts[2].x), sp = Hh * 1.4;
      for (const s of [-0.9, 0.9]) splat(n.x / W, 1 - n.y / Hh, Math.cos(a + s) * sp * kx, -Math.sin(a + s) * sp * ky, b.map(v => v * 0.35), 0.0005);
    }
  }
  const radAt = (t) => {   // body thickness profile, t = 0 head .. 1 tail
    const R = rad();
    if (t < 0.06) return R * (0.75 + t / 0.06 * 0.25);
    return R * Math.max(0.12, 1 - Math.pow((t - 0.06) / 0.94, 1.9) * 0.88) * (0.92 + 0.08 * Math.sin(t * 40));
  };
  function drawMask() {
    const k = mcv.height / Math.max(1, Hh), c = mx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, mcv.width, mcv.height);
    c.setTransform(k, 0, 0, k, 0, 0);
    c.fillStyle = '#f00'; c.strokeStyle = '#f00'; c.lineCap = 'round'; c.lineJoin = 'round';
    const pts = dg.pts, R = rad();
    // body tube
    for (let i = 1; i < N; i++) {
      const t = i / (N - 1);
      c.lineWidth = radAt(t) * 2;
      c.globalAlpha = (t > 0.68 ? Math.pow(1 - (t - 0.68) / 0.32, 1.6) : 1) * visAt(pts[i].x, pts[i].y);   // last third: shape lets go, tail is only smoke
      c.beginPath(); c.moveTo(pts[i - 1].x, pts[i - 1].y); c.lineTo(pts[i].x, pts[i].y); c.stroke();
    }
    c.globalAlpha = 1;
    const nrm = (i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l, dx / l, dy / l]; };
    // dorsal fin spikes along the back
    for (let i = 3; i < Math.round(N * 0.66); i += 2) {   // spikes stop before the tail
      const t = i / (N - 1), [nx, ny, tx, ty] = nrm(i), r = radAt(t), h = r * (0.7 + 0.3 * Math.sin(i));
      const bx = pts[i].x + nx * r * 0.8, by = pts[i].y + ny * r * 0.8;
      c.globalAlpha = visAt(pts[i].x, pts[i].y);
      c.beginPath(); c.moveTo(bx - tx * r * 0.5, by - ty * r * 0.5); c.lineTo(bx + nx * h + tx * r * 0.6, by + ny * h + ty * r * 0.6); c.lineTo(bx + tx * r * 0.5, by + ty * r * 0.5); c.fill();
    }
    // tapered filled stroke along a polyline: pointed, no round caps (round caps read as paddles once blurred)
    const taper = (P, w0, w1) => {
      const n = P.length, Lp = [], Rp = [];
      for (let k = 0; k < n; k++) {
        const a = P[Math.max(0, k - 1)], b = P[Math.min(n - 1, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        const w = (w0 + (w1 - w0) * k / (n - 1)) / 2, ox = -dy / l * w, oy = dx / l * w;
        Lp.push([P[k][0] + ox, P[k][1] + oy]); Rp.push([P[k][0] - ox, P[k][1] - oy]);
      }
      c.beginPath(); c.moveTo(Lp[0][0], Lp[0][1]); for (const q of Lp.slice(1)) c.lineTo(q[0], q[1]);
      for (const q of Rp.reverse()) c.lineTo(q[0], q[1]); c.closePath(); c.fill();
    };
    const curve = (x0, y0, x1, y1, x2, y2, n) => { const P = []; for (let k = 0; k <= n; k++) { const u = k / n, v = 1 - u; P.push([v * v * x0 + 2 * v * u * x1 + u * u * x2, v * v * y0 + 2 * v * u * y1 + u * u * y2]); } return P; };
    // legs: tapered thigh + shin, three hooked claws
    for (const [t, side] of [[0.16, 1], [0.22, -1], [0.5, 1], [0.56, -1]]) {
      const i = Math.round(t * (N - 1)), [nx, ny, tx, ty] = nrm(i), r = radAt(t);
      const sw = Math.sin(T * 3 + i) * 0.4, ox = -nx * side, oy = -ny * side;   // outward from the body
      c.globalAlpha = visAt(pts[i].x, pts[i].y);
      const kx = pts[i].x + ox * r * 1.7 + tx * r * (0.8 + sw), ky = pts[i].y + oy * r * 1.7 + ty * r * (0.8 + sw);
      const fx = kx + ox * r * 0.6 - tx * r * 0.7, fy = ky + oy * r * 0.6 - ty * r * 0.7;   // shin bends forward
      taper(curve(pts[i].x, pts[i].y, (pts[i].x + kx) / 2 + ox * r * 0.3, (pts[i].y + ky) / 2 + oy * r * 0.3, kx, ky, 6), r * 0.8, r * 0.34);
      taper(curve(kx, ky, (kx + fx) / 2, (ky + fy) / 2, fx, fy, 4), r * 0.34, r * 0.22);
      for (let j = -1; j <= 1; j++) {   // claws splay forward and hook inward at the tip
        const dx = -tx * 0.6 + ox * 0.5 + (tx * 0.2 + ox * 0.0) * j, dy = -ty * 0.6 + oy * 0.5 + ty * 0.2 * j;
        const ex = fx + (dx - tx * 0.0) * r * 0.75 + j * (ox * 0.3 - tx * 0.3) * r * 0.5, ey = fy + dy * r * 0.75 + j * (oy * 0.3 - ty * 0.3) * r * 0.5;
        taper(curve(fx, fy, ex + ox * r * 0.15, ey + oy * r * 0.15, ex - ox * r * 0.25 - tx * r * 0.1, ey - oy * r * 0.25 - ty * r * 0.1, 5), r * 0.2, 0);
      }
    }
    // tail tuft: one soft diamond of hair past the tip, curved sides, swaying; mask is blurred so it reads as a smoky lozenge
    { const i = N - 1, [nx, ny, tx, ty] = nrm(i - 1), r = R * 0.55, w = Math.sin(T * 2.2) * 0.25;
      const P = (u, v) => [pts[i].x + tx * u * r + nx * (v + w * u * 0.4) * r, pts[i].y + ty * u * r + ny * (v + w * u * 0.4) * r];
      const b = P(-0.4, 0), s1 = P(1.3, 1.05), e = P(3.4, 0), s2 = P(1.3, -1.05);
      const c1 = P(0.3, 0.9), c2 = P(2.6, 0.75), c3 = P(2.6, -0.75), c4 = P(0.3, -0.9);
      c.globalAlpha = 0.28 * visAt(pts[i].x, pts[i].y);
      c.beginPath(); c.moveTo(b[0], b[1]); c.quadraticCurveTo(c1[0], c1[1], s1[0], s1[1]); c.quadraticCurveTo(c2[0], c2[1], e[0], e[1]);
      c.quadraticCurveTo(c3[0], c3[1], s2[0], s2[1]); c.quadraticCurveTo(c4[0], c4[1], b[0], b[1]); c.fill();
      c.globalAlpha = 1; }
    // head, in head space: +x forward, +y = right side
    const a = Math.atan2(pts[0].y - pts[2].y, pts[0].x - pts[2].x);
    c.globalAlpha = visAt(pts[0].x, pts[0].y);
    if (c.globalAlpha <= 0.01) { c.globalAlpha = 1; drawClouds(c); return; }
    c.save(); c.translate(pts[0].x, pts[0].y); c.rotate(a);
    const flip = headFlip();   // keep the head upright: horns up on screen, rolled over smoothly
    c.scale(HS, HS * flip);   // head reads bigger than the body tube
    const jaw = dg.jaw * 0.95;
    // mane: strands flowing back from the neck
    c.lineWidth = R * 0.14;
    for (let j = 0; j < 9; j++) {
      const ox = -R * (0.2 + j * 0.28), oy = -R * (0.55 + (j % 3) * 0.12), w = Math.sin(T * 3.2 + j * 0.9);
      c.beginPath(); c.moveTo(ox, oy);
      c.bezierCurveTo(ox - R * 0.9, oy - R * (0.8 + w * 0.3), ox - R * 1.6, oy - R * (0.2 - w * 0.4), ox - R * (2.4 + j * 0.1), oy - R * (0.9 + w * 0.5)); c.stroke();
    }
    // skull + brow
    c.beginPath(); c.ellipse(0, 0, R * 1.25, R * 0.85, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(R * 0.3, -R * 0.9); c.lineTo(R * 1.1, -R * 0.75); c.lineTo(R * 0.7, -R * 0.35); c.fill();
    // jaws share one hinge P; gape = triangle hinge / upper-jaw tip / lower-jaw tip, so cut and jaws always line up
    const PX = R * 0.35, PY = R * 0.18, cj = Math.cos(jaw), sj = Math.sin(jaw);
    const lj = (x, y) => [PX + (x * cj - y * sj) * R, PY + (x * sj + y * cj) * R];   // lower-jaw frame -> head space
    // upper jaw: long snout, brow ridge, nose that turns up, smooth underside
    c.beginPath(); c.moveTo(R * 0.1, -R * 0.62);
    c.quadraticCurveTo(R * 1.4, -R * 0.62, R * 2.35, -R * 0.42);
    c.quadraticCurveTo(R * 2.75, -R * 0.62, R * 2.85, -R * 0.22);
    c.quadraticCurveTo(R * 2.8, R * 0.08, R * 2.4, R * 0.1);
    c.quadraticCurveTo(R * 1.3, R * 0.2, PX, PY); c.closePath(); c.fill();
    if (dg.jaw > 0.08) {   // clear the gape, glow the throat
      const L0 = lj(2.15, 0);
      c.beginPath(); c.moveTo(PX, PY); c.lineTo(R * 2.35, R * 0.1); c.lineTo(L0[0], L0[1]); c.closePath();
      c.globalCompositeOperation = 'destination-out'; c.fill();
      const gr = c.createLinearGradient(PX, PY, R * 2.3, PY); gr.addColorStop(0, 'rgb(0,255,0)'); gr.addColorStop(1, 'rgb(0,30,0)');
      c.globalCompositeOperation = 'lighter'; c.fillStyle = gr; c.fill();
      c.globalCompositeOperation = 'source-over'; c.fillStyle = '#f00';
      // upper fang hanging into the gape
      c.beginPath(); c.moveTo(R * 1.85, R * 0.14); c.lineTo(R * 2.0, R * 0.48); c.lineTo(R * 2.12, R * 0.12); c.fill();
    }
    // lower jaw, drawn after the cut: tapered, pointed chin that tips up, a fang, beard below
    { const q = [[-0.1, 0.0], [2.2, 0.02], [2.45, -0.14], [2.15, 0.3], [1.0, 0.46], [-0.1, 0.34]].map(([x, y]) => lj(x, y));
      c.beginPath(); c.moveTo(q[0][0], q[0][1]); c.lineTo(q[1][0], q[1][1]); c.quadraticCurveTo(q[2][0], q[2][1], q[3][0], q[3][1]);
      c.quadraticCurveTo(q[4][0], q[4][1], q[5][0], q[5][1]); c.closePath(); c.fill();
      if (dg.jaw > 0.08) { const f = [[1.75, 0], [1.88, -0.32], [2.0, 0]].map(([x, y]) => lj(x, y));
        c.beginPath(); c.moveTo(f[0][0], f[0][1]); c.lineTo(f[1][0], f[1][1]); c.lineTo(f[2][0], f[2][1]); c.fill(); }
      c.lineWidth = R * 0.1;
      for (let j = 0; j < 4; j++) { const s0 = lj(0.3 + j * 0.35, 0.4), s1 = lj(0.15 + j * 0.3, 0.9), s2 = lj(-0.15 + j * 0.25, 1.15 + Math.sin(T * 3 + j) * 0.15);
        c.beginPath(); c.moveTo(s0[0], s0[1]); c.quadraticCurveTo(s1[0], s1[1], s2[0], s2[1]); c.stroke(); } }
    // horns: tapered filled blades sweeping back to needle tips, with forward-raking tines; no round caps
    for (const hz of [-1, 1]) {
      const bx = -R * 0.1 + hz * R * 0.12, by = -R * 0.7;
      taper(curve(bx, by, -R * 0.7, -R * 1.9, -R * 2.9, -R * (2.05 + hz * 0.2), 10), R * 0.38, 0);
      taper(curve(-R * 0.75, -R * 1.45, -R * 0.75, -R * 2.05, -R * 0.35, -R * 2.6, 6), R * 0.22, 0);
      taper(curve(-R * 1.6, -R * 1.8, -R * 1.7, -R * 2.35, -R * 1.35, -R * 2.85, 6), R * 0.18, 0);
    }
    // long whiskers from the snout, trailing and waving
    c.lineWidth = R * 0.08;
    for (const hz of [-1, 1]) {
      const w1 = Math.sin(T * 2.4 + hz), w2 = Math.sin(T * 1.7 + hz * 2);
      c.beginPath(); c.moveTo(R * 2.4, -R * 0.2);
      c.bezierCurveTo(R * 2.2, -R * (1.4 + w1 * 0.4), R * 0.4, -R * (0.6 - w2 * 0.6) + hz * R * 0.4, -R * 3.5, -R * (0.4 + w1 * 0.9) + hz * R * 0.6); c.stroke();
    }
    c.globalCompositeOperation = 'destination-out';
    // eye: cut a hole so it reads as a bright eye in light mode
    c.beginPath(); c.ellipse(R * 0.55, -R * 0.38, R * 0.2, R * 0.11, -0.2, 0, Math.PI * 2); c.fill();
    c.globalCompositeOperation = 'source-over';
    c.restore(); c.globalAlpha = 1;
    drawClouds(c);
  }
  // ---- calligraphy: a big running-script column 雲從龍 ("clouds follow the dragon", I Ching), a small column 飛龍在天,
  // and a red seal 墨龍 with the characters cut out. r = ink, g = seal. Redrawn only on resize. System fonts only.
  const FONT = '"STXingkai","华文行楷","STKaiti","KaiTi","Kaiti SC",serif';
  let calTex = null;
  function buildCalli() {
    const w = cv.width, h = cv.height, k = h / Math.max(1, Hh), c = document.createElement('canvas').getContext('2d');
    c.canvas.width = w; c.canvas.height = h;
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'lighter'; c.textAlign = 'center'; c.textBaseline = 'middle';
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const column = (txt, x, y, size, alpha) => {
      c.fillStyle = `rgba(255,0,0,${alpha})`;
      for (const ch of txt) {
        const sz = size * (0.92 + rnd() * 0.18);
        c.save(); c.translate(x + (rnd() - 0.5) * size * 0.08, y + sz / 2); c.rotate((rnd() - 0.5) * 0.12);
        c.font = `${Math.round(sz)}px ${FONT}`; c.fillText(ch, 0, 0); c.restore();
        y += sz * 0.98;
      }
      return y;
    };
    const big = Hh * 0.12 * k, small = Hh * 0.042 * k, x0 = w - big * 0.85;
    column('雲從龍', x0, h * 0.08, big, 1);
    const ys = column('飛龍在天', x0 - big * 0.95, h * 0.13, small, 0.9);
    // seal: square, slightly rough edge, characters knocked out
    const ss = small * 1.5, sc = document.createElement('canvas').getContext('2d');
    sc.canvas.width = sc.canvas.height = Math.ceil(ss);
    sc.fillStyle = '#0f0'; sc.beginPath();
    sc.moveTo(ss * 0.03, ss * 0.05); sc.lineTo(ss * 0.97, ss * 0.02); sc.lineTo(ss * 0.98, ss * 0.96); sc.lineTo(ss * 0.04, ss * 0.98); sc.closePath(); sc.fill();
    sc.globalCompositeOperation = 'destination-out'; sc.textAlign = 'center'; sc.textBaseline = 'middle';
    sc.font = `${Math.round(ss * 0.44)}px "STKaiti","KaiTi",serif`;
    sc.fillText('墨', ss * 0.5, ss * 0.28); sc.fillText('龍', ss * 0.5, ss * 0.72);
    c.drawImage(sc.canvas, x0 - big * 0.95 - ss / 2, ys + small * 0.4);
    if (!calTex) {
      calTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, calTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    gl.bindTexture(gl.TEXTURE_2D, calTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c.canvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }
  function uploadMask() {
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mcv);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }
  // eye position in CSS px (head space (0.55R, -0.38R) at head scale 1.35, horns-up flip)
  function headPt(lx, ly) {   // head space (units of R, x forward, y down-right) -> CSS px; matches drawMask's scale 1.35 + flip
    if (dg.pts.length < 3) return { x: -1e4, y: -1e4 };   // render can run before dragonInit
    const p0 = dg.pts[0], p2 = dg.pts[2], a = Math.atan2(p0.y - p2.y, p0.x - p2.x), R = rad() * HS;
    const f = headFlip(), x = lx * R, y = ly * R * f;
    return { x: p0.x + Math.cos(a) * x - Math.sin(a) * y, y: p0.y + Math.sin(a) * x + Math.cos(a) * y };
  }
  const eye = () => headPt(0.55, -0.38);
  const gape = () => { const j = dg.jaw * 0.95; return headPt((0.7 + 2.35 + 2.15 * Math.cos(j)) / 3, (0.36 + 0.1 + 2.15 * Math.sin(j)) / 3); };   // middle of the open mouth
  // mouth position in CSS px
  function mouth() {
    const p0 = dg.pts[0], p2 = dg.pts[2], a = Math.atan2(p0.y - p2.y, p0.x - p2.x), R = rad();
    const g = gape(); return { x: g.x + Math.cos(a) * R * 0.8, y: g.y + Math.sin(a) * R * 0.8, a };
  }

  // ---- simulation ------------------------------------------------------------------------
  function splatVel(x, y, dx, dy, r) {
    pass('splat', vel.b, [vel.a.tex], { uP: [x, y], uR: r, uAsp: cv.width / Math.max(1, cv.height), uC: [dx, dy, 0, 0] }); vel.swap();
  }
  function splat(x, y, dx, dy, color, r) {
    splatVel(x, y, dx, dy, r);
    dyeQ.push([x, y, r, color]);   // dye splats are batched: one full-res pass per 4 instead of one each
  }
  const dyeQ = [];
  function flushDye() {
    while (dyeQ.length) {
      const b = dyeQ.splice(0, 4), P4 = new Float32Array(16), C4 = new Float32Array(12);
      b.forEach(([x, y, r, c], i) => { P4.set([x, y, r, 1], i * 4); C4.set([c[0], c[1], c[2]], i * 3); });
      const pr = P.splat4; gl.useProgram(pr.p);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dye.b.fb); gl.viewport(0, 0, dye.b.w, dye.b.h);
      gl.uniform2fv(pr.u('uTx'), dye.tx);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, dye.a.tex); gl.uniform1i(pr.u('t0'), 0);
      gl.uniform1f(pr.u('uAsp'), cv.width / Math.max(1, cv.height));
      gl.uniform4fv(pr.u('uP[0]'), P4); gl.uniform3fv(pr.u('uC[0]'), C4);
      gl.drawArrays(gl.TRIANGLES, 0, 3); dye.swap();
    }
  }
  function step(dt) {
    pass('curl', crl, [vel.a.tex], {});
    pass('vorticity', vel.b, [vel.a.tex, crl.tex], { uCurl: CFG.curl, uDt: dt }); vel.swap();
    pass('stir', vel.b, [vel.a.tex, maskTex], { uAmp: busy ? 8 : 6, uT: T, uDt: dt }); vel.swap();
    pass('divergence', div, [vel.a.tex], {});
    pass('clear', prs.b, [prs.a.tex], { uK: CFG.pressK }); prs.swap();
    for (let i = 0; i < ITER; i++) { pass('pressure', prs.b, [prs.a.tex, div.tex], {}); prs.swap(); }
    pass('gradient', vel.b, [prs.a.tex, vel.a.tex], {}); vel.swap();
    pass('advect', vel.b, [vel.a.tex, vel.a.tex], { uDt: dt, uDiss: CFG.velDiss, uSrcTx: vel.tx, uManual: linear ? 0 : 1 }); vel.swap();
    pass('advect', dye.b, [vel.a.tex, dye.a.tex], { uDt: dt, uDiss: CFG.dyeDiss, uSrcTx: dye.tx, uManual: linear ? 0 : 1 }, vel.tx); dye.swap();
    pass('ink', dye.b, [dye.a.tex, maskTex], { uInk: dark ? BODY.dark : BODY.light, uK: dt * 4, uT: T }, [1 / mcv.width, 1 / mcv.height]); dye.swap();
  }
  function render() {
    const e = eye();
    pass('display', null, [dye.a.tex, maskTex, calTex], { uEyeA: visAt(dg.pts[0]?.x ?? 0, dg.pts[0]?.y ?? 0), uDark: dark ? 1 : 0, uCap: CAP_DARK, uBg: dark ? NIGHT : PAPER, uInk: dark ? BODY.dark : BODY.light, uT: T,
      uAsp: W / Math.max(1, Hh), uEye: [e.x / W, 1 - e.y / Hh], uEyeR: rad() * 0.34 / Math.max(1, Hh),
      uGape: (() => { const g = gape(); return [g.x / W, 1 - g.y / Hh, rad() * 0.9 / Math.max(1, Hh), clamp(Math.min(dg.jaw, dg.fire), 0, 1)]; })(),
      ...(() => { const fl = Math.max(0, 1 - (T - pl.flare) / 0.9), a = pl.flareAmt;
        return { uPearl: [pl.x / W, 1 - pl.y / Hh, rad() * 0.5 * (1 + 0.18 * pl.charge + 0.3 * fl * a) / Math.max(1, Hh), (busy ? 1.4 + 0.6 * Math.sin(T * 4) : 1) + pl.charge * 2.6 + fl * fl * a * 3],
          uRing: [1 + (1 - fl) * 22, fl * Math.min(1, a), pl.held ? 0 : 1] }; })() });
  }
  function inputs(dt) {
    dragonUpdate(dt);
    // body pushes the water along with its motion (every 3rd joint)
    const kx = simW / Math.max(1, W), ky = simH / Math.max(1, Hh);
    for (let i = 0; i < N; i += 3) {
      const p = dg.pts[i], q = dg.prev[i], vx = (p.x - q.x) / dt, vy = (p.y - q.y) / dt;
      splatVel(p.x / W, 1 - p.y / Hh, vx * kx * 0.5, -vy * ky * 0.5, 0.0006);
    }
    cloudFeed(kx, ky, dt);
    // pearl stirs the water as it moves and sheds a faint trail of light
    { const v = Math.hypot(pl.vx, pl.vy);
      if (v > Hh * 0.05) splat(pl.x / W, 1 - pl.y / Hh, pl.vx * kx * 0.6, -pl.vy * ky * 0.6, dark ? [0.04, 0.07, 0.1] : [0.01, 0.025, 0.07], 0.0003); }
    // tail tip trails a thin wisp of smoke for the water to carry off
    { const p = dg.pts[N - 1], q = dg.pts[N - 4], ex = p.x - q.x, ey = p.y - q.y, l = Math.hypot(ex, ey) || 1, b = dark ? BODY.dark : BODY.light, sp = Hh * 0.25;
      splat(p.x / W, 1 - p.y / Hh, ex / l * sp * kx, -ey / l * sp * ky, b.map(v => v * 0.22), 0.00035); }
    // fire
    if (dg.breath > 0 && dg.jaw > 0.4) {
      const m = mouth(), pal = dark ? FIRE.dark : FIRE.light, sp = Hh * 2.6;
      for (let j = 0; j < 3; j++) {   // thick, roaring cone: several puffs per frame, wider spread, hotter core
        const a = m.a + (Math.random() - 0.5) * 0.55, f = Math.random();
        const col = pal[0].map((v, c) => (v + (pal[1][c] - v) * f) * (dark ? 1.6 : 1.25));
        splat(m.x / W, 1 - m.y / Hh, Math.cos(a) * sp * kx, -Math.sin(a) * sp * ky, col, 0.0012 + Math.random() * 0.0012);
      }
      // the pearl in the line of fire swallows it: the flame curls round it (a swirl, not a sink - the water can't be squeezed) and the orb runs hot
      const ex = pl.x - m.x, ey = pl.y - m.y, ed = Math.hypot(ex, ey);
      if (!pl.held && !pl.drag && ed < Hh * 0.95 && Math.abs(wrapA(Math.atan2(ey, ex) - m.a)) < 0.45) {
        pl.charge = Math.min(1.5, pl.charge + dt * 1.3); pl.hot = T;
        for (let j = 0; j < 3; j++) { const a = j * Math.PI * 2 / 3 + T * 2, r = rad() * 1.1, sp2 = Hh * 0.45;
          splatVel((pl.x + Math.cos(a) * r) / W, 1 - (pl.y + Math.sin(a) * r) / Hh, -Math.sin(a) * sp2 * kx, -Math.cos(a) * sp2 * ky, 0.0003); }
      }
    }
    // fire has stopped: what the pearl swallowed bursts out as a ring that shoves the smoke away
    if (pl.charge > 0 && T - pl.hot > 0.3) {
      if (pl.charge > 0.2) {
        const a0 = pl.charge, col = dark ? [0.2, 0.36, 0.55] : [0.1, 0.26, 0.45];
        for (let j = 0; j < 12; j++) { const a = j / 12 * Math.PI * 2, r = rad() * 0.7, sp = Hh * 1.2 * Math.min(1.2, a0), x = (pl.x + Math.cos(a) * r) / W, y = 1 - (pl.y + Math.sin(a) * r) / Hh;
          if (j % 3) splatVel(x, y, Math.cos(a) * sp * kx, -Math.sin(a) * sp * ky, 0.0004);   // mostly a shove; every 3rd puff leaves a little pearl-coloured wash
          else splat(x, y, Math.cos(a) * sp * kx, -Math.sin(a) * sp * ky, col.map(v => v * 0.35 * Math.min(1, a0)), 0.0003); }
        pl.flare = T; pl.flareAmt = Math.min(1.3, a0);
      }
      pl.charge = 0;
    }
    if (ptr.moved) {
      ptr.moved = false;
      let dx = ptr.x - ptr.px, dy = ptr.y - ptr.py;
      ptr.px = ptr.x; ptr.py = ptr.y;
      const asp = cv.width / Math.max(1, cv.height);
      if (asp < 1) dx *= asp; else dy /= asp;
      if (Math.hypot(dx, dy) > 1e-5) splatVel(ptr.x, ptr.y, dx * CFG.force, dy * CFG.force, CFG.rMove);
    }
    if (busy) lastAct = T;
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const el = now - last;
    const active = busy || T - ptrT < 3 || dg.breath > 0;
    if (el < (active ? 31 : (T - lastAct < 20 ? 36 : 60))) return;   // dragon always moves: ~30 / ~28 / ~16 fps
    const dt = Math.min(el / 1000, 1 / 30);
    T += dt; last = now;
    inputs(dt); flushDye(); drawMask(); uploadMask(); step(dt); render();
  }
  function resize() {
    W = innerWidth; Hh = innerHeight; S = Math.min(1.25, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(W * S)); cv.height = Math.max(1, Math.round(Hh * S));
    if (!gl) return;
    if (!vel || Math.abs(simW / simH - W / Math.max(1, Hh)) > 0.02) { buildTargets(); dragonInit(); }
    buildCalli();
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
  // ---- usage band: the mod paints its bars as Boxes with inline green/yellow/red/grey; tag each by level so the CSS can
  // recolour them in ink. Inline values are resolved to rgb once each (they may be CSS vars), then cached.
  const lvOf = new Map();
  function levelOf(el, prop) {
    const raw = el.style[prop];
    if (!raw) return '';
    if (lvOf.has(raw)) return lvOf.get(raw);
    const p = document.createElement('i'); p.style.color = raw; el.parentElement.appendChild(p);
    const m = (getComputedStyle(p).color.match(/[\d.]+/g) || []).map(Number); p.remove();
    let lv = '';
    if (m.length >= 3) {
      const [r, g, b, a = 1] = m, spread = Math.max(r, g, b) - Math.min(r, g, b);
      if (spread < 30) lv = a > 0.5 ? 'tick' : 'track';
      else if (g >= r && g > b) lv = 'ok';
      else if (r > 150 && g > 100 && b < 120) lv = 'warn';
      else if (r > g && r > b) lv = 'bad';
    }
    lvOf.set(raw, lv); return lv;
  }
  const BAND_CSS = `
[data-cs-bar] { border-radius: 3px; overflow: hidden; }
[data-cs-lv], [data-cs-tx] { transition: none !important; }   /* re-rendered nodes start green: never animate from it */
[data-cs-lv="track"] { background: var(--cs-trk) !important; }
[data-cs-lv="ok"] { background: var(--cs-ok) !important; box-shadow: var(--cs-okg); }
[data-cs-lv="warn"] { background: var(--cs-wn) !important; box-shadow: var(--cs-wng); }
[data-cs-lv="bad"], [data-cs-lv="tick"] { background: var(--cs-bd) !important; box-shadow: var(--cs-bdg); }
[data-cs-tx="ok"] { color: var(--cs-okt) !important; }
[data-cs-tx="warn"] { color: var(--cs-wnt) !important; }
[data-cs-tx="bad"] { color: var(--cs-bdt) !important; }`;
  let bandRow = null, bandObs = null, bandStyle = null;
  function tagBandKids() {
    if (!bandRow) return;
    for (const el of bandRow.querySelectorAll('*')) {
      if (el.style.backgroundColor) {
        const lv = levelOf(el, 'backgroundColor');
        if (lv) { if (el.getAttribute('data-cs-lv') !== lv) el.setAttribute('data-cs-lv', lv); if (!el.parentElement.hasAttribute('data-cs-bar')) el.parentElement.setAttribute('data-cs-bar', ''); }
      } else if (el.style.color && !el.childElementCount) {
        const lv = levelOf(el, 'color');
        if (lv === 'ok' || lv === 'warn' || lv === 'bad') { if (el.getAttribute('data-cs-tx') !== lv) el.setAttribute('data-cs-tx', lv); }
        else if (el.hasAttribute('data-cs-tx')) el.removeAttribute('data-cs-tx');
      }
    }
  }
  function tagBand() {
    if (bandRow && bandRow.isConnected) return;
    bandObs?.disconnect(); bandObs = null; bandRow = null;
    let root = null;
    for (const h of document.querySelectorAll('[class*="engine-button-edge"]')) {   // mod UI hosts render into a shadow root
      const sr = h.shadowRoot;
      if (!sr) continue;
      const w = document.createTreeWalker(sr, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n && !bandRow; n = w.nextNode()) {
        if (n.nodeValue.replace(/ /g, ' ').trim() !== 'context') continue;
        for (let r = n.parentElement, i = 0; i < 6 && r; i++, r = r.parentElement) {
          if (r.textContent.includes('cache') && /session|week/.test(r.textContent)) { if (r.textContent.length < 240) { bandRow = r; root = sr; } break; }
        }
      }
      if (bandRow) break;
    }
    if (!bandRow) return;
    if (!root.querySelector('style[data-cs-band]')) { bandStyle?.remove(); bandStyle = document.createElement('style'); bandStyle.setAttribute('data-cs-band', ''); bandStyle.textContent = BAND_CSS; root.appendChild(bandStyle); }
    for (let p = root.host, i = 0; p && i < 6; p = p.parentElement, i++) {   // the rounded panel around it is the app's, outside the shadow root
      const cs = getComputedStyle(p);
      if (cs.borderRadius !== '0px' && alphaOf(cs.backgroundColor) > 0.01 && p.getBoundingClientRect().height < 140) { p.setAttribute('data-cs-bandbox', ''); break; }
    }
    tagBandKids();
    // the mod re-renders every second and may replace the whole row: watch the shadow root, re-find and re-tag before paint
    bandObs = new MutationObserver(() => { if (!bandRow?.isConnected) { bandRow = null; tagBand(); } else tagBandKids(); });
    bandObs.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['style'] });
  }
  const onMove = (e) => {
    const x = e.clientX / Math.max(1, innerWidth), y = 1 - e.clientY / Math.max(1, innerHeight);
    if (!ptr.init) { ptr.init = true; ptr.px = x; ptr.py = y; }
    ptr.x = x; ptr.y = y; ptr.moved = true; ptrT = T; lastAct = T; sn.done = false; sn.at = 0;
    if (pl.drag) { if (!(e.buttons & 1)) onUp(); return; }   // released outside the window
    setGrab(overPearl(e) ? '1' : '');
  };
  // pearl grab: only on the orb itself and never on a control, so the chat stays usable
  const NO_GRAB = 'button,a,input,textarea,select,[contenteditable],[role="button"],[role="textbox"],[role="slider"],[role="menuitem"],[draggable="true"]';
  function overPearl(e) {
    if (!gl || !vel || styleEl.disabled || cl.ph === 'hidden' || visAt(pl.x, pl.y) < 0.3) return false;
    if (e.target?.closest?.(NO_GRAB)) return false;
    return Math.hypot(e.clientX - pl.x, e.clientY - pl.y) < Math.max(16, rad() * 0.85);
  }
  const setGrab = (v) => { const de = document.documentElement; if (v) de.setAttribute('data-cs-grab', v); else de.removeAttribute('data-cs-grab'); };
  const onDown = (e) => {
    if (!gl || !vel || styleEl.disabled) return;
    if (e.button === 0 && overPearl(e)) {   // pick the pearl up (out of the dragon's mouth too)
      if (pl.held) { pl.held = 0; pl.caught = T + 1; }
      pl.drag = true; pl.vx = pl.vy = 0; pl.thrown = -9; sn.done = true; setGrab('2'); lastAct = T; return;
    }
    startBreath(e.clientX, e.clientY, 1.3); lastAct = T;
  };
  const onUp = () => {
    if (!pl.drag) return;
    pl.drag = false; setGrab('');
    const v = Math.hypot(pl.vx, pl.vy), cap = Hh * 3;
    if (v > cap) { pl.vx *= cap / v; pl.vy *= cap / v; }
    if (v > Hh * 0.35) { pl.thrown = T; pl.caught = T - 1; }   // a real throw: the dragon fetches (catchable after 0.5 s)
    const m = Math.min(W, Hh) * 0.16;   // settle about where it slides to
    pl.hx = clamp(pl.x + pl.vx / 1.3, m, W - m); pl.hy = clamp(pl.y + pl.vy / 1.3, m, Hh - m); pl.nextHome = T + 9;
  };
  const noSelect = (e) => { if (pl.drag) e.preventDefault(); };
  function clearDye() {
    for (const t of [dye.a, dye.b]) { gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb); gl.viewport(0, 0, t.w, t.h); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
  }
  function setMode() {
    const was = dark;
    dark = isDark();
    document.documentElement.toggleAttribute('data-cs-dark', dark);
    window.__claudeSkinBase = dark ? BASE.dark : BASE.light;
    if (gl && dye && was !== dark) clearDye();   // dye = absorbance in light, emission in dark
    if (gl && dye) render();
  }
  function start() { if (!raf && gl) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  const onLost = (e) => { e.preventDefault(); stop(); vel = dye = prs = div = crl = null; };
  const onRestored = () => { try { calTex = null; if (initGL()) { buildTargets(); resize(); start(); } } catch { /* stays plain */ } };

  function mount() {
    backdrop = document.createElement('div'); backdrop.id = 'cs-backdrop';
    cv = document.createElement('canvas'); cv.id = 'cs-fluid'; backdrop.appendChild(cv);
    mcv = document.createElement('canvas'); mx = mcv.getContext('2d');
    W = innerWidth; Hh = innerHeight; S = Math.min(1.25, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(W * S)); cv.height = Math.max(1, Math.round(Hh * S));
    dark = isDark();
    try { if (!initGL()) throw new Error('no webgl'); buildTargets(); }
    catch (err) { window.__claudeSkinState = 'no-webgl'; window.__claudeSkinError = String(err && err.message || err); gl?.getExtension('WEBGL_lose_context')?.loseContext(); gl = null; return; }
    styleEl = document.createElement('style'); styleEl.id = 'cs-style'; styleEl.textContent = css;
    document.head.appendChild(styleEl);
    document.body.prepend(backdrop);
    document.documentElement.setAttribute('data-cs-n', '');
    mounted = true; setMode(); dragonInit();
    cv.addEventListener('webglcontextlost', onLost); cv.addEventListener('webglcontextrestored', onRestored);
    resize();
    clearUnder(); clearTimer = setInterval(clearUnder, 2000);
    checkBusy(); busyTimer = setInterval(() => { checkBusy(); tagBand(); }, 500);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('pointerup', onUp, { passive: true }); addEventListener('pointercancel', onUp, { passive: true }); addEventListener('blur', onUp);
    addEventListener('mousedown', noSelect, true); addEventListener('selectstart', noSelect, true);
    addEventListener('resize', resize);
    start();
    // debug: advance n frames and snapshot (works while hidden). opts: busy, dark (preview palette), breathe [x,y] css px
    window.__claudeSkinRoll = () => [+dg.roll.toFixed(2), dg.rollT];
    window.__claudeSkinDbg = () => ({ mode: dg.mode, breath: +dg.breath.toFixed(2), head: [Math.round(dg.hx), Math.round(dg.hy)], pearl: [Math.round(pl.x), Math.round(pl.y)], sniffAt: sn.at && +(T - sn.at).toFixed(2), sniffDone: sn.done, cloud: cl.ph, fade: +cl.fade.toFixed(2), headVis: +visAt(dg.hx, dg.hy).toFixed(2), held: pl.held ? +(pl.held - T).toFixed(1) : 0, charge: +pl.charge.toFixed(2), flare: +(T - pl.flare).toFixed(2), jaw: +dg.jaw.toFixed(2) });
    window.__claudeSkinStep = (n = 1, opts = {}) => {
      if (opts.busy != null) busy = opts.busy;
      if (opts.dark != null && opts.dark !== dark) { dark = opts.dark; clearDye(); }
      if (opts.cloud) cl.next = T;
      if (opts.throw) { const [x, y, vx, vy] = opts.throw; pl.drag = false; pl.x = x; pl.y = y; pl.vx = vx; pl.vy = vy; pl.thrown = T; pl.caught = T - 1; pl.hx = clamp(x + vx / 1.3, 50, W - 50); pl.hy = clamp(y + vy / 1.3, 50, Hh - 50); pl.nextHome = T + 9; }
      if (opts.roar) { dg.roar = T + 2.5; pl.caught = T + 2.5; }
      if (opts.breathe) startBreath(opts.breathe[0], opts.breathe[1], 1.3);
      if (opts.ptr) { ptr.init = true; ptr.x = ptr.px = opts.ptr[0] / W; ptr.y = ptr.py = 1 - opts.ptr[1] / Hh; ptrT = T - (opts.idle || 0); sn.done = false; sn.at = 0; }
      for (let i = 0; i < n; i++) { T += 1 / 30; inputs(1 / 30); flushDye(); drawMask(); uploadMask(); step(1 / 30); }
      render(); return cv.toDataURL('image/png');
    };
    window.__claudeSkinMask = () => mcv.toDataURL('image/png');
    window.__claudeSkinPerf = (n = 20) => { const b = new Uint8Array(4), t0 = performance.now();
      for (let i = 0; i < n; i++) { inputs(1 / 30); flushDye(); drawMask(); uploadMask(); step(1 / 30); render(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b); }
      return { ms: (performance.now() - t0) / n, w: cv.width, h: cv.height, sim: [simW, simH], dye: [dyeW, dyeH], mask: [mcv.width, mcv.height], linear }; };
    window.__claudeSkinState = 'on';
  }
  const modeObs = new MutationObserver(setMode);
  const mq = matchMedia('(prefers-color-scheme: dark)');

  const glass = { d: 0.62, l: 0.66 };
  let toastT = 0;
  function toast(text) {
    let t = document.getElementById('cs-toast');
    if (!t) { t = document.createElement('div'); t.id = 'cs-toast'; document.body.appendChild(t); }
    t.textContent = text; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1100);
  }
  function stepGlass(d) {   // free range (Yang 11-16), separate memory per mode
    const k = dark ? 'd' : 'l';
    glass[k] = Math.round(clamp(glass[k] + d, 0, 0.95) * 100) / 100;
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
      removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('blur', onUp);
      removeEventListener('mousedown', noSelect, true); removeEventListener('selectstart', noSelect, true);
      if (gl) { freeTargets(); gl.deleteTexture(maskTex); if (calTex) gl.deleteTexture(calTex); gl.getExtension('WEBGL_lose_context')?.loseContext(); gl = null; }
      styleEl.remove(); backdrop.remove();
    }
    clearTimeout(toastT);
    const de = document.documentElement;
    de.removeAttribute('data-cs-n'); de.removeAttribute('data-cs-dark'); de.removeAttribute('data-cs-grab');
    de.style.removeProperty('--cs-ad'); de.style.removeProperty('--cs-al');
    for (const el of document.querySelectorAll('[data-cs-clear]')) el.removeAttribute('data-cs-clear');
    bandObs?.disconnect(); bandObs = null; bandRow = null; bandStyle?.remove(); bandStyle = null;
    for (const el of document.querySelectorAll('[data-cs-bandbox]')) el.removeAttribute('data-cs-bandbox');
    for (const h of document.querySelectorAll('[class*="engine-button-edge"]')) {
      const sr = h.shadowRoot; if (!sr) continue;
      sr.querySelectorAll('style[data-cs-band]').forEach((e) => e.remove());
      for (const a of ['data-cs-bandbox', 'data-cs-bar', 'data-cs-lv', 'data-cs-tx']) for (const el of sr.querySelectorAll(`[${a}]`)) el.removeAttribute(a);
    }
    for (const el of document.querySelectorAll('[id^="cs-"]')) el.remove();
    delete window.__claudeSkinStep; delete window.__claudeSkinRoll; delete window.__claudeSkinDbg; delete window.__claudeSkinPerf; delete window.__claudeSkinMask;
    window.__claudeSkin = false; window.__claudeSkinState = 'off';
  };

  const boot = () => { modeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] }); mq.addEventListener('change', setMode); mount(); };
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
