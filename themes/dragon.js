// ClaudeSkin theme "Dragon": an eastern dragon made of ink smoke, living in the Fluid simulation.
// Each frame an invisible dragon-shaped mask (spine tube + head with horns, whiskers, mane, claws, tail tuft) is drawn
// on a small 2D canvas. Inside the mask the dye is re-inked toward the body colour with brush-like noise; the mask's
// edges get a curling push, so the outline keeps smoking off while the shape holds. Where the dragon leaves, the ink is
// no longer refreshed and dissolves into the water. Fire = high-velocity coloured jets from the mouth.
// Light: black ink on paper, vermilion/gold fire. Dark: glowing silver smoke, neon orange/pink fire.
// Behaviour: plays with a glowing pearl (chases it, it darts off); follows the pointer while it moves, and when the
// pointer rests a while swims over, sniffs it and snorts; click = breathe at it; the pearl can be grabbed and thrown
// (the dragon fetches it and carries it in its mouth a while); fire that hits the pearl is swallowed and bursts out as a ring; while Claude works it coils slowly
// around the pearl, and when the reply ends breathes one big blast at it. No network, never reads messages.
// Backdrop: an ink-wash landscape (assets/dragon/landscape, Yang's AI gen) under the smoke; plain paper until it arrives.
// Engine shared with themes/fluid.js.
// @assets landscape
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
// octaves rotated against each other (~37 deg): unrotated value noise shows its square grid as blocky blotches
const mat2 RO = mat2(.8, .6, -.6, .8);
float fbm(vec2 p){ return .5 * vnoise(p) + .3 * vnoise(RO * p * 2.1 + 7.3) + .2 * vnoise(RO * RO * p * 4.3 + 1.7); }
`;
  const FS = {
    clear: H + 'uniform sampler2D t0; uniform float uK; void main(){ gl_FragColor = uK * texture2D(t0, v); }',
    splat: H + `uniform sampler2D t0; uniform float uAsp, uR; uniform vec2 uP; uniform vec4 uC;
void main(){ vec2 p = v - uP; p.x *= uAsp; gl_FragColor = vec4(texture2D(t0, v).xyz + exp(-dot(p, p) / uR) * uC.xyz, 1.); }`,
    splat4: H + `uniform sampler2D t0; uniform float uAsp; uniform vec4 uP[4]; uniform vec3 uC[4];
