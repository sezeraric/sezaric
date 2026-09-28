"use client";

import { useEffect, useRef } from "react";
import { GLYPH_CELL, GLYPH_COUNT, glyphSheet } from "@/lib/glyphSwarm";

/**
 * The pointer sheds code.
 *
 * On a device with a mouse, moving it leaves a thin trail of glyphs that fall
 * away like the rain and burn out; a click throws a small ring of them. The
 * trail is sparse on purpose — one glyph for every stretch of travel, never
 * one per event — so it reads as a trace, not a smear over the copy.
 *
 * Purely decorative: aria-hidden, no pointer events, off for touch and for
 * reduced motion, and the frame loop stops whenever nothing is alive.
 */

const MAX = 240;
const STEP = 16; // px of travel per glyph

export function CodeCursor() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const sheet = glyphSheet();

    const x = new Float32Array(MAX);
    const y = new Float32Array(MAX);
    const vx = new Float32Array(MAX);
    const vy = new Float32Array(MAX);
    const age = new Float32Array(MAX);
    const life = new Float32Array(MAX);
    const size = new Float32Array(MAX);
    const glyph = new Uint8Array(MAX);
    let head = 0;
    let alive = 0;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(window.innerWidth * dpr);
      cv.height = Math.round(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (px: number, py: number, svx: number, svy: number, l: number, s: number) => {
      const i = head;
      head = (head + 1) % MAX;
      if (age[i] >= life[i]) alive++;
      x[i] = px;
      y[i] = py;
      vx[i] = svx;
      vy[i] = svy;
      age[i] = 0;
      life[i] = l;
      size[i] = s;
      glyph[i] = Math.floor(Math.random() * GLYPH_COUNT);
    };
    for (let i = 0; i < MAX; i++) life[i] = -1;

    let raf = 0;
    let running = false;
    let last = 0;
    const loop = (ms: number) => {
      const now = ms / 1000;
      const dt = Math.min(0.04, Math.max(0, now - last));
      last = now;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "lighter";
      alive = 0;
      for (let i = 0; i < MAX; i++) {
        if (age[i] >= life[i]) continue;
        age[i] += dt;
        if (age[i] >= life[i]) continue;
        alive++;
        // Falls like the rain, a little faster the longer it lives.
        vy[i] += 240 * dt;
        vx[i] *= 1 - Math.min(1, dt * 3);
        x[i] += vx[i] * dt;
        y[i] += vy[i] * dt;
        if (Math.random() < dt * 6) glyph[i] = Math.floor(Math.random() * GLYPH_COUNT);
        const t = age[i] / life[i];
        const tint = t < 0.12 ? 0 : t < 0.5 ? 1 : 2;
        ctx.globalAlpha = (1 - t) * (1 - t) * 0.85;
        const s = size[i];
        ctx.drawImage(sheet, glyph[i] * GLYPH_CELL, tint * GLYPH_CELL, GLYPH_CELL, GLYPH_CELL, x[i] - s / 2, y[i] - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (alive > 0) raf = requestAnimationFrame(loop);
      else {
        running = false;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, cv.width, cv.height);
      }
    };
    const wake = () => {
      if (running) return;
      running = true;
      last = performance.now() / 1000;
      raf = requestAnimationFrame(loop);
    };

    let lx = -1;
    let ly = -1;
    let travel = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (lx < 0) {
        lx = e.clientX;
        ly = e.clientY;
        return;
      }
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      travel += Math.hypot(dx, dy);
      lx = e.clientX;
      ly = e.clientY;
      if (travel < STEP) return;
      const n = Math.min(3, Math.floor(travel / STEP));
      travel -= n * STEP;
      for (let k = 0; k < n; k++) {
        spawn(
          e.clientX - (dx * k) / n + (Math.random() - 0.5) * 8,
          e.clientY - (dy * k) / n + (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 30,
          20 + Math.random() * 40,
          0.7 + Math.random() * 0.6,
          10 + Math.random() * 4,
        );
      }
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const n = 18;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + Math.random() * 0.3;
        const sp = 140 + Math.random() * 160;
        spawn(e.clientX, e.clientY, Math.cos(a) * sp, Math.sin(a) * sp - 60, 0.8 + Math.random() * 0.5, 11 + Math.random() * 5);
      }
      wake();
    };
    const onOut = () => {
      lx = -1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onOut);
    };
  }, []);

  return <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[55] h-full w-full" aria-hidden="true" />;
}
