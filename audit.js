// Shared WCAG contrast audit; inject.mjs runs it stock vs themed and rolls back if worse.
// Theme sets window.__claudeSkinBase = worst-case [r,g,b] showing through its glass.
(() => {
  const ctx = new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true });
  function rgba(c) {   // any CSS color -> [r,g,b,a]; paint on a cleared pixel and read back
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  }
  const over = (top, under) => top.slice(0, 3).map((v, i) => v * top[3] + under[i] * (1 - top[3]));
  const lum = (c) => { const f = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

  // Worst-case page base under glass = sand tinted by the clay blob.
  window.__claudeSkinAudit = (themed) => {
    const base = themed ? (window.__claudeSkinBase || [221, 190, 165]) : [255, 255, 255];
    const els = [...document.querySelectorAll('body *')].filter((e) => {
      if (e.closest('#cs-backdrop') || !e.childNodes.length) return false;
      const t = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!t) return false;
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
    }).slice(0, 500);
    let fails = 0; const worst = [];
    for (const e of els) {
      const s = getComputedStyle(e);
      if (s.visibility === 'hidden' || Number(s.opacity) < 0.5) continue;
      const layers = [];
      for (let p = e; p && p !== document.documentElement; p = p.parentElement) {
        const b = rgba(getComputedStyle(p).backgroundColor);
        if (b[3] > 0) { layers.push(b); if (b[3] >= 0.99) break; }
      }
      let bg = base;
      for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg);
      const fgc = rgba(s.color); const fg = over(fgc, bg);
      const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && Number(s.fontWeight) >= 700);
      const r = ratio(fg, bg);
      if (r < (large ? 3 : 4.5)) { fails++; if (worst.length < 6) worst.push(`${r.toFixed(2)} ${e.tagName}.${String(e.className).slice(0, 30)} "${e.textContent.trim().slice(0, 24)}"`); }
    }
    return { n: els.length, fails, worst };
  };
})();
