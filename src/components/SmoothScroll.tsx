"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { isBrowserChromeResize, measure, remeasure, scroll } from "@/lib/scroll";
import { setLenis } from "@/lib/smoothScroll";

/**
 * Smooth scrolling for mouse wheels, native scrolling for everything else.
 *
 * Lenis exists to smooth the coarse, stepped input of a mouse wheel. On a
 * touch screen it has nothing to fix — iOS and Android momentum scrolling is
 * already better than anything done in JavaScript — and intercepting it made
 * scrolling on phones feel wrong. It also carried a touch multiplier that
 * amplified every swipe. So Lenis only runs for a fine pointer; phones, tablets
 * and reduced motion get the platform's own scrolling.
 *
 * Either way the scene's numbers come from the same measure(), and nothing
 * here sets React state: scrolling costs zero re-renders.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;

    if (process.env.NODE_ENV === "development") {
      // Handle for reading the live scroll numbers while debugging.
      (window as unknown as { __scroll?: typeof scroll }).__scroll = scroll;
    }

    /*
     * Section offsets change when layout does — images and fonts arriving, the
     * viewport rotating. Re-measure then, not on every scroll event, and never
     * more than once a frame: a ResizeObserver can fire several times in one
     * frame, and each call reads layout back.
     */
    let pending = 0;
    const onLayout = () => {
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        remeasure();
        measure();
      });
    };
    /*
     * The body's own box is the honest signal for "the page got taller". The
     * window resize event is not: on a phone it fires throughout the URL bar's
     * show/hide animation, which is exactly when scrolling up needs the main
     * thread most, and nothing has actually moved.
     */
    const onWindowResize = () => {
      if (isBrowserChromeResize()) return;
      onLayout();
    };
    const ro = new ResizeObserver(onLayout);
    ro.observe(document.body);
    window.addEventListener("resize", onWindowResize);
    onLayout();

    if (reduced || touch) {
      // Without Lenis, in-page links would jump instantly. The browser's own
      // smooth scrolling is right here — but never under reduced motion.
      const html = document.documentElement;
      const previous = html.style.scrollBehavior;
      if (!reduced) html.style.scrollBehavior = "smooth";

      const onScroll = () => {
        scroll.y = window.scrollY;
        scroll.velocity = 0;
        measure();
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        html.style.scrollBehavior = previous;
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onWindowResize);
        cancelAnimationFrame(pending);
        ro.disconnect();
      };
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    if (process.env.NODE_ENV === "development") {
      // Handle for driving the page to an exact scroll offset while debugging.
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    setLenis(lenis);

    lenis.on("scroll", (e: { scroll: number; velocity: number }) => {
      scroll.y = e.scroll;
      scroll.velocity = e.velocity;
      measure();
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // In-page anchors have to go through Lenis or they fight it.
    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as HTMLElement | null)?.closest?.("a[href^='#']");
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      ev.preventDefault();
      lenis.scrollTo(el, { duration: 1.2 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onWindowResize);
      cancelAnimationFrame(pending);
      document.removeEventListener("click", onClick);
      ro.disconnect();
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
