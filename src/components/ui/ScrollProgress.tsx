"use client";

import { useEffect, useRef } from "react";
import { scroll } from "@/lib/scroll";

/**
 * Reading progress: a green hairline along the top of the screen.
 *
 * Driven from the shared scroll state rather than a CSS scroll timeline,
 * because iOS Safari — where most visitors are — does not support those yet.
 * One transform write per frame, and only when the value moved.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = -1;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = Math.round(scroll.progress * 1000) / 1000;
      if (p === last || !bar.current) return;
      last = p;
      bar.current.style.transform = `scaleX(${p})`;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <div ref={bar} className="scroll-progress" aria-hidden="true" />;
}
