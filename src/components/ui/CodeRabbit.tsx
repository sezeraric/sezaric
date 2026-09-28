"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { GlyphSwarm, homesFromDrawing } from "@/lib/glyphSwarm";

/**
 * The white rabbit, made of the rain.
 *
 * In the film it is a tattoo — a flat white shape, not an animal. Here it is
 * the same silhouette, held together out of falling code: the glyphs rain in
 * from above and are caught into it one by one. Bring a pointer close and they
 * scatter around it; follow it (`leave()`) and the rabbit lets go, falling
 * away as rain down the page you are about to scroll. It is caught back
 * together when you return.
 */

export type CodeRabbitHandle = { leave: () => void };

/** A sitting rabbit, facing right, on a 240 × 200 canvas. */
function drawRabbit(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#fff";
  const blob = (x: number, y: number, rx: number, ry: number, rot = 0) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();
  };
  blob(100, 140, 72, 50, -0.1); // body
  blob(72, 145, 46, 46); // haunch
  blob(150, 128, 34, 42, 0.2); // chest
  blob(176, 86, 30, 25, -0.25); // head
  blob(200, 94, 13, 11); // muzzle
  blob(137, 44, 8.5, 38, -0.8); // far ear, swept further back
  blob(166, 38, 9.5, 40, -0.32); // near ear
  blob(170, 183, 17, 8); // forepaw
  blob(98, 189, 42, 9); // hind foot
  blob(28, 130, 14, 14); // tail
  // The eye is a hole in the shape, not a glyph.
  ctx.globalCompositeOperation = "destination-out";
  blob(187, 80, 5.5, 5.5);
  // A gap between the ears so they read as two.
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(158, 66);
  ctx.lineTo(146, 4);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
}

const SIZES = {
  lg: { count: 640, glyph: 6.4 },
  sm: { count: 340, glyph: 4.2 },
};

export function CodeRabbit({
  size = "lg",
  className = "",
  ref,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  ref?: Ref<CodeRabbitHandle>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const swarm = useRef<GlyphSwarm | null>(null);
  const leaveAt = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    leave: () => {
      const s = swarm.current;
      if (!s || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      s.release();
      leaveAt.current = performance.now() / 1000;
    },
  }), []);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const { count, glyph } = SIZES[size];
    const s = new GlyphSwarm(cv, count, glyph);
    swarm.current = s;
    s.homes = homesFromDrawing(count, 240, 200, drawRabbit);
    s.repel = size === "lg" ? 30 : 16;

    const layout = () => {
      const r = cv.getBoundingClientRect();
      s.resize(r.width, r.height);
      // Fit the drawing, sitting on the bottom of the canvas.
      const aspect = 240 / 200;
      const w = Math.min(r.width, r.height * aspect);
      const h = w / aspect;
      s.box = { x: (r.width - w) / 2, y: r.height - h, w, h };
    };
    layout();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      s.settle();
      s.draw();
      return;
    }

    let raf = 0;
    let running = false;
    let started = false;
    let last = 0;
    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      const now = ms / 1000;
      const dt = Math.min(0.04, Math.max(0, now - last));
      last = now;
      if (!started) {
        started = true;
        s.rainIn(now, 1.2);
      }
      // After it has left, it is caught back together once it is off screen
      // or a moment has passed.
      if (leaveAt.current !== null && (s.empty || now - leaveAt.current > 2.4)) {
        leaveAt.current = null;
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
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "10% 0px" });
    io.observe(cv);

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      s.pointer.x = e.clientX - r.left;
      s.pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      s.pointer.x = -1e4;
      s.pointer.y = -1e4;
    };
    const host = cv.parentElement ?? cv;
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", layout);

    return () => {
      stop();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", layout);
      swarm.current = null;
    };
  }, [size]);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
