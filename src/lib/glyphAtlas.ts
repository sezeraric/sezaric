import * as THREE from "three";

/**
 * Builds the glyph atlas the rain shader samples from.
 *
 * Generated at runtime on a 2D canvas so the site ships no image assets for it.
 * The katakana are drawn mirrored, which is what the film actually used — it is
 * the detail that separates "Matrix rain" from "green letters falling".
 */
const COLS = 16;
const ROWS = 8;
const CELL = 64;

function glyphSet(): string[] {
  const out: string[] = [];
  // Half-width katakana — the shapes the film used.
  for (let c = 0xff66; c <= 0xff9d; c++) out.push(String.fromCharCode(c));
  for (let d = 0; d <= 9; d++) out.push(String(d));
  for (const ch of "ABCDEFZ:.=*+-<>¦｜╌") out.push(ch);
  // Pad out to a full atlas by repeating.
  while (out.length < COLS * ROWS) out.push(out[out.length % 64]);
  return out.slice(0, COLS * ROWS);
}

let cached: THREE.Texture | null = null;

export function glyphAtlas(): THREE.Texture {
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(CELL * 0.72)}px ui-monospace, "SF Mono", Menlo, monospace`;

  const chars = glyphSet();
  chars.forEach((ch, i) => {
    const cx = (i % COLS) * CELL + CELL / 2;
    const cy = Math.floor(i / COLS) * CELL + CELL / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(-1, 1); // mirrored, as in the film
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;

  cached = tex;
  return tex;
}

export const ATLAS_GRID = { cols: COLS, rows: ROWS };
