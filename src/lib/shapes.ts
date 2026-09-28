/**
 * The forms the particle cloud can take.
 *
 * Every generator returns the same thing: `count` points as a flat
 * Float32Array of (x, y, z, w). x/y/z are in "form units" — each form fits
 * y ∈ [-1, 1] and reports how far it reaches sideways so the stage can size it
 * to the space it has. w is the particle's brightness in that form, 0..1: the
 * rim of a phone is brighter than its screen, a cheekbone brighter than hair.
 *
 * The same index is the same particle in every form. That is the whole trick:
 * the stage never moves particles from A to B by searching for neighbours, it
 * just blends each particle's address in one form with its address in the
 * next. A seeded random keeps the layout identical on every visit.
 */

export type Form = {
  points: Float32Array;
  /** Half-width of the form in form units (its half-height is 1). */
  reachX: number;
  /** Whether the form is falling code — the stage animates those. */
  rain?: boolean;
};

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

/** Shuffle which particle takes which slot, so no form is filled in order. */
function scatter(points: Float32Array, rand: () => number) {
  const n = points.length / 4;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    for (let k = 0; k < 4; k++) {
      const t = points[i * 4 + k];
      points[i * 4 + k] = points[j * 4 + k];
      points[j * 4 + k] = t;
    }
  }
  return points;
}

function build(count: number, seed: number, fill: (put: (x: number, y: number, z: number, w: number) => void, rand: () => number, i: number) => void) {
  const out = new Float32Array(count * 4);
  const rand = rng(seed);
  let i = 0;
  const put = (x: number, y: number, z: number, w: number) => {
    out[i * 4] = x;
    out[i * 4 + 1] = y;
    out[i * 4 + 2] = z;
    out[i * 4 + 3] = w;
  };
  for (i = 0; i < count; i++) fill(put, rand, i);
  return scatter(out, rand);
}

/** Pick a region by weight: `pick(rand, [0.2, 0.5, 0.3])` → 0, 1 or 2. */
function pick(rand: () => number, weights: number[]) {
  let r = rand();
  for (let k = 0; k < weights.length; k++) {
    if ((r -= weights[k]) <= 0) return k;
  }
  return weights.length - 1;
}

// --- the code ----------------------------------------------------------------

/** Columns of glyphs through a deep volume. The stage makes them fall. */
export function rainForm(count: number): Form {
  const COL = 0.085;
  return {
    rain: true,
    // Deliberately less than its real width: the code overflows the space
    // it is given and fades out at the edges, like the rain on the rest of
    // the page.
    reachX: 1.4,
    points: build(count, 11, (put, r) => {
      const x = Math.round(((r() - 0.5) * 4.8) / COL) * COL;
      const z = Math.round(((r() - 0.5) * 2.4) / COL) * COL;
      const y = Math.round(((r() - 0.5) * 3.4) / 0.07) * 0.07;
      put(x, y, z, 0.2 + 0.8 * Math.pow(r(), 2.2));
    }),
  };
}

// --- one form per role --------------------------------------------------------

/** React: three electron orbits around a nucleus. */
export function atomForm(count: number): Form {
  const A = 1.28;
  const B = 0.44;
  return {
    reachX: 1.3,
    points: build(count, 21, (put, r) => {
      const k = pick(r, [0.14, 0.26, 0.26, 0.26, 0.08]);
      if (k === 0) {
        // Nucleus: a dense little sphere.
        const u = r() * 2 - 1;
        const a = r() * TAU;
        const s = Math.sqrt(1 - u * u);
        const rad = 0.2 * Math.cbrt(r());
        put(s * Math.cos(a) * rad, u * rad, s * Math.sin(a) * rad, 0.75 + 0.25 * r());
        return;
      }
      if (k === 4) {
        // A faint halo so the form has a volume, not just lines.
        const u = r() * 2 - 1;
        const a = r() * TAU;
        const s = Math.sqrt(1 - u * u);
        const rad = 0.45 + r() * 0.9;
        put(s * Math.cos(a) * rad * 1.1, u * rad * 0.8, s * Math.sin(a) * rad * 0.6, 0.12 + 0.15 * r());
        return;
      }
      const tilt = ((k - 1) * Math.PI) / 3;
      const t = r() * TAU;
      const jitter = 0.022;
      const ex = Math.cos(t) * A + (r() - 0.5) * jitter;
      const ey = Math.sin(t) * B + (r() - 0.5) * jitter;
      const ez = (r() - 0.5) * 0.05;
      // Electrons: a bright bead on each orbit.
      const bead = Math.abs(((t + k * 2.1) % TAU) - 1) < 0.12 ? 1 : 0;
      put(ex * Math.cos(tilt) - ey * Math.sin(tilt), ex * Math.sin(tilt) + ey * Math.cos(tilt), ez, bead ? 1 : 0.55 + 0.2 * r());
    }),
  };
}

