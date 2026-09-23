/**
 * Scroll choreography maths for the bullet-time section.
 *
 * Deliberately free of three.js and of any DOM access so the timing can be
 * reasoned about and checked on its own (`npm run check:curves`). The video,
 * the rain and the copy all read from these same curves, which is what keeps
 * them in step.
 */

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Hermite smoothstep. Matches GLSL's, including the edge0 < edge1 requirement. */
export function smoothstep(x: number, edge0: number, edge1: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export type Phase = {
  /** 0..1 — how far into the time-dilated middle of the shot we are. */
  freeze: number;
  /** Rain speed multiplier. Never reaches zero: a dead field looks broken. */
  timeScale: number;
  /** 0..1 — when the engineering-problem log is on screen. */
  log: number;
  /** 0..1 — how far the section has risen into view before the pin starts. */
  entered: number;
};

export function phase(p: number): Phase {
  const freeze = smoothstep(p, 0.24, 0.36) * (1 - smoothstep(p, 0.68, 0.82));
  return {
    freeze,
    // 0.12 rather than 0, so the rain still drifts while the shot holds.
    timeScale: 1 - 0.88 * freeze,
    log: smoothstep(p, 0.28, 0.4) * (1 - smoothstep(p, 0.74, 0.86)),
    entered: 0,
  };
}

/**
 * How visible the bullet-time shot is.
 *
 * Driven by the section's approach rather than by its pinned progress: the
 * shot has to already be on screen when the section arrives, or the visitor
 * scrolls past the hero into a stretch of black with nothing to read.
 * It only fades back out at the very end of the pin.
 */
export function backdropPresence(entry: number, p: number): number {
  const arriving = smoothstep(entry, 0.12, 0.5);
  const leaving = 1 - smoothstep(p, 0.96, 1);
  return Math.min(arriving, leaving);
}

/**
 * Rain brightness by page position.
 *
 * It drops hard over the video — the clip carries its own green streaks, and
 * two competing green fields just read as noise — and drops further once the
 * page turns into body copy that has to be readable.
 */
export function rainIntensity(entry: number, bulletTime: number): number {
  if (bulletTime >= 0.999) return 0.16; // past the scene: a quiet backdrop
  // Fade the rain down as the shot arrives, not the moment the pin starts —
  // otherwise it stays at full strength over the clip during the approach.
  const over = backdropPresence(entry, bulletTime);
  return 0.95 - 0.65 * over;
}


/**
 * The case-study showcase choreography.
 *
 * Four beats across the pinned section:
 *
 *   1. phone left, figure right
 *   2. they cross over — phone right, figure left
 *   3. held, while the last screen is read
 *   4. the phone leaves and the figure walks to the centre and grows
 *
 * `spread` scales the horizontal offsets: a narrow canvas has no room to put
 * two objects side by side, so it gets a much smaller swing and leans on depth
 * instead. The finale is the same at every width.
 */
export type Showcase = {
  phoneX: number;
  phoneZ: number;
  phoneYaw: number;
  phoneOpacity: number;
  figureX: number;
  figureY: number;
  figureZ: number;
  figureScale: number;
  figureOpacity: number;
  /** 0..1 across the screenshot sequence; finishes before the finale starts. */
  screen: number;
  /**
   * 0..1 — the photograph of the face over the scan's head.
   *
   * Held at zero until the figure is already coming forward, so the reveal
   * lands as the last thing the section does rather than as a face that was
   * quietly there the whole time.
   */
  face: number;
};

const FINALE_START = 0.84;

export function showcase(p: number, spread: number): Showcase {
  const t = clamp01(p);

  // Beat 1 -> 2: a single crossing, eased so they pass each other rather than
  // teleport. 0 = phone left, 1 = phone right.
  const cross = smoothstep(t, 0.3, 0.62);
  const side = -1 + 2 * cross;

  // Beat 4: the phone leaves, the figure takes the middle and comes forward.
  const finale = smoothstep(t, FINALE_START, 1);

  return {
    phoneX: side * 0.78 * spread * (1 - finale) + finale * 1.9 * spread,
    phoneZ: -finale * 1.2,
    phoneYaw: 0.3 - 0.52 * cross,
    phoneOpacity: 1 - smoothstep(t, FINALE_START, 0.95),
    figureX: -side * 1.18 * spread * (1 - finale),
    // Drops as it grows: at full size it no longer fits the frame, and losing
    // the legs reads as a portrait while losing the head reads as a bug.
    figureY: -finale * 0.85,
    figureZ: -0.9 * (1 - finale) + finale * 0.5,
    figureScale: 1.55 + finale * 0.8,
    figureOpacity: smoothstep(t, 0, 0.1),
    // The screens finish before the finale so the last one is actually read.
    screen: clamp01(t / FINALE_START),
    face: smoothstep(t, 0.9, 0.99),
  };
}
