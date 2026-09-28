/**
 * A small swarm of code glyphs that can hold a shape, drop out of it as
 * falling rain, and be caught back into it.
 *
 * The same idea as the experience stage's cloud (every particle has a home in
 * the form; it leaves and returns on its own small delay), at a size where a
 * 2D canvas is cheaper than a WebGL context: a few hundred glyphs for the
 * white rabbit, the spoon. The owner supplies the homes — normalised to the
 * canvas box — and may move them every frame (the spoon bends that way).
 *
 * Nothing here touches React; the owning component drives it from a frame
 * loop that only runs while the canvas is on screen.
 */

const GLYPHS = (() => {
  const out: string[] = [];
  for (let c = 0xff66; c <= 0xff9d; c++) out.push(String.fromCharCode(c));
  for (let d = 0; d <= 9; d++) out.push(String(d));
  for (const ch of ":.=*+-<>") out.push(ch);
  return out;
})();

const TINTS = ["#d9ffe4", "#4dff85", "#12b347"];
export const GLYPH_CELL = 32;
export const GLYPH_COUNT = GLYPHS.length;
const CELL = GLYPH_CELL;

let sheet: HTMLCanvasElement | null = null;
/** Every glyph, mirrored as in the film, pre-tinted in three strengths. */
export function glyphSheet(): HTMLCanvasElement {
  if (sheet) return sheet;
  const c = document.createElement("canvas");
  c.width = GLYPHS.length * CELL;
  c.height = TINTS.length * CELL;
  const ctx = c.getContext("2d")!;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(CELL * 0.78)}px ui-monospace, "SF Mono", Menlo, monospace`;
  TINTS.forEach((tint, row) => {
    ctx.fillStyle = tint;
    GLYPHS.forEach((ch, i) => {
      ctx.save();
      ctx.translate(i * CELL + CELL / 2, row * CELL + CELL / 2);
      ctx.scale(-1, 1);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
  });
  sheet = c;
  return c;
}

export type Homes = Float32Array; // (x, y, brightness) per particle, x/y in 0..1

export type SwarmMode = "held" | "falling";

export class GlyphSwarm {
  readonly count: number;
  private ctx: CanvasRenderingContext2D;
  private w = 1;
  private h = 1;
  private dpr = 1;
  private x: Float32Array;
  private y: Float32Array;
  private vx: Float32Array;
  private vy: Float32Array;
  private speed: Float32Array;
  private delay: Float32Array;
  private glyph: Uint8Array;
  private seed: Float32Array;
  /** When each particle is released to its home (seconds, loop clock). */
  private catchAt = 0;
  mode: SwarmMode = "falling";
  homes: Homes;
  /** Glyph size, CSS px. */
  glyphPx: number;
  /** Where the box the homes are normalised to sits, CSS px. */
  box = { x: 0, y: 0, w: 1, h: 1 };
  pointer = { x: -1e4, y: -1e4 };
  /** Radius the pointer pushes glyphs away within, CSS px. */
  repel = 34;

  constructor(canvas: HTMLCanvasElement, count: number, glyphPx: number) {
    this.ctx = canvas.getContext("2d")!;
    this.count = count;
    this.glyphPx = glyphPx;
    this.x = new Float32Array(count);
    this.y = new Float32Array(count);
    this.vx = new Float32Array(count);
    this.vy = new Float32Array(count);
    this.speed = new Float32Array(count);
    this.delay = new Float32Array(count);
    this.glyph = new Uint8Array(count);
    this.seed = new Float32Array(count);
    this.homes = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      this.speed[i] = 110 + Math.random() * 260;
      this.delay[i] = Math.random();
      this.glyph[i] = Math.floor(Math.random() * GLYPHS.length);
      this.seed[i] = Math.random() * 100;
    }
    glyphSheet();
  }

  resize(width: number, height: number) {
    const canvas = this.ctx.canvas;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, width);
    this.h = Math.max(1, height);
    canvas.width = Math.round(this.w * this.dpr);
    canvas.height = Math.round(this.h * this.dpr);
  }

  private homeX(i: number) {
    return this.box.x + this.homes[i * 3] * this.box.w;
  }
  private homeY(i: number) {
    return this.box.y + this.homes[i * 3 + 1] * this.box.h;
  }

  /** Put every glyph home at once (reduced motion, or a first static frame). */
  settle() {
    for (let i = 0; i < this.count; i++) {
      this.x[i] = this.homeX(i);
      this.y[i] = this.homeY(i);
      this.vx[i] = 0;
      this.vy[i] = 0;
    }
    this.mode = "held";
    this.catchAt = -1e9;
  }

  /** Start as rain above the canvas, then catch every glyph into the shape. */
  rainIn(now: number, spread = 1) {
    for (let i = 0; i < this.count; i++) {
      this.x[i] = this.homeX(i) + (Math.random() - 0.5) * 6;
      this.y[i] = -Math.random() * this.h * spread - 10;
      this.vx[i] = 0;
      this.vy[i] = this.speed[i];
    }
    this.catch(now);
  }

  /** Catch whatever is falling back into the shape, over the next second. */
  catch(now: number) {
    this.mode = "held";
    this.catchAt = now;
  }

  /** Let go: the shape turns into falling code. */
  release() {
    this.mode = "falling";
    for (let i = 0; i < this.count; i++) {
      this.vx[i] *= 0.3;
      this.vy[i] = Math.max(this.vy[i], this.speed[i] * (0.4 + 0.6 * this.delay[i]));
    }
  }

  /** True once every glyph has fallen out of the canvas. */
  get empty() {
    if (this.mode !== "falling") return false;
    for (let i = 0; i < this.count; i++) if (this.y[i] < this.h + this.glyphPx) return false;
    return true;
  }

  step(dt: number, now: number) {
    const k = 90; // spring
    const c = 2 * Math.sqrt(k) * 0.72; // just under critical damping: a small settle
    const R = this.repel;
    for (let i = 0; i < this.count; i++) {
      const caught = this.mode === "held" && now >= this.catchAt + this.delay[i] * 0.9;
      if (caught) {
        const s = this.seed[i];
        const hx = this.homeX(i) + Math.sin(now * 1.3 + s) * 0.35;
        const hy = this.homeY(i) + Math.cos(now * 1.1 + s) * 0.35;
        let ax = (hx - this.x[i]) * k - this.vx[i] * c;
        let ay = (hy - this.y[i]) * k - this.vy[i] * c;
        const dx = this.x[i] - this.pointer.x;
        const dy = this.y[i] - this.pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / R) * (1 - d / R) * 5200;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
        this.vx[i] += ax * dt;
        this.vy[i] += ay * dt;
      } else {
        // Falling: straight down at its own speed, as the rain does.
        this.vx[i] *= 0.9;
        this.vy[i] += (this.speed[i] - this.vy[i]) * Math.min(1, dt * 4);
      }
      this.x[i] += this.vx[i] * dt;
      this.y[i] += this.vy[i] * dt;

      // Glyphs re-roll now and then, and constantly while moving fast.
      const moving = Math.abs(this.vx[i]) + Math.abs(this.vy[i]);
      if (Math.random() < dt * (0.35 + moving * 0.02)) {
        this.glyph[i] = Math.floor(Math.random() * GLYPHS.length);
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const src = glyphSheet();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.globalCompositeOperation = "lighter";
    const s = this.glyphPx;
    for (let i = 0; i < this.count; i++) {
      const x = this.x[i];
      const y = this.y[i];
      if (y < -s || y > this.h + s || x < -s || x > this.w + s) continue;
      const b = this.homes[i * 3 + 2];
      const speed = Math.abs(this.vy[i]) + Math.abs(this.vx[i]);
      // Fast glyphs burn bright, like the head of a rain column.
      const tint = speed > 160 && this.delay[i] > 0.85 ? 0 : b > 0.8 ? 0 : b > 0.45 ? 1 : 2;
      ctx.globalAlpha = Math.min(1, 0.35 + b * 0.75);
      ctx.drawImage(src, this.glyph[i] * CELL, tint * CELL, CELL, CELL, x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
}

/**
 * Sample homes from a silhouette drawn on a canvas. Returns (x, y, bright)
 * normalised to the drawing's box, with brightness higher near the outline so
 * the shape reads crisply even as a scatter of glyphs.
 */
export function homesFromDrawing(
  count: number,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): Homes {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  draw(ctx);
  const data = ctx.getImageData(0, 0, width, height).data;
  const filled = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height && data[(y * width + x) * 4 + 3] > 128;
  const inside: number[] = [];
  const edge: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!filled(x, y)) continue;
      const rim = !filled(x - 3, y) || !filled(x + 3, y) || !filled(x, y - 3) || !filled(x, y + 3);
      (rim ? edge : inside).push(x, y);
    }
  }
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const useEdge = edge.length && (Math.random() < 0.42 || !inside.length);
    const src = useEdge ? edge : inside;
    const p = Math.floor(Math.random() * (src.length / 2)) * 2;
    out[i * 3] = (src[p] + Math.random()) / width;
    out[i * 3 + 1] = (src[p + 1] + Math.random()) / height;
    out[i * 3 + 2] = useEdge ? 0.75 + Math.random() * 0.25 : 0.3 + Math.random() * 0.45;
  }
  return out;
}
