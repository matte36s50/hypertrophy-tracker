// Generates the PWA PNG icons with no external dependencies (uses Node's zlib).
// Draws a light square with a green dumbbell. Run: node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "icons");
mkdirSync(OUT_DIR, { recursive: true });

// --- tiny PNG encoder (RGBA, 8-bit) ---
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // rest 0 (compression/filter/interlace)
  // add filter byte (0) at the start of each scanline
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- drawing ---
function hex(c) {
  return [
    parseInt(c.slice(1, 3), 16),
    parseInt(c.slice(3, 5), 16),
    parseInt(c.slice(5, 7), 16),
  ];
}
function draw(size) {
  const bg = hex("#eef1ee");
  const ring = hex("#e7ebe7");
  const blue = hex("#10a05a");
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;

  const set = (x, y, [r, g, b]) => {
    const i = (y * size + x) * 4;
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
    rgba[i + 3] = 255;
  };

  // Dumbbell geometry (proportional to size).
  const barH = size * 0.10;
  const barW = size * 0.34;
  const plateW = size * 0.10;
  const plateH = size * 0.30;
  const capW = size * 0.05;
  const capH = size * 0.42;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Background: subtle radial-ish darkening handled by flat fill + ring.
      let color = bg;
      const dx = x - cx;
      const dy = y - cy;
      // faint inner circle for depth
      if (dx * dx + dy * dy < (size * 0.46) ** 2) color = ring;

      // dumbbell — drawn in blue on top
      const inBar =
        Math.abs(dy) <= barH / 2 && Math.abs(dx) <= barW / 2;
      const inPlateL =
        dx < -barW / 2 + 1 &&
        dx >= -barW / 2 - plateW &&
        Math.abs(dy) <= plateH / 2;
      const inPlateR =
        dx > barW / 2 - 1 &&
        dx <= barW / 2 + plateW &&
        Math.abs(dy) <= plateH / 2;
      const inCapL =
        dx < -barW / 2 - plateW + 1 &&
        dx >= -barW / 2 - plateW - capW &&
        Math.abs(dy) <= capH / 2;
      const inCapR =
        dx > barW / 2 + plateW - 1 &&
        dx <= barW / 2 + plateW + capW &&
        Math.abs(dy) <= capH / 2;

      if (inBar || inPlateL || inPlateR || inCapL || inCapR) color = blue;

      set(x, y, color);
    }
  }
  return encodePNG(size, size, rgba);
}

writeFileSync(join(OUT_DIR, "icon-192.png"), draw(192));
writeFileSync(join(OUT_DIR, "icon-512.png"), draw(512));
// Maskable: same art but the safe zone is smaller, so the dumbbell already
// sits well within the central 80%.
writeFileSync(join(OUT_DIR, "maskable-512.png"), draw(512));
// Apple touch icon (180x180).
writeFileSync(join(OUT_DIR, "apple-touch-icon.png"), draw(180));

console.log("Icons written to", OUT_DIR);
