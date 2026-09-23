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
 * The experience stage.
 *
 * The section pins, and its scroll budget is split into one segment per role
 * followed by the reveal. In each role's segment its card comes in, fires its
 * threads at the figure (see FIRE_AT), and is read; the weave clip builds the
 * figure feet first across all the roles, then the reveal turns the finished
 * wireframe into the photograph and holds it.
 *
 * WIREFRAME_DONE is where, in public/weave.mp4, the wireframe is complete and
 * the photograph starts to come through.
 */
export const WIREFRAME_DONE = 0.76;

/**
 * Where in the clip the stage starts: the point where the feet begin to form.
 * The clip opens on a black frame with a few stray streaks, which frozen under
 * a scroll read as scratches on the screen; the cards' own threads do that job
 * here instead.
 */
export const CLIP_START = 0.22;

/** Pinned screens given to the reveal after the last role. */
export const REVEAL_SEGMENTS = 1.8;

/** Where in its own segment a card throws its threads: once it has arrived. */
export const FIRE_AT = 0.16;

export type Stage = {
  /** 0..roles: which role, and how far through it. */
  roleT: number;
  /** 0..1 — the deck stepping aside and the heading coming in. */
  reveal: number;
  /** 0..1 — where the weave clip is. */
  clip: number;
  /**
   * 0..1 — the figure's own opacity. Nothing of it shows until the first
   * card's threads have landed; it appears where they land.
   */
  figure: number;
};

export function stageAt(p: number, roles: number): Stage {
  const n = Math.max(1, roles);
  const t = clamp01(p) * (n + REVEAL_SEGMENTS);
  const roleT = Math.min(t, n);
  const r = clamp01((t - n) / REVEAL_SEGMENTS);
  return {
    roleT,
    reveal: smoothstep(r, 0, 0.3),
    clip:
      CLIP_START +
      (WIREFRAME_DONE - CLIP_START) * (roleT / n) +
      (1 - WIREFRAME_DONE) * smoothstep(r, 0.15, 0.75),
    figure: smoothstep(roleT, 0.3, 0.7),
  };
}

/**
 * One card's entrance and exit within the deck, each 0..1. A card comes up
 * from below at the start of its segment and leaves upward at the end of it;
 * the last card stays until the reveal clears the whole deck.
 */
export function cardMotion(roleT: number, i: number, roles: number): { enter: number; exit: number } {
  const local = roleT - i;
  return {
    enter: smoothstep(local, 0, FIRE_AT),
    exit: i >= roles - 1 ? 0 : smoothstep(local, 0.9, 1),
  };
}
