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
  /** 0..1 — video and scene fade at the very edges of the section. */
  presence: number;
};

export function phase(p: number): Phase {
  const freeze = smoothstep(p, 0.24, 0.36) * (1 - smoothstep(p, 0.68, 0.82));
  return {
    freeze,
    // 0.12 rather than 0, so the rain still drifts while the shot holds.
    timeScale: 1 - 0.88 * freeze,
    log: smoothstep(p, 0.28, 0.4) * (1 - smoothstep(p, 0.74, 0.86)),
    presence: smoothstep(p, 0, 0.04) * (1 - smoothstep(p, 0.96, 1)),
  };
}

/**
 * Rain brightness by page position.
 *
 * It drops hard over the video — the clip carries its own green streaks, and
 * two competing green fields just read as noise — and drops further once the
 * page turns into body copy that has to be readable.
 */
export function rainIntensity(bulletTime: number): number {
  if (bulletTime >= 0.999) return 0.16; // past the scene
  if (bulletTime > 0.001) return 0.3;   // over the video
  return 0.95;                          // hero
}