void main(){ vec3 a = texture2D(t0, v).xyz;
  for (int i = 0; i < 4; i++) { vec2 p = v - uP[i].xy; p.x *= uAsp; a += exp(-dot(p, p) / max(uP[i].z, 1e-6)) * uC[i] * uP[i].w; }
  float s = max(a.x, max(a.y, a.z)); a *= min(1., 5. / max(s, 1e-4));   // a long breath piles up dye without bound: cap it, keeping the hue
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
    ink: H + NOISE + `uniform sampler2D t0, t1; uniform vec3 uInk; uniform float uK, uT, uDk;
void main(){
  vec4 d = texture2D(t0, v);
  // fast path: far from the silhouette (beyond the noise warp reach) only the thinning applies; skips 4 fbm calls on most of the screen
  vec4 n0 = texture2D(t1, v) + texture2D(t1, v + vec2(.035, 0.)) + texture2D(t1, v - vec2(.035, 0.)) + texture2D(t1, v + vec2(0., .035)) + texture2D(t1, v - vec2(0., .035));
  float near = n0.r + n0.b;
  if (near < .002) { gl_FragColor = vec4(d.rgb * (1. - clamp(uK, 0., 1.) * .45), 1.); return; }
  vec2 wv =v + (vec2(fbm(v * 14. + uT * .2), fbm(v * 14. + 5.2 - uT * .17)) - .5) * .025;
  // mask read through a small 5-tap blur: at 480 px the hidden skeleton's edges were crisp enough to show through the ink
  vec2 ox = vec2(vR.x - v.x, 0.) * 2.5, oy = vec2(0., vT.y - v.y) * 2.5;
  vec4 mm = (texture2D(t1, wv) * 2. + texture2D(t1, wv + ox) + texture2D(t1, wv - ox) + texture2D(t1, wv + oy) + texture2D(t1, wv - oy)) / 6.;
  float m = mm.r, cb = mm.b;
  float e = clamp(abs(texture2D(t1, v + ox).r - texture2D(t1, v - ox).r) + abs(texture2D(t1, v + oy).r - texture2D(t1, v - oy).r), 0., 1.);
  float streak = smoothstep(.25, .85, fbm(RO * vec2(v.x * 16., v.y * 9.) + vec2(uT * .12, -uT * .07)));
  float grain = vnoise(RO * RO * v * 90. + uT * .3) - .5;   // fine ink grain so the inside reads as brushwork, not soft clouds
  float wisp = smoothstep(.4, .8, fbm(v * 30. + vec2(uT * .4, -uT * .3)));
  float bristle = smoothstep(.35, .75, vnoise(RO * v * vec2(260., 38.) + vec2(uT * .05, 0.)));   // dry brush: long thin bristle gaps
  float rim = smoothstep(.12, .45, m) * (1. - smoothstep(.45, .8, m));
  vec3 tgt = uInk * (.72 + .7 * streak + .3 * grain) * (uDk > .5 ? 1. : 1.15)   /* one tone: Yang 11-16 dropped back/belly, the smoke is there to hide the skeleton */ * (1. - rim * (1. - bristle) * .6);
  float k = clamp(uK, 0., 1.);
  vec3 o = d.rgb * (1. - (1. - m) * k * .45);          // outside the silhouette smoke thins fast
  o = mix(o, tgt, clamp(smoothstep(.12, .9, m) * k * 2., 0., 1.));            // inside it is pulled back to the brush pattern: shape holds
  // cloud (mask blue): a paler, billowing wash held in place the same way as the body
  float bill = fbm(v * 7. + vec2(uT * .05, -uT * .03));
  o = mix(o, uInk * (.25 + .55 * bill), clamp(smoothstep(.04, .8, cb) * k * 1.5, 0., 1.));
  gl_FragColor = vec4(o + max(uInk * e * 1.3 * wisp - o, 0.) * k, 1.);   // edge wisps: soft, or they trace the skeleton
}`,
    display: H + NOISE + `uniform sampler2D t0, t1, t2, t3; uniform float uLand; uniform vec2 uLandS; uniform float uDark, uCap, uT, uAsp, uEyeR, uEyeA; uniform vec2 uEye; uniform vec4 uGape, uPearl; uniform vec3 uBg, uInk; uniform vec3 uRing;
float gp(vec2 p){ vec4 t = texture2D(t1, p); return t.g * (1. - t.r); }
void main(){
  vec3 d = max(texture2D(t0, v).rgb, 0.);
  vec3 col;
  // paper with calligraphy (r) and a red seal (g), dry-brush broken; the smoke drifts over it
  vec4 cg = texture2D(t2, v);
  vec3 bg = uBg;
  if (uLand > .5) {   // landscape, cover-fit, bottom-anchored (mountains sit low). Light: the painting is the paper, tinted
    // to the theme's paper. Dark: inverted to faint moonlit grey ridges on the night
    vec3 im = texture2D(t3, vec2(.5 + (v.x - .5) * uLandS.x, v.y * uLandS.y)).rgb;
    float m = clamp((.975 - dot(im, vec3(.3, .59, .11))) / .4, 0., 1.);
    bg = uDark > .5 ? uBg + vec3(.085, .092, .12) * m : im * uBg / vec3(.985, .972, .94);
  }
  if (cg.r + cg.g > .004) {   // noise only where there is writing
    vec2 pv = v * vec2(uAsp, 1.);
    float dry = smoothstep(.18, .62, vnoise(pv * vec2(90., 420.)) * .6 + vnoise(pv * 260.) * .4);
    float ink = cg.r * mix(.35, 1., dry), seal = cg.g * mix(.7, 1., vnoise(pv * 300.));
    bg = uDark > .5 ? bg + vec3(.075, .078, .095) * ink : bg * (1. - ink * .2);
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
    // dense smoke may go near-black. Soft knee on the strongest channel, same scale for all three: a per-channel clamp
    // turned thick fire grey and drew hard metallic contours that showed the coarse velocity grid as squares
    float s = max(d.r, max(d.g, d.b)), sk = s < 1.5 ? s : 1.5 + 1.3 * (1. - exp(-(s - 1.5) / 1.3));
    vec3 k = d * (sk / max(s, 1e-4));
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
  // open-mouth glow: warped, blurred, flickering - no hard wedge edge. Only near an open mouth (5 fetches + 3 noises a pixel)
  if (uGape.w > .01 && length((v - uGape.xy) * vec2(uAsp, 1.)) < uGape.z * 4.) {
  vec2 wg = v + (vec2(vnoise(v * 40. + uT * 3.), vnoise(v * 40. - uT * 2.7 + 9.)) - .5) * .02;
  vec2 o1 = vec2(uGape.z * .35 / uAsp, 0.), o2 = vec2(0., uGape.z * .35);
  float gm = (gp(wg) * 2. + gp(wg + o1) + gp(wg - o1) + gp(wg + o2) + gp(wg - o2)) / 6.;   // throat glow: green where the body is cut away (the belly is green on red)
  gm *= .55 + .7 * vnoise(v * 70. + vec2(uT * 7., -uT * 5.));
  float gl = smoothstep(.02, .7, gm) * uGape.w;
  col = mix(col, mix(vec3(1., .28, .03), vec3(1., .9, .55), smoothstep(.3, .9, gm)), clamp(gl * .9, 0., .9));
  col += vec3(1., .4, .05) * gl * .35 * uDark;
  }
  // pearl (xy = pos, z = radius, w = glow): crisp orb with a swirling core; the body passes in front of it
  vec2 pq = (v - uPearl.xy) * vec2(uAsp, 1.) / uPearl.z;
  float pr = length(pq);
  if (pr < 7.) {   // halo is gone by ~6 radii: skip the orb's noise and fetch on the rest of the screen
  float occ = 1. - texture2D(t1, v).r * .8 * uRing.z;   // uRing.z = 0 while it sits in the mouth: in front of the jaws
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
  // swallowed fire: the orb runs hot (uPearl.w above its resting glow)
  float heat = clamp((uPearl.w - 1.6) / 3., 0., 1.);
  if (uDark > .5) col += vec3(1., .6, .25) * halo * heat * .7;
  else col = mix(col, vec3(1., .7, .32), clamp(halo * heat * .55, 0., .6));
  col += vec3(1.) * spec * core * .55;
  }
  // then a ring bursts out of it (uRing.xy = radius in pearl radii, strength); only on the ring's band
  if (uRing.y > .005 && abs(pr - uRing.x) < 3.) {
    float rg = exp(-pow((pr - uRing.x) * 1.4, 2.)) * uRing.y * (.55 + .9 * vnoise(pq * .7 + uT * .8));
    if (uDark > .5) col += vec3(.6, .85, 1.) * rg * .9; else col *= 1. - rg * .32;
  }
  gl_FragColor = vec4(col, 1.);
}`,
  };

  // ---- palette -----------------------------------------------------------------------
  const BODY = { light: [1.3, 1.27, 1.21], dark: [0.36, 0.42, 0.56] };   // light = absorbance (black ink), dark = emission (silver)
  const FIRE = { light: [[0.08, 0.72, 0.88], [0.02, 0.3, 0.9]], dark: [[1.0, 0.62, 0.12], [1.0, 0.3, 0.05]] };   // vermilion/gold, neon orange/pink

  // ---- GL ------------------------------------------------------------------------------
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const SIM_H = 128, DYE_H = 1024, ITER = 20, MASK_H = 480;   // sim low-res on purpose (soft smoke); mask 480 keeps head, horns and claws legible
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
    maskTex = gl.createTexture(); maskTexW = maskTexH = 0;
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
  const N = 76;   // Yang: longer body (was 54)
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
    pl.nextHome = T + 14 + Math.random() * 8;   // long enough for the dragon to actually reach it
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
      if (T - pl.thrown < 6 || (cl.ph === 'off' && Math.random() < 0.55)) { pl.held = T + 3.5 + Math.random() * 2; pl.thrown = -9; pl.caught = T; return; }
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
      // Yang: the whole dragon swims into the cloud, not half of it vanishing in mid-air. The head keeps orbiting inside the
      // cloud (see the steering), the body winds in after it; only when the tail tip is in does the dive count as done.
      // A global fade is the fallback if it can't get the tail in within 12 s.
      if (cl.headIn) { const d = (i) => Math.hypot(dg.pts[i].x - A.x, dg.pts[i].y - A.y);
        if (d(N - 1) < R * 0.35) cl.fade = 0;
        else if (T - cl.headIn > 12) cl.fade = Math.max(0, 1 - (T - cl.headIn - 12) / 1.5); }
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
  // head silhouette from Yang's Paint drawing: upper = blue skull+snout + grey horn; lower jaw = red jaw + orange cheek (one piece);
  // yellow eye; yellow dot in the cheek = jaw hinge.
  // cut per colour into red-on-transparent sprites, flipped so +x = forward. x/y/w/h in units of R: skull/eye in head space,
  // jaw relative to the hinge (it rotates about it). Points: hinge/eye/upTip in head space; loTip and the jaw underside in jaw frame.
  const HEAD = {
    skull: { x: -3.847, y: -2.71, w: 6.731, h: 3.697, u: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUUAAACyCAYAAADVlN1IAAAZkElEQVR42u2de5RcVZXGf6eqOg8S3oJAQAcFkSACjqDIIxpFEHAGEBAER4UZ1yxA0SWKIzBrfAKijozgDIoLXAqiAiIqAQNLEQMKcURQ3gQfwyshBBUkST32/HHOTZ+c3Kqu7lRX31v1/daq1d3VRei6de93v73P3vsAYLBj+OoQQohhxmCewXKDw8PPNR0VIcQwi+I/GZjB4wZbhecqOjJCiGGkAjS8DrIVcKHBCFBRKC2EGFZRBC+Aq4AjgH9xXigVRgshhlIUpyWu8YwQRjcMqjpEQgiGLKf4BoOVBk2DesgvXp3lFhVGCyGGTRRnGzwZxLAVCePlBjWDEQmjEGKYRHFzgxWRKJrBqvD1/PCaaTpSQohhEcURg4VBBBuROK4OIfUJql8UQgybMF4RxDALnTNhzETymExAdbSEEMMgiqfmiKIFp9g0WGbwMjlGIcSwiOJByepzKoxm8KdIGFWqI4QYaFHcwuBvyWJL/GhEwvhyAydhFEIMqiBWDGYa3Jc4w/SRucglBtOCMKpHWgjBoHW0VBw8DywKPdCtNq+t4TtetgcuI9QuShi7vvmo1lOIklystWRaTr2NU0wd45XBZVYkjBJCIQYqfA5ftzd4KuQUW2MI42oJ49iCGB6zQh3oMVqkEqJ8bvF7XbrFWBivioRRF/y6N5vtwnH6pkqahCiRKAZX84FxiGIsjFdngihhXEcUXxRW739vMF1htRDluoC3DVsTdBNCpznGOwzmyg2tc0xfHN085uvGIUT5QujLx+kW49c+ZrAXoz3VTqK4lij+ymBGlm/UWSdEsS/iLPzdN2rvs3E8GlGd40lRDWRVokgjct5yi0KUrJC71kUhd7tHM7r4P5ENkDCoDpszyhHF7Nhco/pOIcoXQr9rAiF0PF2nGYWLr00XdIZUFOMBG3PVKilEeWrrKgbTDe5PBG68j3okBJcYbDFM4thGFLNjco5CaCEGt8NlrHA6+/4Jg4/niGNlyJxiy+AZgy3VPy5E+dzig8mw2Yk+4v/+DwanGGyZk8t0Ay6K8bE8T25RiPKtRB/UA7doOZtiZc7xXIPXpP/vQViY6SCKmTCuNthbnUBClC+MvqiHwpgnjmbwE4P3x+6x7AKZdLTUk1mVmUgujvukddYJUfwwumqwSZih2OxBGD2WOD4ZisePTveDCeF1aQQyGbRhiShmC1jPGOysEh0hyhdGHxC5xVYPhTHOs6UC+TuD8wzenrYNlsFBRlNyNg19z+nCUz3ZRlaDIoQoWRh9XjIEYjIerajQOX7+1wanG+yX4yCzRZpK0UQycos35Sw4ZSvRv4kGciiEFkLC2LGcp54Tst9j8DmDY+LynhwXOeUiGYndp9ukC7L39p5M3HW2CVGe/GImjJ/tozCmApmG7ksNbjb4oMHOeftSZwI5xemHA9u0TWY90XdHrlduUYgSCuO54aJeNQk5xok6SDO41+DbwUXunM0vnKoumiivODssVrUTxtUGb1PdohCDIYytHq9K92KRJnvcZ/Adg1ckOUgXRLIW5SMrk5xXXJSTV4xF8nGDOepyEaKkpTrh+1MNnp+CcLqTi2zkCM8zBmcbbN2N6PdyZTsS4aMM/pJMEkpzi2+NbzxCiP7j1mcRwfmLeX/gi8Ae+C1QKxTH6bTCtq1ZSLoceARYBSwIv3seWAiscvBgzm581WzrV+e/TkgYnRfCRcDrgCZrh8mN8PPFDt5rUHX+NUKIkrnGbF7ipgaXJs6nWQDn2KlQPK8/e7HBFw2OM9iqjesbt4uMVsO/0uZvydr/ns7crEJoIUpe4B2+PzQISxrOFkkcG1Eest5BLJcb3GJwlsHr40WbROjGnIsYpRt2SUQwb9Taf2rBRYjByjPOMvgHgxsLLI6dhuO2W9l+MOxzfbzBjPGU/kSr0BsZPNpmFToTyqUGm8ktCjFgrjH8fEjUzVEWccxb2W7lCOSXDPYMAx+OTRdWOrjFL7cZsJGJ4jKDbSSKQgzeIAkXPXdwCZ1jNyvbjTACzUJR+84dbhBZd8s72pQxxaK4g0pzhBhQ55gjjgtz3FirhAJZb7OT4WWRK6xG38dTcxrJ1Jz037lJeUUhhksc35KIo5XQOaYLJrG432iwX5tFmWkGd3bY/yb7d/aTMAoxfOL4KoNrDZ5NSmeaJRTIPHG/JtRxZu93Wvj61Q6DezOhfdRgm8nsthFCFFccd4iEIhaXRomFMQ6Nv2+wW7QQ8zqDlW26W2KxvICoHlQIMQR7I8cuKDjH/w6bW3USmTKK47MG74ve61fG2OYhW/XeX0NohZA4bmhwosH1A+IeY+E7MLzHI8bIpWZh9GMGL1eJjhDDK45pKcvuBheGYQrp6m+zhK5xSahvfGMo1LYOLjgTzEUGI4O2DawQYpwjypK847YGJxgs6HIAbdkWZcZymd/N8osSRiHkHlP3+OaQe3y4TXjdKkEZT2sC4ff7tSWqEKKTe5wdBPLLYWZiXgdKmct70r5sC1N8aqphFEKsszlV8twcg3eH8pcVbUaHlV0gs3D7hxJGIUSnPutUILcJDvIag4cGTCBXha8/Mpijch0hKMbk7SIKJF4cW85P3M6en4Wfdv2P+HKYHdb+z9ZMuC7SxPCxaOCF8EngQOf3jq4CFr93IYRIHWQleX4DgzeFsV93tFnQKEseMlt8WWbwrnSPbiHEkDvFMRxkJbzZZvK7+fi9ZaYBJwIvjX7dDE7SUdy8XStyt1cBH3TwJxt9v3KNQojucpBpSUvYZ+YDBleFIbJ5ecgilvvEsxmfNHh3ux5zIYToZhW7loacBjPDtgPnG/yyQ5jdKmgh+FUGr5Y4CiF6UQdZzfndGwz+zeDWNhtONQtYz2gGZxjMbjcNXAghxi2QOWH2XIOPGNyWCGSRhlXEi0UPGhyWiKN6qIUQPQmz2wnkfW1yfEUKqR8yv5iExFEI0ete7LTdcHoYdbaogDMg003C7jY4xWDDRByVdxRC9EYgk+fmhVbDou0900zyjQ8bvM9goxz3KIEUQvS2WNzgPQbLC7gpV7oT4cMG5xi8Nic9UNXijBCiZ8MqwgzInyXbCxRtH+v4ud8ZnBsEckQOUgjRS3GsRWLy8WQhpoh7WKd/1x8MLjLYO6ddspZt2apPWggx3pyjC99/NNrKtaj7zLQTyHsMPttJIPVpCyHGVfMYvt/X4K9j7OJXtPA6TyDPM9gpyaFWFV4LIcYjjiPh6z4G97YRxsyp1aNi8GYBQu48B7kyCOQHDXaSexRCTGgRJtrCdbwLMEXZwbCZI+YrDb5t8Na4RClalZd7FGh0mGgrjM4Ly2zgEuBIRkeVLQK+ET6X1wOb46dr7wDMIH9k2BS+lTWPuGznPuA64GIH9yYLT5aOb+vBWDi6OBbZ3zmeC8N0tgrR3xmP2fcfDoNi1+zWlxOKbmNwRKgnvCuZ1FOUQRSpi11tcLPBsQabJu6xsp5j32qTXT8Z9b/XVI4kpyj6OPw2uMY5wH74vZ1deLTaDMatAmcC/xE5TFegrRRa4RF3+vwBuAn4voNr4xtDJ0dmo1tE5DpMg5l4x/3qDg7RAUuAP4bvrQtX6Rw8P8a2F6btHySKYhLD6S5DROf8/iwYHAYcF4XfWYhYKc5bWyMYsav7OXC6g1szJ5y9p+T9umSvnQ2C+G0HvBHfnrgPMJ3IibZhNfD0eEQRuB94OBzPu4DbgTsdPJdXj5rdEJK/uZp3YxMSRdHlpluxOIzx2jWCYXA88GHglYxualW0TbhaUR60Ev7GHwNvc36RphadkLFA7gLsDhwO7Au8sM2/P5bo9CrUfgJ4IAjkzcCvHDw+1vYX5iMCOUoh+thOWDN4TcjhWUHbCvMGZNxhfpdFkolDs8Lk83qb2sl69P5aXeY8x/uI/z/tjuVdBpcYfL1NadLhBidp+rmcopii8DuMAzsdH1rvUmDnmLm7zMF9D7gN2DK4wtmRK2xEOVNXoJRAngNdDfwS+DVwA97FHwuc4uBCG02BKJwWol81kFEd5CcN/lLAEWadxpnlubuid/3UO1QCPBFW4c3g6qSGUwN+5RRFv3OTBrsBp+IXKHaNcm/VArpGixeUSnpuZk4y3Ro3c8W/AD4J3Oi8q8wWapqqixSiT/3W4efZBt9qs4eLHpNbv5nn1B8wOC0ezybnKKco+jSlJ9RCZs7xEHynzGlRvq6mI0U/V+HjDpxfAlfiu3+eidIgLTlHIfowGTz6+e1RZ0xLrnHK+8cfCavt01h3szStWgvRpzKeWQaXFXSL1mEVxx8ZzDfYpNNnJxQ+i8kt43kVcA5wQMEGTgzZR0IzSmU8hR8OchuwGF8krvBaoij61Xsdfj4IX1f3jnBeFHWlmiHKOWYsDyJ5sYMfZJ+fhFGIyVuMiX/ew+CGJMyrF2TY7TCtWjfazM+8OMs9apCvnKLoQ/F35ByPAt4FvCVxLkXtkBmG8JoQYl+H7/ypx25fSBTFJDnHZNLLHvjHe4G9onNG4jg1rMY7xQXAYc53zGjghERR9Mk5WiKQuwdxfA1+gQZGOzgqOp/6RlZfegNwooNHJYwSRTFFBeDRcNfP4xdnttdRmhLq+I6Ym4GDgVValZYoiqnvkJkRLsh3A4dGQ1x1XvVXGK9wftuHWjczOYVEUfRhKK7BjsClwN4FmwA+LMJ4EH5wb1XCuH7oxBUTuZOa8yUj8eCJtwF7ShCn7Br+aAidTW2BEkUxtZFG1eAzwNl4gdQ51V+q+JKc15sXxqYK7hU+i6kNo2fi93qek7MHtOjvHMcqsK+DRWNtiCbkFMXk7V09Owijahan3ty08B0vM9L9xYVEUfTh3Ak5rKOBF0T7T4upC6MNeDlwbXCJFQmjRFHQ9+EF79WhKJQwNoADDD6m/KJyiqLP3S74Kd4LdYMt7Biy/R3covpFiaLoU3+0wU+BeciRFNXFrwB2crBcbYAKn8XkC+LZQRBbEsRCXtcGbA58x/ximPKLcopiksLmFvCvwJflECnL4IgrHRxlMOJ8B4yQUxS90sWw4nwyCsXKQA0vgkeGhZd6vK2qkCiK3oTNHwd2VqF2aRgJjv7TBmdkwqhQWuGzWM9Cbed7arcFfh/VxOn8Kd+K9JnOC2Qlcv5CTlEw/vo3gAOjXlsJYsl61PE5xk8ZnMXojU4aIFEUTLzE48jgOuQuyimMtSCMnwB+bDArpESUBlH4LCYYOt8PbKDQmUFZlb4ZOMTBcxogIacoxn/j3DoIom6mDMyq9DzgOoM5zm+lWtOhkSiK7s+R+cEhql2MgVqV3h/4jcE+YXDw0K9MSxTFeM4VOUQGckDt5sANYUhtfdgXYCSKQkgYW8As4GyDLxlsGBZgasPoGiWKQohKlBo5BZ9n3M5BI7jG6jCJo0RRCAFrl+zsC9xlcIbBCx00h0kcJYpCCJKV6RawCfAp4B6DMw1mxOIoURRCDGM43QQ2Az4J3Gnwz5k4mh9FVpEoCiGGrTUwE8edgK/iy3dOdNAa1MUYiaIQohtxbAVxfBl+x8AfGuwVL8ZIFIUQwxZSx+J4CPBTg/MNto9CaidRFEIMozg28ft9vx+fbzwrhNRWdmGUKArGMZNPCJJ9phvARsAnDH5gsHE2SESiKAad6ToEgvzaxkwcDwV+hO+rliiKgXeIvw3f65wR7cRxNbAPcHyZ5zTqBBfdiuLd4eTXOSPG6qM+GuUUxRCI4p+Bx5RfFGPoSQXY3fzknVYZc4sSRTFWXGRh+vaTwOOsvT2BEHlsBEwr66ZYEkXR1XkS7vjX6lAIxt7PZ2aZowmJougqhA53/UuB59BGRyJfDBtBU74ALA97hZtEUQxiCN0KIfQfgUfC09rkSMSCWMGX4nzewYfw7X8tOUUxDBtYfVGbV4lkIa4C/B/wAQenlb0PWie2mMh2pw8AO0YOQQyvQ3TAYuBQB0tDyNxSSY5gyCa1Lw4OQavQEkUHfCEI4gw3AOeERFFMhG+rkFtEbMkA5ZkVPotxhc/h243xIfQWCqHlFIElwGsdPGVQdSUXR53MYlyF3Pic0TPAZ0MIre4Whn7bgpcCCw1eEOYqjkgUxVAZxqiQ26lmUcIYwubdgzDOdVA3cGXdw0WiKMZdsxjE8I/A7ahmUYwOnd0dWGzwIecL/ku5h4tEUUxIGx2sBC4A6jocIpqQMxP4nMHNBq+I9nApjThKFMVE3GIzJNS/AVwRzqOGjoxCaUYHzu4P3G5wusHmZRJHiaKYsDaGk3tRCKedDolgdOBstofLOcBdBh8NCzFrdv8ras5RJ7JgPctzNgPuBLZVeY7IaQFsBpEEP3ruv4CvOVgWXlDNog85RTEI5TlVB8uBbwVBVIeL6LSHy9bA2cBvDb5psJuDZiaIRQmtJYqiF+U5t+hcEl2KYxPfAXMcPud4hcFR4UVZaF2ZyqESCp/F+sZHWXL9AuCkcNKrdlGMFVa3kvPkNuAq4BsOlkYvrOHdpEkURamEMdSkXQCcjC/TGdGR6XluLr5m8xa3XEnFMe6jfwpYCFwE/CwTw3DzdUBrsgVSoih6tehSCaU6P8dvc1kPIZPOsfUXw2qXx7HZRjBdSfqoLXGPv4jc45OJe7TJEkidsKKXYbTD54vOBd6ZTGUW3YkCkThk1+dq4N/xG0LNC7/fGHhF9N90KotqJLvtldE9/gS4BrhpsgVSoih6PoQ2fH8q8BlgA+UZOwphtmJfy/n9CuAy4DYHl+e48+2T6/g0YBdgQ+CVQSzyRrw1Gb2Jlc09LsWPrvsesMj5G0YskK31nekoURSTEUq7kGN8GXAlsGuJLsR+XejpsXgE30/ugN8EV3SPgyeiej6XiehYF77BSyJBmQ+8CDgU2C0RR1ci90gikEuAS4KLXOxgVZzOCRuutSSKoihn8UiYlrIlcD2wR3QhVod49mB8zT0ILAAeAi4PNZ/pcayGm0wj7+aTcz23FYKQ4vh7fJXA0cHFx/t4V0qUZ01TAUuA64BLHPxv8p7z3lfTaeydmIKztxq+zjQ40uBZ83VodfOLMjagj5ZBIzzqye/uN7jSYL7BjFS0shq98HATdevRv1UJRdG15DUvMviYwa+jv60Z/uZWSY5z9vfG51LD4FaDd5qPUMY8P+UUxVTmGXcELgQOKFn4tj4hXubEHsJv/XljmDBEEhb3xblkC2JRF4kDTgBOwY/+oqSOPsvP1pLnvg88Fqcews//42DFIEwKFyUVxviubHCywUMldiipK0zd4GqD2wy+a3CSwVyD6bEQro8TnKTPxBkcavA1g1XRe2uV8PPIzqdOr7vX4KDoRiHE1JTtZCdgCKlPNvhFm5O6bGK4wuA7BseaX9Ro9/5dUdMc0c+vDOIYh6RlTmPUk8fqKI2zZ3qDEKIIF+EbDa4yWJ64x3oBHWQzEcO/md8A/u/ynFjI51XKMGA1c7DRz+80eCISxsYA5YIzN3x9p/yiEH0P32KxMNjS4AiDB3JO4qkSx9htxP//5QZfMNgrJyyuDICjHwnf72Dw8zYLHK2SC2Mm8ntLGEXRHcqMsDr7EYNFBiu7OLnr0Um+vrmwVo4jzB73GHze4MXR31u6fUjG6+gNDja4yOCRnGNf1vC6nucWtfosCln4nTw/B3grvn1wQ7qvnGiM47UWrRzHr/8bfjTab/ErmbdHRcI96aAoS/VA+HlDYF/gcOCY6PNoJbWYZZnGntU8znNwi9yiKHpoXUvC63Nz6hyPNTgsjLu/PtQBrlxP9/K8we/Mb8C0Zxtn64bZzYfntjH4sPm5iJ3yr/UC5yMzt3hFdqOTUxRlCeMcvm3wbtYeknw3sGfk3mbgt0jYGD+tZxdg56gPuB3XA88C9+G7I57K+moTMWgNcydE1EK31hYCBgfiF5sOwncvvZCkOD1x5K5A9aUAf8a3QP5JV5wo0xQegnuzxHlcHX43rcf/z5pq2LqvdYyen2WwtcGBBicanGGwwGBJ4tCKsliTucWT9amKsl2AlVDfuDRZBTXzW2quCW2j9rZql49a9HpnyrdPJLyudcrJGWxgcELOwll9ikUyu7nebfnTioQovFt8c7iw4gvp/iCYVQlaIW5gLr3ZRL+fG/quFxg806aaoN8CmVUwHKBPUJTtgquFr5ckYZgZfFf1ZsV3+8lzWxm8w+DC0N30XI6LbPahMykT4IP1SYkyXlg1gxcY3JEjjB+KxVMUtji81iYfOSd00vw0Z/pNLx1kK6lQqBucqE9HlD2Mfkkon0kdxTw5xtLd5PIEcleDCwwe7uDw4oL98Qhi3O731WzMmBbWxCDManyTwdPhBM/yjMsMXq2TvNQiGdenzjY4PgzcuNXgrx3ygq0uBXGlwVfM73ODzhUxaI5xuyiUzh7LQihW0eJLucPsnOe3CG2g7wlC+VASCrcTx2Z4LLXRSfAMQr+6EHkLL5sanBLEcE0/a07dYWmm1oixQ+xoDN3csFjzdJtayHjU2/FZXavEUAy0Y4wS9eeHk//M4CJ3zaa+5Iik61RWoqNb+DbQao6LPCsZQxc/bsn2ENKRFEPhJqKfP2NwncHXw8XwqMEVBscFVzEyRiub8kzlK+yPP/+Xhr7sn4VayBXBRc7XUFkxtNO9oxmNl4bx82nO8eIw1GAdVxha1TbSER2IWsjNwmMTHSEx7OLocnawO8rg02Fw6nPmt/zMXp+taJ8TclHLwlRtJeLLWwvp2kUBQmhowbq/m54npGEU2cLIVe6jUHog2g67EkSpphiqAbaMClvL+RVJ124UmMER+PFhC4Z9ZNgw8f9V+bWY8xSDfAAAAABJRU5ErkJggg==' },
    eye: { x: 1.036, y: -0.262, w: 0.359, h: 0.255, u: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAMCAYAAACEJVa/AAAA8UlEQVR42pWSP0pDQRCHv/eevEIRGxtvILmDiIJHEITUllZWOUCKQBobT5HGA1h7AAVt7DyCIuaPn808GNYkxoVhZ5edj9/8dhAqAKEn7EZeCQ3/WcKl8CE8CxfpvtkIJpwKFnEvHBewah1kRxgI04h5gObCnXCSYasgnSfDKP4SZknVQhgLe/Gu/qUqTGwjv0nFs6RK4U3op7p6GaiJfCR8JtCigN0mVVvLWqtjPwxzu8LvAHZtPgoHK33Kl8KV8Fr8XKfyRThb92N1MnxbOBceorVyHI7+mqGmOPeEa+FJeBcmwv4mw1iVwya04VsL8AM7Eq7d8fpuaQAAAABJRU5ErkJggg==' },
    jaw: { x: -0.549, y: -0.389, w: 3.076, h: 1.366, u: 'data:image/png;base64,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' },
    hinge: [0.178, 0.272], eyeAt: [1.214, -0.135], upTip: [2.686, 0.89], loTip: [2.513, 0.666],
    under: [[2.41, 0.935], [2.103, 0.907], [1.795, 0.831], [1.488, 0.804], [1.181, 0.783], [0.874, 0.769], [0.566, 0.707], [0.259, 0.707], [-0.048, 0.638], [-0.356, 0.383]],
  };
  for (const k of ['skull', 'eye', 'jaw']) { const im = new Image(); im.src = HEAD[k].u; HEAD[k].im = im; }
  const sprite = (c, s, R) => { if (s.im.complete && s.im.naturalWidth) c.drawImage(s.im, s.x * R, s.y * R, s.w * R, s.h * R); };
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
    // diving in (Yang): once the head reaches the cloud the body slides along its own path into it, head first, tail last,
    // like a snake into a hole, instead of the head circling while the rest stays out. Path = cloud centre + the spine at that
    // moment; each joint's distance along it shrinks by the reel each frame, so everything funnels into the centre.
    if (cl.ph === 'enter' && cl.headIn) {
      if (!cl.path) { const P = [[cl.A.x, cl.A.y], ...dg.pts.map((p) => [p.x, p.y])], L = [0];
        for (let k = 1; k < P.length; k++) L.push(L[k - 1] + Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]));
        cl.path = { P, L }; cl.reel = 0; }
      const { P, L } = cl.path; cl.reel += Hh * 0.5 * dt;
      for (let i = 0; i < N; i++) { dg.prev[i].x = dg.pts[i].x; dg.prev[i].y = dg.pts[i].y; }
      let k = 1;
      for (let i = 0; i < N; i++) {
        const want = Math.max(0, L[i + 1] - cl.reel); while (k < L.length - 1 && L[k] < want) k++;
        const f = L[k] > L[k - 1] ? clamp((want - L[k - 1]) / (L[k] - L[k - 1]), 0, 1) : 0;
        dg.pts[i].x = P[k - 1][0] + (P[k][0] - P[k - 1][0]) * f; dg.pts[i].y = P[k - 1][1] + (P[k][1] - P[k - 1][1]) * f;
        if (want <= 0) { dg.pts[i].x = P[0][0]; dg.pts[i].y = P[0][1]; }
      }
      const h = dg.pts[0], h2 = dg.pts[Math.min(N - 1, 2)];
      dg.hx = h.x; dg.hy = h.y; if (Math.hypot(h.x - h2.x, h.y - h2.y) > 1) dg.ang = Math.atan2(h.y - h2.y, h.x - h2.x);
      dg.mode = 'dive'; return;
    }
    cl.path = null;
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
      if (Math.abs(wrapA(want - dg.ang)) < 0.35 || T > dg.roar) { startBreath(pl.x, pl.y, 2.4); dg.roar = 0; }
    }
    if (dg.breath > 0) want = Math.atan2(dg.by - dg.hy, dg.bx - dg.hx);
    const turn = (dg.breath > 0 || dg.roar ? 2.2 : mode === 'sniff' ? (near ? 1.4 : 0.9) : mode === 'chase' ? 0.9 : mode === 'fetch' ? 1.6 : mode === 'think' ? 0.7 : mode === 'cloud' ? 1.0 : 0.85) * dt;   // wide turns keep the body in open S-curves
    dg.ang += clamp(wrapA(want - dg.ang), -turn, turn);
    dg.ang += Math.sin(T * 1.05) * (mode === 'sniff' && near ? 0.3 : 1.15) * dt;   // serpentine sway, travels down the body through follow-the-leader: deep, slow S-curves
    const calm = !busy && T - lastAct > 20 && mode === 'pearl';
    const sp = Hh * (dg.breath > 0 || dg.roar ? 0.05 : mode === 'sniff' ? (near ? 0.035 : 0.13) : mode === 'think' ? 0.085 : mode === 'cloud' ? 0.1 : mode === 'fetch' ? 0.28 : mode === 'hold' ? 0.1 : calm ? 0.11 : chasing ? 0.2 : 0.16);   // pearl chase has to outpace the pearl's drift or it never catches it
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
    return R * Math.max(0.1, 1 - Math.pow((t - 0.06) / 0.94, 1.25) * 0.9) * (0.93 + 0.07 * Math.sin(t * 40));   // tapers from the chest on, like a brush stroke lifting off
  };
  function drawMask() {
    const k = mcv.height / Math.max(1, Hh);
    let c = mx;   // switched to the head layer while the head is drawn (taper/strand/sprite all draw into c)
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, mcv.width, mcv.height);
    c.setTransform(k, 0, 0, -k, 0, mcv.height);   // drawn upside down = GL's row order, so the upload needs no FLIP_Y
    c.fillStyle = '#f00'; c.strokeStyle = '#f00'; c.lineCap = 'round'; c.lineJoin = 'round';
    const pts = dg.pts, R = rad();
    // body tube, drawn tail -> head so the part nearer the head lies on top. Where the body crosses itself the front coil is
    // ringed by a thin gap (erased a little wider than the tube) so the two read apart as ink-paper-ink instead of one blob.
    // The gap would also bite into the segment's own neighbours just drawn, so those few are redrawn right after it.
    const segA = (t, i) => (t > 0.68 ? 0.45 + 0.55 * Math.pow(1 - (t - 0.68) / 0.32, 1.6) : 1) * visAt(pts[i].x, pts[i].y);   // last third: shape loosens, but stays joined to the flame tuft
    const seg = (i, w, al) => { c.lineWidth = w; c.globalAlpha = al; c.beginPath(); c.moveTo(pts[i - 1].x, pts[i - 1].y); c.lineTo(pts[i].x, pts[i].y); c.stroke(); };
    const GAP = R * 0.5, NB = 6;
    for (let i = N - 1; i >= 1; i--) {
      const t = i / (N - 1), al = segA(t, i);
      if (al > 0.02) {
        c.globalCompositeOperation = 'destination-out';
        seg(i, radAt(t) * 2 + GAP * 2 + R * 1.3, al * 0.4);   // soft shade: the coil behind fades lighter where it passes under
        seg(i, radAt(t) * 2 + GAP * 2, al);
        c.globalCompositeOperation = 'source-over';
        for (let j = Math.min(N - 1, i + NB); j > i; j--) { const tj = j / (N - 1); seg(j, radAt(tj) * 2, segA(tj, j)); }
      }
      seg(i, radAt(t) * 2, al);
    }
    c.globalAlpha = 1;
    const nrm = (i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l, dx / l, dy / l]; };
    // back / belly per body segment: the back is whichever side of the tube faces up on screen, the belly the side facing down.
    // (Fixed sides put the spikes under the belly and legs on the back when the dragon swam leftwards; taking the side from the
    // head's roll failed too wherever the body coils away from the head's heading.) bs() passes 0 where a segment is vertical,
    // so spikes and legs fold into the body there and come out on the other side.
    const bs = (ny) => -Math.max(-1, Math.min(1, ny * 4));   // back = +n * bs
    // dorsal fin spikes along the back
    for (let i = 3; i < Math.round(N * 0.66); i += 2) {   // spikes stop before the tail
      const t = i / (N - 1), [nx0, ny0, tx, ty] = nrm(i), nx = nx0 * bs(ny0), ny = ny0 * bs(ny0), r = radAt(t), h = r * (0.7 + 0.3 * Math.sin(i));
      const bx = pts[i].x + nx * r * 0.8, by = pts[i].y + ny * r * 0.8;
      c.globalAlpha = visAt(pts[i].x, pts[i].y);
      c.beginPath(); c.moveTo(bx - tx * r * 0.5, by - ty * r * 0.5); c.lineTo(bx + nx * h + tx * r * 0.6, by + ny * h + ty * r * 0.6); c.lineTo(bx + tx * r * 0.5, by + ty * r * 0.5); c.fill();
    }
    // tapered filled stroke along a polyline: pointed, no round caps (round caps read as paddles once blurred)
    const taper = (P, w0, w1, prof) => {   // prof(q) overrides the linear w0 -> w1 width
      const n = P.length, Lp = [], Rp = [];
      for (let k = 0; k < n; k++) {
        const a = P[Math.max(0, k - 1)], b = P[Math.min(n - 1, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        const w = (prof ? prof(k / (n - 1)) : w0 + (w1 - w0) * k / (n - 1)) / 2, ox = -dy / l * w, oy = dx / l * w;
        Lp.push([P[k][0] + ox, P[k][1] + oy]); Rp.push([P[k][0] - ox, P[k][1] - oy]);
      }
      c.beginPath(); c.moveTo(Lp[0][0], Lp[0][1]); for (const q of Lp.slice(1)) c.lineTo(q[0], q[1]);
      for (const q of Rp.reverse()) c.lineTo(q[0], q[1]); c.closePath(); c.fill();
    };
    const curve = (x0, y0, x1, y1, x2, y2, n) => { const P = []; for (let k = 0; k <= n; k++) { const u = k / n, v = 1 - u; P.push([v * v * x0 + 2 * v * u * x1 + u * u * x2, v * v * y0 + 2 * v * u * y1 + u * u * y2]); } return P; };
    // whisker / hair strand: heading turns by curl over its length, a wave travels from root to tip and grows toward the tip
    // ww = whip: more points, a shorter wave (two crests along the strand) plus a slower sway, so long whiskers ripple like silk
    const strand = (x0, y0, a0, curl, L, ph, ww) => { const n = ww ? 44 : 18, P = [[x0, y0]], st = L / n; let x = x0, y = y0;
      for (let k = 1; k <= n; k++) { const u = k / n,
          a = a0 + curl * u + (ww ? Math.sin(T * 2.2 - u * 11 + ph) * 0.42 * u + Math.sin(T * 0.9 - u * 3 + ph * 1.7) * 0.18
                                   : Math.sin(T * 2.6 - u * 5 + ph) * 0.55 * u);
        x += Math.cos(a) * st; y += Math.sin(a) * st; P.push([x, y]); }
      return P; };
    // legs (Yang's sketch): fat oval thigh at the hip, round knee, long tapering shin, eagle foot with three forward toes and a
    // rear one, each toe bent once and ending in a hooked talon, a tuft of hair streaming back off the knee. Built in a local frame
    // per leg, (p forward, q toward the belly, units of body radius r); the belly is the segment's screen-down side (bs), so legs
    // never stick out of the back. Each pair paddles: hip swings, knee folds, toes clench on the back-stroke; far leg in counter-phase.
    for (const [t, far] of [[0.16, 0], [0.22, 1], [0.5, 0], [0.56, 1]]) {
      const i = Math.round(t * (N - 1)), [nx, ny, tx, ty] = nrm(i), r = radAt(t) * (far ? 0.85 : 1);
      const fx = -tx, fy = -ty, bx = -nx * bs(ny), by = -ny * bs(ny);   // forward, belly
      const W = (p, q) => [pts[i].x + (fx * p + bx * q) * r, pts[i].y + (fy * p + by * q) * r];
      const D = (ang, L) => [Math.cos(ang) * L, Math.sin(ang) * L];   // local direction: 0 = forward, PI/2 = down, PI = back
      const ph = T * 3 + i * 0.7 + far * Math.PI, sw = Math.sin(ph), cl = 0.5 + 0.5 * Math.sin(ph - 0.9);   // swing, clench
      c.globalAlpha = visAt(pts[i].x, pts[i].y);
      const hip = [0, 0.7], a1 = 1.85 + 0.5 * sw, d1 = D(a1, 1.35), knee = [hip[0] + d1[0], hip[1] + d1[1]];
      const a2 = a1 - 1.15 - 0.35 * Math.sin(ph + 0.8), d2 = D(a2, 1.3), ank = [knee[0] + d2[0], knee[1] + d2[1]];
      // thigh: oval along the bone, a little past both ends
      { const m = W((hip[0] + knee[0]) / 2, (hip[1] + knee[1]) / 2), e = W(knee[0], knee[1]), h0 = W(hip[0], hip[1]);
        c.beginPath(); c.ellipse(m[0], m[1], r * 0.95, r * 0.55, Math.atan2(e[1] - h0[1], e[0] - h0[0]), 0, Math.PI * 2); c.fill(); }
      { const k = W(knee[0], knee[1]); c.beginPath(); c.arc(k[0], k[1], r * 0.36, 0, Math.PI * 2); c.fill(); }
      taper([knee, [knee[0] + d2[0] * 0.5, knee[1] + d2[1] * 0.5], ank].map(([p, q]) => W(p, q)), r * 0.5, r * 0.28);
      // knee tuft: three locks streaming back and up off the joint
      for (let j = 0; j < 3; j++) { const k = W(knee[0] - 0.1, knee[1] - 0.05), back = Math.atan2(-fy * 0.9 - by * (0.35 - j * 0.3), -fx * 0.9 - bx * (0.35 - j * 0.3));
        taper(strand(k[0], k[1], back, (j - 1) * 0.3, r * (1.3 + 0.35 * (j === 1)), i + j), r * 0.34, 0); }
      // foot: toes fan forward-down from the ankle; the rear toe points back. Bend and hook grow when the foot clenches
      const a3 = a2 + 0.25;
      for (const [off, L] of [[-0.55, 0.5], [-0.05, 0.58], [0.45, 0.5], [Math.PI - 0.9, 0.32]]) {
        const ta = a3 + off * (1 - cl * 0.35), bend = 0.45 + cl * 0.5, P = [ank];
        let q = ank, ang = ta;
        for (const [seg, turn] of [[L, 0], [L * 0.7, bend], [0.28, bend + 0.7]]) { ang = ta + turn; const d = D(ang, seg); q = [q[0] + d[0], q[1] + d[1]]; P.push(q); }
        taper(P.map(([p, qq]) => W(p, qq)), r * 0.3, 0);
      }
    }
    // tail tuft (Yang's sketch): ONE slim, sleek plume off the tip, spear-shaped: grows out of the last bit of tail, swells a
    // little, then draws out into a long point. Both edges are serrated with a few backward-raking notches, staggered between
    // top and bottom, like a flame. Centreline follows the tail's last tangent with a wave running down it. u along, v across.
    { const j = Math.max(1, N - 1 - Math.round(R * 0.5 / segLen())), [nx, ny, tx, ty] = nrm(Math.min(N - 2, j)), J = pts[j], r = R * 0.5, L = 6.5, n = 40;
      const saw = (q, ph) => { const x = (q * 3.2 + ph) % 1; return x < 0.8 ? x / 0.8 : (1 - x) / 0.2; };   // slow rise, sharp drop = notch raking back
      const half = (q) => (q < 0.25 ? 0.25 + 0.75 * Math.sin(q / 0.25 * Math.PI / 2) : Math.pow((1 - q) / 0.75, 1.15)) * 0.6;
      const C = [], Tp = [], Bp = []; let u = 0, v = 0;
      for (let k = 0; k <= n; k++) { const q = k / n, ang = Math.sin(T * 2.4 - q * 4 ) * 0.22 * q;
        C.push([u, v]); u += Math.cos(ang) * L / n; v += Math.sin(ang) * L / n; }
      for (let k = 0; k <= n; k++) {
        const q = k / n, a = C[Math.max(0, k - 1)], b = C[Math.min(n, k + 1)], du = b[0] - a[0], dv = b[1] - a[1], l = Math.hypot(du, dv) || 1;
        const g = q > 0.2 && q < 0.85 ? 1 : 0, wt = half(q) * (1 + 0.45 * g * saw(q, 0.1)), wb = half(q) * (1 + 0.45 * g * saw(q, 0.55));
        Tp.push([C[k][0] - dv / l * wt, C[k][1] + du / l * wt]); Bp.push([C[k][0] + dv / l * wb, C[k][1] - du / l * wb]);
      }
      const W = ([uu, vv]) => [J.x + tx * uu * r + nx * vv * r, J.y + ty * uu * r + ny * vv * r];
      c.globalAlpha = 0.8 * visAt(J.x, J.y);
      c.beginPath(); let q0 = W(Tp[0]); c.moveTo(q0[0], q0[1]);
      for (const p of Tp.slice(1)) { const w = W(p); c.lineTo(w[0], w[1]); }
      for (const p of Bp.reverse()) { const w = W(p); c.lineTo(w[0], w[1]); }
      c.closePath(); c.fill(); c.globalAlpha = 1; }
    // head, in head space: +x forward, +y = right side
    const a = Math.atan2(pts[0].y - pts[2].y, pts[0].x - pts[2].x);
    c.globalAlpha = visAt(pts[0].x, pts[0].y);
    if (c.globalAlpha <= 0.01) { c.globalAlpha = 1; drawClouds(c); return; }
    // the head goes to its own layer first, so it can be ringed by the same gap as a front coil when it swings over the body
    if (!hcv || hcv.width !== mcv.width || hcv.height !== mcv.height) { hcv = document.createElement('canvas'); hcv.width = mcv.width; hcv.height = mcv.height; hx = hcv.getContext('2d'); }
    hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, hcv.width, hcv.height); hx.setTransform(k, 0, 0, -k, 0, mcv.height);
    hx.fillStyle = '#f00'; hx.strokeStyle = '#f00'; hx.lineCap = 'round'; hx.lineJoin = 'round'; hx.globalAlpha = c.globalAlpha;
    c = hx;
    c.save(); c.translate(pts[0].x, pts[0].y); c.rotate(a);
    const flip = headFlip();   // keep the head upright: horns up on screen, rolled over smoothly
    c.scale(HS, HS * flip);   // head reads bigger than the body tube
    // mouth opening (Yang): BOTH jaws part about the hinge in the cheek: the whole upper head (skull, snout, horn, eye, crest,
    // whiskers) tilts up by JU, the lower jaw + cheek drops by JL
    const jaw = dg.jaw * 0.95, JU = jaw * JAW_UP, JL = jaw - JU;
    const [HX, HY] = HEAD.hinge, PX = HX * R, PY = HY * R;
    const rotAt = (ang) => { const cs = Math.cos(ang), sn = Math.sin(ang); return (x, y) => [PX + (x * cs - y * sn) * R, PY + (x * sn + y * cs) * R]; };
    const lj = rotAt(JL), uj = rotAt(-JU);   // lower-jaw / upper-head frames (R units, from the hinge) -> head space
    const upper = (fn) => { c.save(); c.translate(PX, PY); c.rotate(-JU); c.translate(-PX, -PY); fn(); c.restore(); };
    upper(() => {
    // hair (Yang's sketch): a crest of flame-like spikes along the top of the skull, brow to nape, taller and flatter toward the back,
    // plus thick wavy locks streaming back from the rear of the skull, fanned top to bottom. Roots sit on the skull outline
    // (sampled from Yang's drawing) so the hair grows out of the silhouette instead of hiding inside it.
    const CREST = [[1.07, -0.81], [0.74, -0.95], [0.41, -1.05], [0.09, -1.1], [-0.24, -1.09], [-0.5, -0.85], [-0.75, -0.62]];
    CREST.forEach(([x, y], j) => { const u = j / (CREST.length - 1);
      taper(strand(R * x, R * (y + 0.08), -1.95 - u * 0.65, -0.35, R * (0.75 + u * 0.95), j * 1.1), R * (0.55 + u * 0.15), 0); });
    const NAPE = [[-0.78, -0.66], [-0.87, -0.41], [-0.92, -0.17], [-0.86, 0.07], [-0.72, 0.31], [-0.45, 0.5]];
    // Yang: "dày lên" -- two layers: long thick locks, plus a shorter, wider-fanned undercoat so the nape reads as a full mane
    for (let j = 0; j < 26; j++) { const lay = j < 16 ? 0 : 1, n = lay ? 10 : 16, k = lay ? j - 16 : j;
      const t = (k + lay * 0.5) / n * (NAPE.length - 1), i = Math.min(NAPE.length - 2, Math.floor(t)), f = Math.min(1, t - i);
      const x = NAPE[i][0] + (NAPE[i + 1][0] - NAPE[i][0]) * f, y = NAPE[i][1] + (NAPE[i + 1][1] - NAPE[i][1]) * f;
      const L = R * (lay ? 1.3 + 0.5 * Math.abs(Math.sin(k * 2.7)) : 2.4 + 1.0 * Math.abs(Math.sin(k * 1.9 + 0.5)));
      taper(strand(R * (x + 0.15), R * y, Math.PI - y * (lay ? 1.15 : 0.8), (k % 2 ? 0.3 : -0.3), L, k * 0.65 + lay), R * (lay ? 0.55 : 0.6), 0);
    }
      // skull, snout, horn: Yang's silhouette (also covers the cheek area, so no hole shows behind it when the jaw swings)
      sprite(c, HEAD.skull, R);
    });
    // gape = triangle hinge / upper-jaw tip / lower-jaw tip, so cut and jaws always line up
    const U0 = uj(HEAD.upTip[0] - HX, HEAD.upTip[1] - HY);
    if (dg.jaw > 0.08) {   // clear the gape, glow the throat
      const L0 = lj(HEAD.loTip[0], HEAD.loTip[1]);
      c.beginPath(); c.moveTo(PX, PY); c.lineTo(U0[0], U0[1]); c.lineTo(L0[0], L0[1]); c.closePath();
      c.globalCompositeOperation = 'destination-out'; c.fill();
      const gr = c.createLinearGradient(PX, PY, U0[0], U0[1]); gr.addColorStop(0, 'rgb(0,255,0)'); gr.addColorStop(1, 'rgb(0,30,0)');
      c.globalCompositeOperation = 'lighter'; c.fillStyle = gr; c.fill();
      c.globalCompositeOperation = 'source-over'; c.fillStyle = '#f00';
      // upper fang hanging into the gape, 3/4 of the way to the snout tip
      const fx = PX + (U0[0] - PX) * 0.75, fy = PY + (U0[1] - PY) * 0.75, d = -JU;
      const fp = (u, v) => [fx + (u * Math.cos(d) - v * Math.sin(d)) * R, fy + (u * Math.sin(d) + v * Math.cos(d)) * R];
      const F = [fp(-0.12, -0.04), fp(0.02, 0.32), fp(0.14, 0.02)];
      c.beginPath(); c.moveTo(F[0][0], F[0][1]); c.lineTo(F[1][0], F[1][1]); c.lineTo(F[2][0], F[2][1]); c.fill();
    }
    // lower jaw + cheek (one piece), drawn after the cut, rotating about the hinge in the cheek; a fang; beard below
    { c.save(); c.translate(PX, PY); c.rotate(JL); sprite(c, HEAD.jaw, R); c.restore();
      if (dg.jaw > 0.08) { const f = [[1.8, 0.5], [1.92, 0.2], [2.04, 0.5]].map(([x, y]) => lj(x, y));
        c.beginPath(); c.moveTo(f[0][0], f[0][1]); c.lineTo(f[1][0], f[1][1]); c.lineTo(f[2][0], f[2][1]); c.fill(); }
      // beard (Yang's sketch): a ragged fringe of short wedges along the whole underside of the lower jaw, chin to under the cheek,
      // hanging down-back, all about the same short length
      HEAD.under.forEach(([x, y], j) => { const u = j / (HEAD.under.length - 1), p = lj(x, y - 0.04), L = R * (0.45 + 0.12 * Math.sin(j * 2.3 + 0.7) + u * 0.2);
        taper(strand(p[0], p[1], 2.0 + u * 0.25 + JL, 0.3, L, j * 0.8), R * 0.3, 0); }); }
    upper(() => {
    // long whiskers (Yang's sketch): a pair from the upper lip at the snout tip, streaming almost straight back along the mouth line
    // and well past the head, dipping a little so they clear the underside of the neck
    taper(strand(R * 2.75, R * 0.66, Math.PI - 0.05, -0.06, R * 10.0, 0, 1), R * 0.2, R * 0.02);
    taper(strand(R * 2.7, R * 0.78, Math.PI - 0.13, 0.05, R * 9.0, 2.1, 1), R * 0.18, R * 0.02);
      // eye: cut a hole so it reads as a bright eye in light mode
      c.globalCompositeOperation = 'destination-out';
      sprite(c, HEAD.eye, R);
      c.globalCompositeOperation = 'source-over';
    });
    c.globalCompositeOperation = 'source-over';
    c.restore(); c.globalAlpha = 1;
    c = mx;
    // head layer -> mask: erase a ring (the layer stamped in 8 directions, GAP wide), give the neck back, then lay the head on top
    { const d = GAP * k;
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-out';
      c.globalAlpha = 0.4; for (let j = 0; j < 8; j++) c.drawImage(hcv, Math.cos(j * Math.PI / 4) * d * 3, Math.sin(j * Math.PI / 4) * d * 3);
      c.globalAlpha = 1; for (let j = 0; j < 8; j++) c.drawImage(hcv, Math.cos(j * Math.PI / 4) * d, Math.sin(j * Math.PI / 4) * d);
      c.restore(); c.globalCompositeOperation = 'source-over';
      for (let j = Math.min(N - 1, NB + 3); j >= 1; j--) { const tj = j / (N - 1); seg(j, radAt(tj) * 2, segA(tj, j)); }
      c.globalAlpha = 1;
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(hcv, 0, 0); c.restore(); }
    drawClouds(c);
  }
  let hcv = null, hx = null;   // head layer
  // ---- calligraphy: a big running-script column 龍魂舞曲 (Long Hồn Vũ Khúc, "dance of the dragon soul", Yang's title in Chinese word order), a small column 飛龍在天,
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
    column('龍魂舞曲', x0, h * 0.08, big, 1);
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
  let maskTexW = 0, maskTexH = 0;
  function uploadMask() {   // overwrite in place; reallocate only when the size changes
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    if (maskTexW !== mcv.width || maskTexH !== mcv.height) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mcv); maskTexW = mcv.width; maskTexH = mcv.height; }
    else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, mcv);
  }
  // eye position in CSS px (HEAD.eyeAt, head space, at head scale HS, horns-up flip)
  function headPt(lx, ly) {   // head space (units of R, x forward, y down-right) -> CSS px; matches drawMask's scale 1.35 + flip
    if (dg.pts.length < 3) return { x: -1e4, y: -1e4 };   // render can run before dragonInit
    const p0 = dg.pts[0], p2 = dg.pts[2], a = Math.atan2(p0.y - p2.y, p0.x - p2.x), R = rad() * HS;
    const f = headFlip(), x = lx * R, y = ly * R * f;
    return { x: p0.x + Math.cos(a) * x - Math.sin(a) * y, y: p0.y + Math.sin(a) * x + Math.cos(a) * y };
  }
  const JAW_UP = 0.4;   // share of the mouth opening taken by the upper head tilting up; the rest drops the lower jaw
  const aboutHinge = (x, y, ang) => { const [hx, hy] = HEAD.hinge, dx = x - hx, dy = y - hy, cs = Math.cos(ang), sn = Math.sin(ang); return [hx + dx * cs - dy * sn, hy + dx * sn + dy * cs]; };
  const eye = () => { const p = aboutHinge(HEAD.eyeAt[0], HEAD.eyeAt[1], -dg.jaw * 0.95 * JAW_UP); return headPt(p[0], p[1]); };
  // mouth point for fire / pearl / throat glow: between the two jaw tips, just inside the lips. (The old triangle centroid sat a
  // third of the way from the hinge, which is under the eye, so the fire came out of the cheek.)
  const gape = () => { const j = dg.jaw * 0.95, ju = j * JAW_UP, [hx, hy] = HEAD.hinge, [lx, ly] = HEAD.loTip;
    const u = aboutHinge(HEAD.upTip[0], HEAD.upTip[1], -ju), l = [hx + lx * Math.cos(j - ju) - ly * Math.sin(j - ju), hy + lx * Math.sin(j - ju) + ly * Math.cos(j - ju)];
    return headPt(hx + ((u[0] + l[0]) / 2 - hx) * 0.82, hy + ((u[1] + l[1]) / 2 - hy) * 0.82); };
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
    pass('ink', dye.b, [dye.a.tex, maskTex], { uInk: dark ? BODY.dark : BODY.light, uK: dt * 4, uT: T, uDk: dark ? 1 : 0 }, [1 / mcv.width, 1 / mcv.height]); dye.swap();
  }
  // landscape backdrop (inject.mjs hands it over via __claudeSkinAssets.add; kept as a bitmap so a lost context can re-upload)
  let landBmp = null, landTex = null;
  function landUp() {
    if (!landBmp || landTex) return;
    landTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, landTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, landBmp); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }
  const landFit = () => { if (!landBmp) return [1, 1]; const ia = landBmp.width / landBmp.height, sa = W / Math.max(1, Hh); return sa > ia ? [1, ia / sa] : [sa / ia, 1]; };
  window.__claudeSkinAssets = {
    async add(name, b64, mime) {
      if (name !== 'landscape') return 0;
      const bin = atob(b64), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      landBmp = await createImageBitmap(new Blob([u8], { type: mime }), { imageOrientation: 'flipY' });   // ImageBitmap ignores UNPACK_FLIP_Y
      if (gl && landTex) { gl.deleteTexture(landTex); landTex = null; }
      return 1;
    },
    state: () => (landBmp ? ['landscape'] : []),
  };
  function render() {
    const e = eye();
    landUp(); pass('display', null, [dye.a.tex, maskTex, calTex, landTex || calTex], { uLand: landTex ? 1 : 0, uLandS: landFit(), uEyeA: visAt(dg.pts[0]?.x ?? 0, dg.pts[0]?.y ?? 0), uDark: dark ? 1 : 0, uCap: CAP_DARK, uBg: dark ? NIGHT : PAPER, uInk: dark ? BODY.dark : BODY.light, uT: T,
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
    // ink splatter: now and then a few droplets flick off the body's edge, more when it swims fast (sumi-e spatter)
    { const v = Math.hypot(dg.pts[0].x - dg.prev[0].x, dg.pts[0].y - dg.prev[0].y) / Math.max(dt, 1e-3) / Hh, b = dark ? BODY.dark : BODY.light;
      if (cl.ph === 'off' && Math.random() < 0.06 + v * 0.5) {
        const i = 3 + Math.floor(Math.random() * (N * 0.6)), p = dg.pts[i], q = dg.pts[i + 1], dx = q.x - p.x, dy = q.y - p.y, l = Math.hypot(dx, dy) || 1;
        const side = Math.random() < 0.5 ? -1 : 1, r = radAt(i / (N - 1));
        for (let j = 0, n = 1 + (Math.random() * 3 | 0); j < n; j++) {
          const o = r * (1.4 + Math.random() * 1.6), along = (Math.random() - 0.5) * r * 2;
          const x = p.x - dy / l * o * side + dx / l * along, y = p.y + dx / l * o * side + dy / l * along;
          dyeQ.push([x / W, 1 - y / Hh, 0.000012 + Math.random() * 0.00004, b.map(c => c * (dark ? 1.2 : 2.2))]);
        }
      } }
    // fire
    if (dg.breath > 0 && dg.jaw > 0.4) {
      // one steady jet drives the water; the flame colour goes in as several puffs strung along the cone. Three full-strength
      // jets a frame overdrove the coarse velocity grid: the flame turned into crinkled, blocky, saturated slabs.
      // Big roar: one wide, hard jet (wide = pushes a whole column of water, smooth; narrow and many = crinkles) plus a second
      // one a little down the cone keeps the flame flying far. Colour: 8 puffs strung along a cone ~4 head-widths long, widening
      // with distance; the display's soft knee and the splat cap keep the dense core vermilion instead of grey slabs.
      const m = mouth(), pal = dark ? FIRE.dark : FIRE.light, sp = Hh * 3.2, a0 = m.a + Math.sin(T * 9) * 0.1, R = rad();
      const ca = Math.cos(a0), sa = Math.sin(a0);
      // jets start ahead of the jaws: centred on the mouth, the gust blew the head's own ink away every breath and left
      // only the hidden mask's outline showing (the drawn skeleton)
      splatVel((m.x + ca * R * 1.6) / W, 1 - (m.y + sa * R * 1.6) / Hh, ca * sp * kx, -sa * sp * ky, 0.0025);
      splatVel((m.x + ca * R * 3.2) / W, 1 - (m.y + sa * R * 3.2) / Hh, ca * sp * 0.7 * kx, -sa * sp * 0.7 * ky, 0.005);
      for (let j = 0; j < 8; j++) {
        const t = Math.random(), r = R * (0.2 + t * 4), a = m.a + (Math.random() - 0.5) * (0.35 + t * 0.5), f = Math.min(1, t * 1.3 + Math.random() * 0.3);
        // size comes from the jet carrying it, not from fat puffs: a fat puff piles up to the splat cap and shows as a flat disc
        const col = pal[0].map((v, c) => (v + (pal[1][c] - v) * f) * (dark ? 0.45 : 0.62) * (1 - t * 0.4));
        dyeQ.push([(m.x + Math.cos(a) * r) / W, 1 - (m.y + Math.sin(a) * r) / Hh, (0.0008 + Math.random() * 0.001) * (1 + t * 1.2), col]);
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
    if (el < (active ? 31 : (T - lastAct < 20 ? 36 : 42))) return;   // dragon always moves: ~30 / ~28 / ~24 fps
    // motion follows real time (cap only for a stalled tab): a 1/30 cap made the idle tier and slow frames run the dragon
    // at half speed. The fluid step is capped separately, semi-Lagrangian advection stays stable at 1/15.
    const dt = Math.min(el / 1000, 0.1);
    T += dt; last = now;
    inputs(dt); flushDye(); drawMask(); uploadMask(); step(Math.min(dt, 1 / 15)); render();
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
    startBreath(e.clientX, e.clientY, 2.4); lastAct = T;
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
  const onRestored = () => { try { calTex = null; landTex = null; if (initGL()) { buildTargets(); resize(); start(); } } catch { /* stays plain */ } };

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
    window.__claudeSkinDbg = () => ({ T: +T.toFixed(2), mode: dg.mode, breath: +dg.breath.toFixed(2), head: [Math.round(dg.hx), Math.round(dg.hy)], pearl: [Math.round(pl.x), Math.round(pl.y)], sniffAt: sn.at && +(T - sn.at).toFixed(2), sniffDone: sn.done, cloud: cl.ph, fade: +cl.fade.toFixed(2), headVis: +visAt(dg.hx, dg.hy).toFixed(2), held: pl.held ? +(pl.held - T).toFixed(1) : 0, charge: +pl.charge.toFixed(2), flare: +(T - pl.flare).toFixed(2), jaw: +dg.jaw.toFixed(2), dive: cl.A ? [0, Math.round(N * 0.35), Math.round(N * 0.7), N - 1].map((i) => +(Math.hypot(dg.pts[i].x - cl.A.x, dg.pts[i].y - cl.A.y) / cloudR()).toFixed(2)) : null, headIn: cl.headIn ? +(T - cl.headIn).toFixed(1) : 0 });
    window.__claudeSkinStep = (n = 1, opts = {}) => {
      if (opts.busy != null) busy = opts.busy;
      if (opts.dark != null && opts.dark !== dark) { dark = opts.dark; clearDye(); }
      if (opts.cloud) cl.next = T;
      if (opts.throw) { const [x, y, vx, vy] = opts.throw; pl.drag = false; pl.x = x; pl.y = y; pl.vx = vx; pl.vy = vy; pl.thrown = T; pl.caught = T - 1; pl.hx = clamp(x + vx / 1.3, 50, W - 50); pl.hy = clamp(y + vy / 1.3, 50, Hh - 50); pl.nextHome = T + 9; }
      if (opts.roar) { dg.roar = T + 2.5; pl.caught = T + 2.5; }
      if (opts.breathe) startBreath(opts.breathe[0], opts.breathe[1], 2.4);
      if (opts.coil) {   // test only: lay the body in a loop that crosses itself, head in front, and draw the mask once
        const [cx, cy] = opts.coil, s = segLen(), rr = s * N / (2 * Math.PI * 1.35);
        const pose = () => { for (let i = 0; i < N; i++) { const a = -i * s / rr + Math.PI; dg.pts[i].x = cx + Math.cos(a) * rr + i * s * 0.35; dg.pts[i].y = cy + Math.sin(a) * rr; } };
        pose(); drawMask(); const m = mcv.toDataURL('image/png');
        if (!opts.run) return m;
        for (let i = 0; i < opts.run; i++) { T += 1 / 30; pose(); flushDye(); drawMask(); uploadMask(); step(1 / 30); }
        render(); return [m, cv.toDataURL('image/png')];
      }
      if (opts.ptr) { ptr.init = true; ptr.x = ptr.px = opts.ptr[0] / W; ptr.y = ptr.py = 1 - opts.ptr[1] / Hh; ptrT = T - (opts.idle || 0); sn.done = false; sn.at = 0; }
      for (let i = 0; i < n; i++) { T += 1 / 30; inputs(1 / 30); flushDye(); drawMask(); uploadMask(); step(1 / 30); }
      render(); return cv.toDataURL('image/png');
    };
    window.__claudeSkinMask = () => mcv.toDataURL('image/png');
    window.__claudeSkinMaskH = (h) => { mcv.height = h; mcv.width = Math.round(h * W / Math.max(1, Hh)); };
    window.__claudeSkinProf = (n = 20) => {   // ms per part, GPU synced after each
      const b = new Uint8Array(4), sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b), t = { inputs: 0, mask: 0, upload: 0, step: 0, render: 0 };
      const run = (k, fn) => { const t0 = performance.now(); fn(); sync(); t[k] += performance.now() - t0; };
      for (let i = 0; i < n; i++) { run('inputs', () => { inputs(1 / 30); flushDye(); }); run('mask', drawMask); run('upload', uploadMask); run('step', () => step(1 / 30)); run('render', render); }
      for (const k in t) t[k] = +(t[k] / n).toFixed(1); return t; };
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
      if (gl) { freeTargets(); gl.deleteTexture(maskTex); if (calTex) gl.deleteTexture(calTex); if (landTex) gl.deleteTexture(landTex); gl.getExtension('WEBGL_lose_context')?.loseContext(); gl = null; }
      styleEl.remove(); backdrop.remove();
    }
    delete window.__claudeSkinAssets; landBmp?.close?.();
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
    delete window.__claudeSkinStep; delete window.__claudeSkinRoll; delete window.__claudeSkinDbg; delete window.__claudeSkinPerf; delete window.__claudeSkinMask; delete window.__claudeSkinMaskH; delete window.__claudeSkinProf;
    window.__claudeSkin = false; window.__claudeSkinState = 'off';
  };

  const boot = () => { modeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] }); mq.addEventListener('change', setMode); mount(); };
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
})();
