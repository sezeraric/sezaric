"use client";

import { useEffect, useRef } from "react";
import { GlyphSwarm } from "@/lib/glyphSwarm";

/**
 * "There is no spoon."
 *
 * A spoon held together out of falling code. It bends on its own as it comes
 * into view — the way it does in the film, nobody touching it — because its
 * glyphs' homes are laid along a real curve whose control point swings: the
 * handle curls and the bowl follows the curve's direction at the neck.
 *
 * Reach for it and there is no spoon: it lets go and falls away as rain, then
 * is caught back together a moment later.
 */

const COUNT = 760;
const VIEW_W = 140; // the drawing's box, in the same units as the old SVG
const VIEW_H = 220;

type Part = { bowl: boolean; u: number; v: number; bright: number };

export function CodeSpoon({ className = "" }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const s = new GlyphSwarm(cv, COUNT, 5.6);
    s.repel = 0;

    // Each glyph's place on the spoon, fixed; only the bend moves it.
    const parts: Part[] = Array.from({ length: COUNT }, () => {
      const bowl = Math.random() < 0.46;
      const u = Math.random();
      const v = Math.random();
      const rim = bowl ? Math.sqrt(v) > 0.84 : Math.abs(v - 0.5) > 0.36;
      return { bowl, u, v, bright: rim ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.35 };
    });

    const place = (b: number) => {
      const p0 = { x: 60, y: 204 };
      const p2 = { x: 60 + 34 * b, y: 92 - 8 * b };
      const c = { x: 60 - 26 * b, y: 150 };
      const dx = p2.x - c.x;
      const dy = p2.y - c.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const bx = p2.x + ux * 33;
      const by = p2.y + uy * 33;
      const ang = Math.atan2(uy, ux) + Math.PI / 2;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      for (let i = 0; i < COUNT; i++) {
        const q = parts[i];
        let x: number;
        let y: number;
        if (q.bowl) {
          const a = q.u * Math.PI * 2;
          const rr = Math.sqrt(q.v);
          const lx = Math.cos(a) * 20 * rr;
          const ly = Math.sin(a) * 31 * rr;
          x = bx + lx * ca - ly * sa;
          y = by + lx * sa + ly * ca;
        } else {
          const t = q.u;
          const mt = 1 - t;
          x = mt * mt * p0.x + 2 * mt * t * c.x + t * t * p2.x;
          y = mt * mt * p0.y + 2 * mt * t * c.y + t * t * p2.y;
          const tx = 2 * mt * (c.x - p0.x) + 2 * t * (p2.x - c.x);
          const ty = 2 * mt * (c.y - p0.y) + 2 * t * (p2.y - c.y);
          const tl = Math.hypot(tx, ty) || 1;
          const width = 17 - 8 * t; // tapers to the neck
          const off = (q.v - 0.5) * width;
          x += (-ty / tl) * off;
          y += (tx / tl) * off;
        }
        s.homes[i * 3] = x / VIEW_W;
        s.homes[i * 3 + 1] = y / VIEW_H;
        s.homes[i * 3 + 2] = q.bright;
      }
    };

    const layout = () => {
      const r = cv.getBoundingClientRect();
      s.resize(r.width, r.height);
      const aspect = VIEW_W / VIEW_H;
      const w = Math.min(r.width, r.height * aspect);
      const h = w / aspect;
      s.box = { x: (r.width - w) / 2, y: r.height - h, w, h };
    };
    layout();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      place(0.55);
      s.settle();
      s.draw();
      return;
    }

    let bend = 0;
    let raf = 0;
    let running = false;
    let started = false;
    let last = 0;
    let gone: number | null = null;
    let wantGone = false;

    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      const now = ms / 1000;
      const dt = Math.min(0.04, Math.max(0, now - last));
      last = now;
      const r = cv.getBoundingClientRect();
      const vh = window.innerHeight;
      const seen = Math.min(Math.max((vh - r.top) / (vh * 0.7), 0), 1);
      bend += (seen * 0.62 - bend) * (1 - Math.exp(-dt * 2.2));
      place(bend);

      if (!started) {
        started = true;
        s.rainIn(now, 1.6);
      }
      if (wantGone && gone === null) {
        gone = now;
        s.release();
      }
      // There is no spoon — for a moment. Then it is caught again.
      if (gone !== null && !wantGone && (s.empty || now - gone > 1.6)) {
        gone = null;
        s.rainIn(now, 1.2);
      }
      s.step(dt, now);
      s.draw();
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now() / 1000;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "20% 0px" });
    io.observe(cv);

    const enter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") wantGone = true;
    };
    const leave = () => {
      wantGone = false;
    };
    // On touch there is no hover: a tap lets it go, and it comes back on its own.
    const tap = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      wantGone = true;
      window.setTimeout(() => (wantGone = false), 250);
    };
    cv.addEventListener("pointerenter", enter);
    cv.addEventListener("pointerleave", leave);
    cv.addEventListener("pointerdown", tap);
    window.addEventListener("resize", layout);

    return () => {
      stop();
      io.disconnect();
      cv.removeEventListener("pointerenter", enter);
      cv.removeEventListener("pointerleave", leave);
      cv.removeEventListener("pointerdown", tap);
      window.removeEventListener("resize", layout);
    };
  }, []);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