/** Health technology: the double helix, with its base pairs. */
export function helixForm(count: number): Form {
  const R = 0.5;
  const TURNS = 2.2;
  return {
    reachX: 0.9,
    points: build(count, 31, (put, r) => {
      const k = pick(r, [0.34, 0.34, 0.26, 0.06]);
      const y = (r() * 2 - 1) * 0.98;
      const a = y * TURNS * Math.PI;
      if (k < 2) {
        const phase = k === 0 ? 0 : Math.PI;
        const w = 0.07;
        put(Math.cos(a + phase) * R + (r() - 0.5) * w, y, Math.sin(a + phase) * R + (r() - 0.5) * w, 0.7 + 0.3 * r());
      } else if (k === 2) {
        // Rungs, one every few hundredths.
        const step = 0.085;
        const yy = Math.round(y / step) * step;
        const aa = yy * TURNS * Math.PI;
        const s = r() * 2 - 1;
        put(Math.cos(aa) * R * s, yy + (r() - 0.5) * 0.012, Math.sin(aa) * R * s, 0.35 + 0.25 * r());
      } else {
        const rad = R * (1.4 + r() * 0.6);
        const t = r() * TAU;
        put(Math.cos(t) * rad, y, Math.sin(t) * rad, 0.1 + 0.12 * r());
      }
    }),
  };
}

