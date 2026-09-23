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
 * How present the woven figure is on the page, 0..1.
 *
 * `entry` rises as the experience section approaches; `exit` rises once the
 * reveal has finished and the page moves on. The figure is only ever there
 * for these two sections.
 */
export function figurePresence(entry: number, exit: number): number {
  return smoothstep(entry, 0, 0.35) * (1 - smoothstep(exit, 0.15, 0.85));
}

/**
 * Where the weave clip is, 0..1, from the two sections that drive it.
 *
 * The clip (public/weave.mp4) has two acts: green threads stream in and build
 * a wireframe of the figure feet first, and then the wireframe turns into the
 * photograph. WIREFRAME_DONE is where the first act ends in the clip.
 *
 * The experience section plays the first act — the figure is built while the
 * career is read — and the reveal section plays the second, finishing early
 * enough that the finished picture holds for the rest of the pin.
 */
export const WIREFRAME_DONE = 0.76;

export function weaveProgress(experience: number, reveal: number): number {
  return WIREFRAME_DONE * clamp01(experience) + (1 - WIREFRAME_DONE) * smoothstep(reveal, 0.1, 0.75);
}

/** 0..1 — the figure walking from its spot beside the copy to the centre, at the start of the reveal. */
export function revealMove(reveal: number): number {
  return smoothstep(reveal, 0, 0.3);
}
