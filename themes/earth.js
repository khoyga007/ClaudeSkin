// ClaudeSkin v2 — "Earth Glass": Claude's warm earth palette + liquid-glass panels.
// Keeps the app's light mode and dark-on-light text; only warms text tokens (never lighter).
// Pure local code: no network, no storage, reads nothing from the conversation.
(() => {
  if (window.top !== window) return;
  if (typeof window.__claudeSkinCleanup === 'function') window.__claudeSkinCleanup();
  window.__claudeSkin = true;
  window.__claudeSkinBase = [221, 190, 165];   // sand tinted by clay blob (audit worst case)

  const isDark = () => {
    const m = document.documentElement.dataset.mode;
    return m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  };

  // ---- palette -------------------------------------------------------------
  const SAND = '#EFE6D8';                 // page base
  const GLASS = 'rgba(255, 250, 243, 0.44)';
  const GLASS_SOFT = 'rgba(255, 251, 246, 0.30)';
  const GLASS_EDGE = 'rgba(255, 255, 255, 0.65)';
  const SHADOW = 'rgba(84, 52, 24, 0.14)';
  const CLAY = '217, 119, 87';            // Claude brand clay
  const OCHRE = '212, 163, 90';
  const SAGE = '143, 154, 107';
  const UMBER = '139, 94, 60';

  const css = `
:root:not([data-mode="dark"]) {
  /* warm, slightly darker text than stock -> keeps >=4.5:1 on translucent glass */
  --text-000: 30 12% 9% !important;
  --text-100: 30 10% 12% !important;
  --text-200: 30 7% 20% !important;
  --text-300: 30 7% 20% !important;
  --text-400: 30 6% 33% !important;
  --text-500: 30 6% 33% !important;
  --cds-text-primary: #1d1915 !important;
  --cds-text-secondary: #4a4239 !important;
  --cds-text-stays-secondary: #4a4239 !important;
  --cds-text-muted: #62594e !important;
  --border-100: 30 25% 22% !important;
  --border-200: 30 25% 22% !important;
  --border-300: 30 25% 22% !important;
  --border-400: 30 25% 22% !important;
  --cds-border: rgba(110, 72, 40, 0.14) !important;
  --cds-border-line: rgba(110, 72, 40, 0.16) !important;
  --cds-surface-0: ${GLASS_SOFT} !important;
  --cds-surface-1: ${GLASS_SOFT} !important;
  --cds-surface-2: ${GLASS} !important;
  --cds-surface-3: rgba(255, 252, 248, 0.82) !important;
  --cds-surface-popover: rgba(255, 251, 246, 0.94) !important;
}
:root:not([data-mode="dark"]) { background: ${SAND} !important; }
:root:not([data-mode="dark"]) body { background: transparent !important; }

/* app's own opaque page layers -> let the backdrop through */
:root:not([data-mode="dark"]) body > div.grid,
:root:not([data-mode="dark"]) .dframe-content,
:root:not([data-mode="dark"]) .dframe-nav-scroll,
:root:not([data-mode="dark"]) div.pointer-events-none.absolute.inset-0.bg-surface-1 {
  background: transparent !important;
}
/* transcript edge fades were white -> fade into nothing */
:root:not([data-mode="dark"]) [class*="bg-[var(--epitaxy-transc"] { background: transparent !important; }

/* liquid glass: only 2 big blurred regions (perf) */
:root:not([data-mode="dark"]) .dframe-sidebar,
:root:not([data-mode="dark"]) .tiles-shell {
  background: ${GLASS} !important;
  backdrop-filter: blur(22px) saturate(1.45);
  -webkit-backdrop-filter: blur(22px) saturate(1.45);
  box-shadow: inset 0 1px 0 ${GLASS_EDGE}, inset 0 0 0 1px rgba(255,255,255,0.35), 0 10px 40px ${SHADOW};
}
:root:not([data-mode="dark"]) .tiles-shell { border-radius: 18px; }
/* cards: translucent, no blur */
:root:not([data-mode="dark"]) .epitaxy-code-card {
  background: rgba(255, 252, 248, 0.72) !important;
  box-shadow: inset 0 1px 0 ${GLASS_EDGE};
}
:root:not([data-mode="dark"]) ::selection { background: rgba(${CLAY}, 0.28); }
:root:not([data-mode="dark"]) textarea:focus-visible,
:root:not([data-mode="dark"]) [contenteditable="true"]:focus-visible { outline-color: rgb(${CLAY}) !important; }

#cs-backdrop { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: ${SAND}; }
:root[data-mode="dark"] #cs-backdrop { display: none; }
.cs-blob { position: absolute; border-radius: 50%; will-change: transform; }
#cs-b1 { width: 70vmax; height: 70vmax; left: -22vmax; top: -30vmax; background: radial-gradient(closest-side, rgba(${CLAY}, 0.52), transparent); animation: cs-a 26s ease-in-out infinite alternate; }
#cs-b2 { width: 60vmax; height: 60vmax; right: -20vmax; top: -10vmax; background: radial-gradient(closest-side, rgba(${OCHRE}, 0.46), transparent); animation: cs-b 31s ease-in-out infinite alternate; }
#cs-b3 { width: 65vmax; height: 65vmax; left: 10vmax; bottom: -38vmax; background: radial-gradient(closest-side, rgba(${SAGE}, 0.40), transparent); animation: cs-c 37s ease-in-out infinite alternate; }
#cs-b4 { width: 45vmax; height: 45vmax; right: -12vmax; bottom: -20vmax; background: radial-gradient(closest-side, rgba(${UMBER}, 0.32), transparent); animation: cs-a 29s ease-in-out infinite alternate-reverse; }
@keyframes cs-a { to { transform: translate3d(16vmax, 12vmax, 0) scale(1.18) rotate(40deg); } }
@keyframes cs-b { to { transform: translate3d(-14vmax, 16vmax, 0) scale(0.86) rotate(-30deg); } }
@keyframes cs-c { to { transform: translate3d(10vmax, -12vmax, 0) scale(1.08); } }
/* opaque wrappers found at runtime under the glass */
:root:not([data-mode="dark"]) [data-cs-clear] { background: transparent !important; }
/* cursor light: lives in the backdrop, seen through the glass blur */
#cs-cursor { position: absolute; left: 0; top: 0; width: 46vmax; height: 46vmax; margin: -23vmax 0 0 -23vmax; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255, 236, 214, 0.95), rgba(${CLAY}, 0.32) 45%, transparent); will-change: transform; }
/* click ripple */
#cs-fx { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; overflow: hidden; }
.cs-ripple { position: absolute; width: 120px; height: 120px; margin: -60px 0 0 -60px; border-radius: 50%;
  border: 2px solid rgba(${CLAY}, 0.55); background: radial-gradient(closest-side, rgba(${CLAY}, 0.16), transparent);
  animation: cs-rip 620ms cubic-bezier(.2,.7,.3,1) forwards; }
@keyframes cs-rip { from { transform: scale(0.15); opacity: 1; } to { transform: scale(1.6); opacity: 0; } }
/* hover feel */
:root:not([data-mode="dark"]) .dframe-sidebar a, :root:not([data-mode="dark"]) .dframe-sidebar button { transition: background-color .18s ease, transform .18s ease; }
:root:not([data-mode="dark"]) .dframe-sidebar a:hover, :root:not([data-mode="dark"]) .dframe-sidebar button:hover { background-color: rgba(255, 255, 255, 0.55) !important; transform: translateX(2px); }
:root:not([data-mode="dark"]) .epitaxy-code-card { transition: transform .2s ease, box-shadow .2s ease; }
:root:not([data-mode="dark"]) .epitaxy-code-card:hover { transform: translateY(-1px); box-shadow: inset 0 1px 0 ${GLASS_EDGE}, 0 8px 24px ${SHADOW}; }
`;

  const ctx = new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true });
  function rgba(c) {
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  }

  // ---- mount ---------------------------------------------------------------
  let styleEl, backdrop, fx, clearTimer = 0;
  function mount() {
    if (isDark()) { window.__claudeSkinState = 'skipped-dark'; return; }
    styleEl = document.createElement('style'); styleEl.id = 'cs-style'; styleEl.textContent = css;
    document.head.appendChild(styleEl);
    backdrop = document.createElement('div'); backdrop.id = 'cs-backdrop';
    backdrop.innerHTML = '<div id="cs-b1" class="cs-blob"></div><div id="cs-b2" class="cs-blob"></div><div id="cs-b3" class="cs-blob"></div><div id="cs-b4" class="cs-blob"></div><div id="cs-cursor"></div>';
    document.body.prepend(backdrop);
    fx = document.createElement('div'); fx.id = 'cs-fx'; document.body.appendChild(fx);
    clearUnder(); clearTimer = setInterval(clearUnder, 2000);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown, { passive: true });
    window.__claudeSkinState = 'on';
  }

  // Make opaque wrappers under the glass regions transparent (app re-renders -> re-check).
  function clearUnder() {
    for (const sel of ['.tiles-shell', '.dframe-sidebar']) {
      const el = document.querySelector(sel);
      for (let p = el?.parentElement; p && p !== document.body; p = p.parentElement) {
        if (p.hasAttribute('data-cs-clear')) continue;
        if (rgba(getComputedStyle(p).backgroundColor)[3] > 0.85) p.setAttribute('data-cs-clear', '');
      }
    }
  }

  // Cursor light follows the pointer with easing; loop stops when settled.
  let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, raf = 0;
  function step() {
    cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
    const c = document.getElementById('cs-cursor');
    if (c) c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(step) : 0;
  }
  function onMove(e) { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(step); }
  function onDown(e) {
    if (!fx || (styleEl && styleEl.disabled)) return;
    const r = document.createElement('div'); r.className = 'cs-ripple';
    r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
    r.addEventListener('animationend', () => r.remove(), { once: true });
    fx.appendChild(r);
  }
  const onKey = (e) => {   // Ctrl+Alt+G: theme on/off
    if (e.ctrlKey && e.altKey && e.code === 'KeyG' && styleEl) {
      styleEl.disabled = !styleEl.disabled; backdrop.style.display = fx.style.display = styleEl.disabled ? 'none' : '';
    }
  };
  addEventListener('keydown', onKey, true);
  window.__claudeSkinCleanup = () => {
    removeEventListener('keydown', onKey, true);
    removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown);
    clearInterval(clearTimer); cancelAnimationFrame(raf);
    for (const el of document.querySelectorAll('[id^="cs-"]')) el.remove();
    for (const el of document.querySelectorAll('[data-cs-clear]')) el.removeAttribute('data-cs-clear');
    window.__claudeSkin = false; window.__claudeSkinState = 'off';
  };

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();
