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
  /**
   * 0..1 as the bullet-time section rises into the viewport, reaching 1 exactly
   * when the pin begins.
   *
   * Separate from `bulletTime` because that value is still 0 for the whole
   * approach, which left the shot invisible while the section was already on
   * screen — a stretch of black where nothing explained itself.
   */
  bulletEntry: number;
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
  bulletEntry: 0,
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

/**
 * Section geometry, measured once and cached.
 *
 * Reading getBoundingClientRect on every scroll event forces the browser to
 * recompute layout each time, and a phone's native scroll fires dozens of
 * events a second. That was a real source of scroll jank on mobile. The
 * sections' document offsets only change when layout changes, so they are
 * measured on resize (and whenever the page's size changes, via a
 * ResizeObserver) and every scroll event after that is plain arithmetic.
 */
type Geometry = {
  heroTop: number;
  heroHeight: number;
  btTop: number;
  btHeight: number;
  docHeight: number;
};

let geometry: Geometry | null = null;
let measuredWidth = 0;

/**
 * True when a window resize is nothing but the mobile browser's own chrome.
 *
 * Scrolling back up on a phone slides the URL bar back in, which fires resize
 * on almost every frame of that animation. Re-measuring there was pure jank:
 * the sections are laid out in `svh`, which by definition does not move when
 * the bar does, so the geometry is identical each time. Only a width change or
 * a big height change (an orientation flip) is a real layout change.
 */
export function isBrowserChromeResize(): boolean {
  if (typeof window === "undefined") return false;
  if (window.innerWidth !== measuredWidth) return false;
  const delta = Math.abs(window.innerHeight - scroll.vh);
  return delta < scroll.vh * 0.3;
}

export function remeasure() {
  if (typeof document === "undefined") return;
  const y = window.scrollY;
  const hero = document.getElementById(SECTION.hero);
  const bt = document.getElementById(SECTION.bulletTime);
  const h = hero?.getBoundingClientRect();
  const b = bt?.getBoundingClientRect();
  geometry = {
    heroTop: h ? h.top + y : 0,
    heroHeight: h ? h.height : 1,
    btTop: b ? b.top + y : 0,
    btHeight: b ? b.height : 1,
    docHeight: document.documentElement.scrollHeight,
  };
  /*
   * The height used by every curve stays put while the URL bar comes and goes.
   * Letting it follow innerHeight made the pin progress — and with it the
   * video's currentTime — drift by a few percent during that animation, which
   * read as the shot twitching whenever you scrolled up.
   */
  if (window.innerWidth !== measuredWidth || !scroll.vh || scroll.vh === 1) {
    measuredWidth = window.innerWidth;
    scroll.vh = window.innerHeight;
  }
}

/** Recompute every derived value from the current scroll offset. No layout reads. */
export function measure() {
  if (typeof document === "undefined") return;
  if (!geometry) remeasure();
  const g = geometry!;
  const vh = scroll.vh || window.innerHeight;
  const y = scroll.y;

  const max = g.docHeight - vh;
  scroll.progress = max > 0 ? clamp01(y / max) : 0;

  scroll.heroOut = clamp01((y - g.heroTop) / Math.max(g.heroHeight, 1));

  const scrollable = g.btHeight - vh;
  scroll.bulletTime = scrollable > 0 ? clamp01((y - g.btTop) / scrollable) : 0;
  // 0 when the section's top is a full viewport below, 1 when it reaches the
  // top of the screen and the pin takes over.
  scroll.bulletEntry = clamp01(1 - (g.btTop - y) / Math.max(vh, 1));
}
