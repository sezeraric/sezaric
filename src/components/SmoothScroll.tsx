"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { measure, scroll } from "@/lib/scroll";

/**
 * Lenis smooth scrolling, wired into the module-level scroll state.
 *
 * Nothing here sets React state: the 3D scene samples `scroll` inside useFrame,
 * so scrolling costs one measure() per event and zero re-renders.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Respecting reduced motion means native scrolling, but the scene still
    // needs its numbers — so fall back to a plain scroll listener.
    if (reduced) {
      const onScroll = () => {
        scroll.y = window.scrollY;
        scroll.velocity = 0;
        measure();
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });

    lenis.on("scroll", (e: { scroll: number; velocity: number }) => {
      scroll.y = e.scroll;
      scroll.velocity = e.velocity;
      measure();
    });

    if (process.env.NODE_ENV === "development") {
      // Handle for driving the page to an exact scroll offset while debugging.
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    measure();

    // In-page anchors have to go through Lenis or they fight it.
    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as HTMLElement | null)?.closest?.("a[href^='#']");
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      ev.preventDefault();
      lenis.scrollTo(el, { offset: 0, duration: 1.2 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
