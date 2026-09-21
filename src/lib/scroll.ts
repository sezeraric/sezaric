/**
 * Module-level scroll state.
 *
 * The 3D scene reads this every frame inside useFrame. Keeping it outside React
 * means scrolling never triggers a re-render — the canvas just samples the
 * latest numbers. Anything that needs to re-render should use a hook instead.
 */
export type ScrollState = {
  /** Raw scroll offset in px (smoothed by Lenis). */
  y: number;
  /** Progress through the whole document, 0..1. */
  progress: number;
  /** Scroll velocity, roughly px per frame. Signed. */
  velocity: number;
  /** 0..1 through the pinned bullet-time section. 0 before it, 1 after it. */
  bulletTime: number;
  /** 0..1 as the hero scrolls out of view. */
  heroOut: number;
  /** Viewport height, cached. */
  vh: number;
};

export const scroll: ScrollState = {
  y: 0,
  progress: 0,
  velocity: 0,
  bulletTime: 0,
  heroOut: 0,
  vh: 1,
};

/** Section ids whose progress we track for the 3D scene. */
export const SECTION = {
  hero: "hero",
  bulletTime: "bullet-time",
} as const;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Progress of an element through the viewport as a "pinned scroll" range:
 * 0 when its top hits the top of the viewport, 1 when its bottom reaches the
 * bottom. For a tall section wrapping a sticky child, this is exactly the
 * fraction of the pin that has been consumed.
 */
export function pinnedProgress(el: HTMLElement, vh: number): number {
  const rect = el.getBoundingClientRect();
  const scrollable = rect.height - vh;
  if (scrollable <= 0) return clamp01(-rect.top / Math.max(rect.height, 1));
  return clamp01(-rect.top / scrollable);
}

/** Recompute every derived value. Called from the Lenis scroll callback. */
export function measure() {
  if (typeof document === "undefined") return;
  const vh = window.innerHeight;
  scroll.vh = vh;

  const doc = document.documentElement;
  const max = doc.scrollHeight - vh;
  scroll.progress = max > 0 ? clamp01(scroll.y / max) : 0;

  const hero = document.getElementById(SECTION.hero);
  if (hero) {
    const rect = hero.getBoundingClientRect();
    scroll.heroOut = clamp01(-rect.top / Math.max(rect.height, 1));
  }

  const bt = document.getElementById(SECTION.bulletTime);
  if (bt) scroll.bulletTime = pinnedProgress(bt, vh);
}
