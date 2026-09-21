"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * The spoon that isn't there.
 *
 * The section says "there is no spoon"; this is the spoon, and it bends. It
 * bends on its own as the section comes into view — the way it does in the
 * film, without anyone touching it — and further when you look at it with a
 * pointer.
 *
 * The bend is real geometry rather than a hinge: the handle's centre line is a
 * quadratic curve whose control point swings sideways, and the bowl follows
 * the curve's tangent at the neck, so the metal curls instead of folding at a
 * joint. Every frame writes attributes straight onto the SVG — nothing
 * re-renders — and the loop stops entirely while the section is off screen.
 */
export function BendingSpoon({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<SVGPathElement>(null);
  const sheen = useRef<SVGPathElement>(null);
  const bowl = useRef<SVGEllipseElement>(null);
  const bowlSheen = useRef<SVGEllipseElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    let bend = reduced ? 0.55 : 0;
    let target = reduced ? 0.55 : 0;
    let hover = 0;
    let raf = 0;
    let running = false;

    const draw = (b: number) => {
      // Handle end fixed at the bottom; the neck swings right as it bends,
      // and the control point pulls the shaft into a curve the other way.
      const p0 = { x: 60, y: 204 };
      const p2 = { x: 60 + 34 * b, y: 92 - 8 * b };
      const c = { x: 60 - 26 * b, y: 150 };
      const d = `M ${p0.x} ${p0.y} Q ${c.x} ${c.y} ${p2.x} ${p2.y}`;
      handle.current?.setAttribute("d", d);
      sheen.current?.setAttribute("d", d);

      // The bowl continues along the curve's direction at the neck.
      const dx = p2.x - c.x;
      const dy = p2.y - c.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const bx = p2.x + ux * 29;
      const by = p2.y + uy * 29;
      const angle = (Math.atan2(uy, ux) * 180) / Math.PI + 90;

      const set = (e: SVGEllipseElement | null, ox: number, oy: number) => {
        if (!e) return;
        e.setAttribute("cx", String(bx + ox));
        e.setAttribute("cy", String(by + oy));
        e.setAttribute("transform", `rotate(${angle} ${bx + ox} ${by + oy})`);
      };
      set(bowl.current, 0, 0);
      set(bowlSheen.current, -4, -5);
    };

    draw(bend);
    if (reduced) return;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      // Arriving in view sets the resting bend; a pointer pushes it further.
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const seen = Math.min(Math.max((vh - rect.top) / (vh * 0.7), 0), 1);
      target = Math.max(seen * 0.62, hover);
      bend += (target - bend) * 0.06;
      draw(bend);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      rootMargin: "20% 0px",
    });
    io.observe(el);

    const enter = () => { hover = 1; };
    const leave = () => { hover = 0; };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);

    return () => {
      stop();
      io.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [reduced]);

  return (
    <div ref={root} className={className} aria-hidden="true">
      <svg viewBox="0 0 120 220" className="h-full w-full overflow-visible">
        <defs>
          {/* userSpaceOnUse keeps the light still while the metal bends. */}
          <linearGradient id="spoon-steel" x1="20" y1="40" x2="110" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#eef4f0" />
            <stop offset="0.45" stopColor="#8f9c95" />
            <stop offset="0.7" stopColor="#d6dfda" />
            <stop offset="1" stopColor="#5d6a63" />
          </linearGradient>
          <filter id="spoon-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00ff41" floodOpacity="0.25" />
          </filter>
        </defs>
        <g filter="url(#spoon-glow)">
          <path ref={handle} fill="none" stroke="url(#spoon-steel)" strokeWidth="11" strokeLinecap="round" />
          <path ref={sheen} fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2.2" strokeLinecap="round" transform="translate(-2.2 0)" />
          <ellipse ref={bowl} rx="17" ry="27" fill="url(#spoon-steel)" />
          <ellipse ref={bowlSheen} rx="6" ry="12" fill="#ffffff" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
}