/** Cross-platform mobile: a phone, with an app on its screen. */
export function phoneForm(count: number): Form {
  const W = 0.52;
  const H = 1.0;
  const RAD = 0.09;
  // A point on the rounded-rectangle outline, t in 0..1, clockwise from the top.
  const outline = (t: number, w: number, h: number, rad: number): [number, number] => {
    const sw = 2 * (w - rad);
    const sh = 2 * (h - rad);
    const arc = (Math.PI / 2) * rad;
    let d = t * (2 * sw + 2 * sh + 4 * arc);
    const corner = (cx: number, cy: number, a0: number): [number, number] => {
      const a = a0 - d / rad;
      return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
    };
    if (d < sw) return [-w + rad + d, h];
    d -= sw;
    if (d < arc) return corner(w - rad, h - rad, Math.PI / 2);
    d -= arc;
    if (d < sh) return [w, h - rad - d];
    d -= sh;
    if (d < arc) return corner(w - rad, -h + rad, 0);
    d -= arc;
    if (d < sw) return [w - rad - d, -h];
    d -= sw;
    if (d < arc) return corner(-w + rad, -h + rad, -Math.PI / 2);
    d -= arc;
    if (d < sh) return [-w, -h + rad + d];
    d -= sh;
    return corner(-w + rad, h - rad, Math.PI);
  };
  // The app: a header, a hero card, a list of rows, a tab bar.
  const blocks: [number, number, number, number, number][] = [
    // x0, y0, x1, y1, brightness
    [-0.4, 0.76, 0.1, 0.84, 0.9],
    [0.3, 0.76, 0.4, 0.84, 0.7],
    [-0.4, 0.3, 0.4, 0.66, 0.55],
    [-0.4, 0.12, -0.26, 0.22, 0.8], [-0.2, 0.15, 0.4, 0.19, 0.45],
    [-0.4, -0.08, -0.26, 0.02, 0.8], [-0.2, -0.05, 0.3, -0.01, 0.45],
    [-0.4, -0.28, -0.26, -0.18, 0.8], [-0.2, -0.25, 0.36, -0.21, 0.45],
    [-0.4, -0.48, -0.26, -0.38, 0.8], [-0.2, -0.45, 0.22, -0.41, 0.45],
    [-0.4, -0.84, 0.4, -0.66, 0.3],
  ];
  const areas = blocks.map(([x0, y0, x1, y1]) => (x1 - x0) * (y1 - y0));
  const areaSum = areas.reduce((a, b) => a + b, 0);
  return {
    reachX: 0.6,
    points: build(count, 41, (put, r) => {
      const k = pick(r, [0.34, 0.08, 0.5, 0.08]);
      if (k === 0) {
        const [x, y] = outline(r(), W, H, RAD);
        const z = (r() - 0.5) * 0.08;
        put(x + (r() - 0.5) * 0.015, y + (r() - 0.5) * 0.015, z, 0.85 + 0.15 * r());
      } else if (k === 1) {
        // Inner bezel, the notch and the home indicator.
        const which = r();
        if (which < 0.6) {
          const [x, y] = outline(r(), W - 0.05, H - 0.05, RAD - 0.04);
          put(x, y, 0.02, 0.35);
        } else if (which < 0.8) {
          put((r() - 0.5) * 0.18, 0.905 + (r() - 0.5) * 0.03, 0.03, 0.9);
        } else {
          put((r() - 0.5) * 0.26, -0.93 + (r() - 0.5) * 0.012, 0.03, 0.8);
        }
      } else if (k === 2) {
        let a = r() * areaSum;
        let b = 0;
        while (b < blocks.length - 1 && (a -= areas[b]) > 0) b++;
        const [x0, y0, x1, y1, w] = blocks[b];
        put(x0 + (x1 - x0) * r(), y0 + (y1 - y0) * r(), 0.03, w * (0.8 + 0.2 * r()));
      } else {
        // The back of the phone, faint through the glass.
        const [x, y] = outline(r(), W, H, RAD);
        put(x * r(), y * r(), -0.06, 0.08);
      }
    }),
  };
}

/** Freelance, for clients anywhere: a globe, with the lines between them. */
export function globeForm(count: number): Form {
  const R = 0.82;
  const rand0 = rng(51);
  // A handful of cities, and arcs between some of them.
  const cities = Array.from({ length: 9 }, () => {
    const lat = (rand0() - 0.5) * 2.2;
    const lon = rand0() * TAU;
    return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
  });
  const arcs = [[0, 3], [3, 5], [5, 1], [1, 7], [7, 2], [2, 6], [6, 8], [8, 4], [4, 0], [0, 6]];
  return {
    // The arcs lift off the surface, and the globe sways: leave room.
    reachX: 1.3,
    points: build(count, 52, (put, r) => {
      const k = pick(r, [0.2, 0.22, 0.2, 0.26, 0.12]);
      if (k === 0) {
        // Parallels.
        const lat = (Math.round((r() - 0.5) * 8) / 8) * Math.PI;
        const lon = r() * TAU;
        put(Math.cos(lat) * Math.cos(lon) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R, 0.55);
      } else if (k === 1) {
        // Meridians.
        const lon = (Math.round(r() * 12) / 12) * TAU;
        const lat = (r() - 0.5) * Math.PI;
        put(Math.cos(lat) * Math.cos(lon) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R, 0.55);
      } else if (k === 2) {
        const u = r() * 2 - 1;
        const a = r() * TAU;
        const s = Math.sqrt(1 - u * u);
        put(s * Math.cos(a) * R, u * R, s * Math.sin(a) * R, 0.15 + 0.1 * r());
      } else if (k === 3) {
        // Great-circle arcs, lifted off the surface.
        const [ia, ib] = arcs[Math.floor(r() * arcs.length)];
        const a = cities[ia];
        const b = cities[ib];
        const t = r();
        const x = a[0] + (b[0] - a[0]) * t;
        const y = a[1] + (b[1] - a[1]) * t;
        const z = a[2] + (b[2] - a[2]) * t;
        const len = Math.hypot(x, y, z) || 1;
        const lift = R * (1 + 0.28 * Math.sin(Math.PI * t));
        put((x / len) * lift, (y / len) * lift, (z / len) * lift, 0.95);
      } else {
        // The cities themselves, bright.
        const c = cities[Math.floor(r() * cities.length)];
        const s = 0.035;
        put(c[0] * R + (r() - 0.5) * s, c[1] * R + (r() - 0.5) * s, c[2] * R + (r() - 0.5) * s, 1);
      }
    }),
  };
}

