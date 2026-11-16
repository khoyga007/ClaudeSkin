// Unpack a Wallpaper Engine scene.pkg for a ClaudeSkin theme.
// Usage: node we-extract.mjs <scene.pkg | workshop id> <theme>
//   textures (.tex)  -> assets/<theme>/<basename>.png   (RGBA8888 raw/LZ4, or the embedded PNG/JPG as-is)
//   sounds           -> music/<theme>/
//   scene/effect/shader text -> assets/<theme>/_src/ (reference for porting, never sent to the app)
// Both folders are gitignored: workshop art and music belong to their authors, local use only.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let [src, theme] = process.argv.slice(2);
if (!src || !theme) { console.log('usage: node we-extract.mjs <scene.pkg | workshop id> <theme>'); process.exit(1); }
if (/^\d+$/.test(src)) {
  const roots = ['D:/SteamLibrary/steamapps', 'C:/Program Files (x86)/Steam/steamapps'];
  src = roots.map((r) => `${r}/workshop/content/431960/${src}/scene.pkg`).find(existsSync) || src;
}
theme = theme.replace(/[^a-z0-9-]/gi, '');
const ASSETS = path.join(HERE, 'assets', theme), MUSIC = path.join(HERE, 'music', theme);

const b = readFileSync(src);
let o = 0;
const u32 = () => { const v = b.readUInt32LE(o); o += 4; return v; };
const str = () => { const n = u32(); const s = b.toString('latin1', o, o + n); o += n; return s; };
str();   // PKGV00xx
const files = Array.from({ length: u32() }, () => ({ name: str(), off: u32(), size: u32() }));
const base = o;
for (const f of files) {
  const data = b.subarray(base + f.off, base + f.off + f.size);
  const ext = path.extname(f.name).toLowerCase(), bn = path.basename(f.name, ext);
  let out;
  if (ext === '.tex') {
    try { const t = tex(data); out = path.join(ASSETS, bn + t.ext); write(out, t.buf); console.log(`tex  ${f.name} -> ${path.basename(out)} ${t.w}x${t.h}`); }
    catch (e) { console.log(`skip ${f.name}: ${e.message}`); }
  } else if (f.name.startsWith('sounds/')) {
    write(out = path.join(MUSIC, path.basename(f.name)), data); console.log(`snd  ${f.name}`);
  } else {
    write(path.join(ASSETS, '_src', f.name), data);
  }
}
console.log(`done: ${files.length} files from ${src}`);

function write(p, d) { mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, d); }

// .tex: TEXV0005 / TEXI0001 header (format, flags, texW, texH, imgW, imgH) / TEXB000n image block.
// Only mip 0 of image 0 is kept. Raw pixels are padded to texW: crop to imgW x imgH.
function tex(d) {
  let p = 0;
  const cstr = () => { const e = d.indexOf(0, p); const s = d.toString('latin1', p, e); p = e + 1; return s; };
  const i32 = () => { const v = d.readInt32LE(p); p += 4; return v; };
  if (cstr() !== 'TEXV0005') throw new Error('not TEXV0005');
  cstr();
  const fmt = i32(); i32(); i32(); i32(); const iw = i32(), ih = i32(); i32();
  const bver = cstr(); i32();
  const fif = bver >= 'TEXB0003' ? i32() : -1;
  i32();   // mip count
  const w = i32(), h = i32();
  let comp = 0, dsz = 0;
  if (bver >= 'TEXB0002') { comp = i32(); dsz = i32(); }
  const sz = i32();
  let px = d.subarray(p, p + sz);
  if (comp) px = lz4(px, dsz);
  if (fif !== -1) {   // embedded image file (FreeImage format id)
    const ext = { 0: '.bmp', 2: '.jpg', 13: '.png', 25: '.gif' }[fif];
    if (!ext) throw new Error('embedded format ' + fif);
    return { ext, buf: px, w: iw, h: ih };
  }
  if (fmt !== 0) throw new Error('pixel format ' + fmt + ' (DXT/R8/RG88 not supported)');
  const crop = Buffer.alloc(iw * ih * 4);
  for (let y = 0; y < ih; y++) px.copy(crop, y * iw * 4, y * w * 4, y * w * 4 + iw * 4);
  return { ext: '.png', buf: png(crop, iw, ih), w: iw, h: ih };
}

function lz4(src, n) {   // LZ4 block format
  const dst = Buffer.alloc(n);
  let s = 0, d = 0;
  while (s < src.length) {
    const tok = src[s++];
    let lit = tok >> 4;
    if (lit === 15) { let x; do { x = src[s++]; lit += x; } while (x === 255); }
    src.copy(dst, d, s, s + lit); s += lit; d += lit;
    if (s >= src.length) break;
    const off = src[s] | (src[s + 1] << 8); s += 2;
    let ml = tok & 15;
    if (ml === 15) { let x; do { x = src[s++]; ml += x; } while (x === 255); }
    ml += 4;
    for (let k = 0; k < ml; k++, d++) dst[d] = dst[d - off];
  }
  return dst;
}

function png(px, w, h) {
  const row = w * 4 + 1, raw = Buffer.alloc(row * h);
  for (let y = 0; y < h; y++) px.copy(raw, y * row + 1, y * w * 4, (y + 1) * w * 4);
  const T = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; T[n] = c >>> 0; }
  const crc = (buf) => { let c = 0xffffffff; for (const x of buf) c = T[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
