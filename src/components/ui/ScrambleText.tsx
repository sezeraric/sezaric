"use client";

import { useEffect, useRef } from "react";

const POOL = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ01<>/\\*+=:";

type Tag = "span" | "h1" | "h2" | "h3" | "p";

/**
 * Resolves text out of scrambled glyphs when it scrolls into view.
 *
 * The real text is rendered up front and restored at the end, so screen
 * readers, search engines and text selection always see the actual copy — only
 * the visible characters are swapped during the animation.
 */
export function ScrambleText({
  text,
  className,
  speed = 26,
  as = "span",
  active = true,
  replayOnHover = false,
}: {
  text: string;
  className?: string;
  /** ms between frames */
  speed?: number;
  as?: Tag;
  /** Hold off until this is true (e.g. until the element is actually shown). */
  active?: boolean;
  /** Scramble again whenever a pointer comes over it. */
  replayOnHover?: boolean;
}) {
  // Typed to match the cast tag below; every tag this renders is an
  // HTMLElement and only generic members are used.
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    let frame = 0;
    const chars = [...text];
    // Each character locks in at its own moment, left to right with jitter.
    let locks = chars.map((_, i) => i * 1.5 + Math.random() * 10);
    let total = Math.max(...locks) + 8;

    const run = () => {
      if (timer) return;
      frame = 0;
      timer = setInterval(() => {
        frame += 1;
        el.textContent = chars
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (frame >= locks[i]) return ch;
            return POOL[Math.floor(Math.random() * POOL.length)];
          })
          .join("");
        if (frame >= total) {
          el.textContent = text;
          if (timer) clearInterval(timer);
          timer = null;
        }
      }, speed);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    // A replay is quicker than the first reveal: a flicker, not a re-read.
    const replay = () => {
      locks = chars.map((_, i) => i * 0.8 + Math.random() * 6);
      total = Math.max(...locks) + 4;
      run();
    };
    if (replayOnHover) el.addEventListener("pointerenter", replay);

    return () => {
      io.disconnect();
      el.removeEventListener("pointerenter", replay);
      if (timer) clearInterval(timer);
    };
  }, [text, speed, active, replayOnHover]);

  // Every tag this accepts takes the same attributes; casting to one of
  // them keeps the props typed instead of collapsing the union to never.
  const Tag = as as "div";
  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}