// --- forms sampled from a picture ----------------------------------------------

/**
 * Sample points from something drawn on a canvas: filled pixels are chosen in
 * proportion to `weight(r, g, b, a)`, and each keeps its own brightness.
 */
export function sampleCanvas(
  canvas: HTMLCanvasElement,
  count: number,
  seed: number,
  weight: (r: number, g: number, b: number, a: number) => number,
  opts: { depth?: (lum: number, rand: () => number) => number; bright?: (lum: number) => number } = {},
): Form {
  const w = canvas.width;
  const h = canvas.height;
  const data = canvas.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, w, h).data;
  const cdf = new Float32Array(w * h);
  let sum = 0;
  for (let p = 0; p < w * h; p++) {
    const a = data[p * 4 + 3] / 255;
    sum += a > 0.02 ? Math.max(0, weight(data[p * 4] / 255, data[p * 4 + 1] / 255, data[p * 4 + 2] / 255, a)) : 0;
    cdf[p] = sum;
  }
  const rand = rng(seed);
  const out = new Float32Array(count * 4);
  const scale = 2 / h; // y spans [-1, 1]
  for (let i = 0; i < count; i++) {
    const target = rand() * sum;
    let lo = 0;
    let hi = cdf.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const px = lo % w;
    const py = Math.floor(lo / w);
    const lum = (0.3 * data[lo * 4] + 0.59 * data[lo * 4 + 1] + 0.11 * data[lo * 4 + 2]) / 255;
    out[i * 4] = (px + rand() - w / 2) * scale;
    out[i * 4 + 1] = -(py + rand() - h / 2) * scale;
    out[i * 4 + 2] = opts.depth ? opts.depth(lum, rand) : (rand() - 0.5) * 0.12;
    out[i * 4 + 3] = opts.bright ? opts.bright(lum) : 0.6 + 0.4 * rand();
  }
  return { points: out, reachX: w / h };
}

/** Where it started: `</>`, set in the monospace the rest of the site uses. */
export function codeForm(count: number): Form {
  const c = document.createElement("canvas");
  c.width = 420;
  c.height = 200;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 170px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
  ctx.fillText("</>", c.width / 2, c.height / 2 + 6);
  const f = sampleCanvas(c, count, 61, (r, _g, _b, a) => a * r, {
    depth: (_l, rand) => (rand() - 0.5) * 0.3,
    bright: () => 0.7,
  });
  // The text only fills the middle of its canvas; scale it up so it reads.
  for (let i = 0; i < count; i++) {
    f.points[i * 4] *= 1.25;
    f.points[i * 4 + 1] *= 1.25;
    f.points[i * 4 + 3] = 0.55 + 0.45 * ((i * 0.618034) % 1);
  }
  return { points: f.points, reachX: f.reachX * 1.1 };
}

/**
 * The portrait, from the cut-out photograph. Brighter pixels draw more
 * particles and brighter ones, dark hair still gets a sparse, dim scatter, and
 * light skin sits slightly forward, so a little tilt gives the face relief.
 */
export function portraitForm(img: HTMLImageElement, count: number, height = 360): Form {
  const c = document.createElement("canvas");
  c.height = height;
  c.width = Math.round((img.naturalWidth / img.naturalHeight) * height);
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return sampleCanvas(c, count, 71, (r, g, b, a) => {
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    return a * (0.1 + Math.pow(lum, 1.15));
  }, {
    depth: (lum, rand) => (lum - 0.35) * 0.32 + (rand() - 0.5) * 0.03,
    bright: (lum) => Math.min(1, 0.1 + Math.pow(lum, 0.9) * 1.15),
  });
}

/** Load an image, resolving once it has decoded. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
