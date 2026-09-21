"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Tag = "div" | "section" | "li" | "article" | "p" | "h2";

/**
 * Entrance animation on first intersection.
 *
 * The hidden state is applied by CSS scoped to `html.js`, a class an inline
 * script in the head sets only when IntersectionObserver actually exists. So the content is
 * visible in the server-rendered HTML and stays visible if scripting is off,
 * blocked, or simply slow — the animation is an enhancement, never a gate on
 * whether the page has content.
 *
 * Reduced motion is handled in globals.css, which collapses the transition.
 */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: Tag;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    io.observe(el);

    // Backstop: if nothing has intersected by now the page is probably not
    // being scrolled through normally. Show the content anyway.
    const backstop = window.setTimeout(() => setShown(true), 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(backstop);
    };
  }, []);

  // Every tag this accepts takes the same attributes; casting to one of them
  // keeps the props typed instead of collapsing the union to never.
  const Tag = as as "div";

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={shown ? "shown" : "pending"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
