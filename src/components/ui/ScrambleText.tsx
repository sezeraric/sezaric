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
}: {
  text: string;
  className?: string;
  /** ms between frames */
  speed?: number;
  as?: Tag;
}) {
  // Typed to match the cast tag below; every tag this renders is an
  // HTMLElement and only generic members are used.
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | null = null;
    let frame = 0;
    const chars = [...text];
    // Each character locks in at its own moment, left to right with jitter.
    const locks = chars.map((_, i) => i * 1.5 + Math.random() * 10);
    const total = Math.max(...locks) + 8;

    const run = () => {
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

    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [text, speed]);

  // Every tag this accepts takes the same attributes; casting to one of
  // them keeps the props typed instead of collapsing the union to never.
  const Tag = as as "div";
  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}
