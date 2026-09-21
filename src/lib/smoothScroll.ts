import type Lenis from "lenis";

/**
 * The page's Lenis instance, shared.
 *
 * Anything that scrolls the page programmatically has to go through Lenis.
 * Calling the native `scrollIntoView({ behavior: "smooth" })` while Lenis is
 * running makes the two fight over the scroll position — in practice the page
 * jumped the wrong way, up past the target instead of down to it.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function scrollToElement(el: HTMLElement, reduced: boolean) {
  if (instance && !reduced) {
    // No explicit offset: Lenis already honours the target's CSS
    // scroll-margin-top, which is where the header clearance belongs. Passing
    // an offset as well added the two together and landed 96px too low.
    instance.scrollTo(el, { duration: 1.3 });
    return;
  }
  // No Lenis — touch devices and reduced motion scroll natively — so native is
  // correct here. Smooth on touch, instant under reduced motion.
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
