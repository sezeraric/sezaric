"use client";

import { useEffect, useRef } from "react";
import { WEB_CARD_ATTR, scroll } from "@/lib/scroll";
import { figurePresence } from "@/lib/curves";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Threads thrown from the experience cards into the woven figure.
 *
 * As each role scrolls up past the lower part of the screen it fires a volley:
 * green threads spring out of the card's edge along oval arcs, fanning out to
 * both sides and converging on the figure, with cross-strands strung between
 * neighbouring threads as they pass — a spider's web being cast. They land
 * where the weave clip's own threads are streaming in, hold for a moment and
 * fade, so they read as feeding the clip rather than sitting on top of it.
 *
 * Plain 2D canvas in the backdrop layer, under the page: the threads come out
 * from behind the cards, and a second WebGL context is exactly what a phone
 * cannot afford. Nothing is drawn unless a volley is in the air.
 */

/**
 * A card fires when the edge its threads leave from rises past this fraction
 * of the viewport: its bottom edge on a phone, its top on a wide screen. On a
 * phone a tall card's top can cross the line while its bottom — where the
 * threads come from — is still off the screen.
 */
const FIRE_LINE = 0.84;
/** ...and re-arms once it is back below this one, so scrolling back and forth can fire it again. */
const REARM_LINE = 0.96;
const FIRE_LINE_WIDE = 0.72;
const REARM_LINE_WIDE = 0.86;

const TRAVEL = 1.05; // seconds, head from card to figure
const STAGGER = 0.035; // seconds between threads in a volley
const HOLD = 0.45;
const FADE = 0.9;

type Thread = {
  /** Origin in document coordinates: it rides along with the card. */
  ox: number;
  oy: number;
  /** Target in viewport coordinates: the figure does not scroll. */
  tx: number;
  ty: number;
  /** Signed bow of the arc, as a fraction of its length. */
  bend: number;
  delay: number;
};

type Volley = { born: number; threads: Thread[]; end: number };

function ease(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Point on the quadratic arc from origin to target, at s in 0..1. */
function arcPoint(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bend: number,
  s: number,
  out: { x: number; y: number },
) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  // Control point: the midpoint pushed out sideways, which is what bows the
  // thread into an oval arc instead of a straight dart.
  const cx = x0 + dx * 0.5 - dy * bend;
  const cy = y0 + dy * 0.5 + dx * bend;
  const u = 1 - s;
  out.x = u * u * x0 + 2 * u * s * cx + s * s * x1;
  out.y = u * u * y0 + 2 * u * s * cy + s * s * y1;
}

export default function WebThreads() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = canvas.current;
    if (!el || reduced) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(window.innerWidth * dpr);
      el.height = Math.round(window.innerHeight * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const volleys: Volley[] = [];
    const armed = new WeakMap<Element, boolean>();
    const p = { x: 0, y: 0 };
    const q = { x: 0, y: 0 };
    let drewLastFrame = false;
    let raf = 0;

    const fire = (card: Element, now: number) => {
      const r = card.getBoundingClientRect();
      const clip = document.querySelector(".weave-clip")?.getBoundingClientRect();
      if (!clip) return;
      const narrow = window.innerWidth < 768;
      const count = narrow ? 12 : 16;
      // Where the figure's body is in the clip: centred, upper two thirds.
      const bx = clip.left + clip.width * 0.5;
      const by = clip.top + clip.height * 0.5;
      const rx = clip.width * 0.2;
      const ry = clip.height * 0.3;

      const threads: Thread[] = [];
      for (let i = 0; i < count; i++) {
        const f = (i + 0.5) / count;
        // Out of the side of the card that faces the figure: the bottom edge
        // on a phone (the figure stands below), the right edge on a wide
        // screen (it stands to the right).
        const ox = narrow ? r.left + r.width * (0.08 + 0.84 * f) : r.right;
        const oy = (narrow ? r.bottom : r.top + r.height * (0.12 + 0.76 * f)) + scroll.y;
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random());
        // Alternate sides so the volley fans open like a web rather than
        // bending all one way.
        const side = i % 2 === 0 ? 1 : -1;
        threads.push({
          ox,
          oy,
          tx: bx + Math.cos(a) * rx * d,
          ty: by + Math.sin(a) * ry * d,
          bend: side * (0.22 + Math.random() * 0.28),
          delay: i * STAGGER + Math.random() * 0.05,
        });
      }
      const last = threads[threads.length - 1].delay;
      volleys.push({ born: now, threads, end: last + TRAVEL + HOLD + FADE });
    };

    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      const now = ms / 1000;

      const presence = figurePresence(scroll.expEntry, scroll.becomingExit);
      if (presence > 0) {
        const vh = window.innerHeight;
        const narrow = window.innerWidth < 768;
        const fireLine = narrow ? FIRE_LINE : FIRE_LINE_WIDE;
        const rearmLine = narrow ? REARM_LINE : REARM_LINE_WIDE;
        document.querySelectorAll(`[${WEB_CARD_ATTR}]`).forEach((card) => {
          const r = card.getBoundingClientRect();
          const edge = (narrow ? r.bottom : r.top) / vh;
          let isArmed = armed.get(card);
          if (isArmed === undefined) {
            // A card already above the line when the page is first seen has
            // been read; it only fires once it has been scrolled back below.
            isArmed = edge > fireLine;
            armed.set(card, isArmed);
          }
          if (isArmed && edge <= fireLine) {
            armed.set(card, false);
            fire(card, now);
          } else if (!isArmed && edge > rearmLine) {
            armed.set(card, true);
          }
        });
      }

      // Drop finished volleys.
      for (let i = volleys.length - 1; i >= 0; i--) {
        if (now - volleys[i].born > volleys[i].end) volleys.splice(i, 1);
      }

      if (!volleys.length) {
        if (drewLastFrame) {
          ctx.clearRect(0, 0, el.width, el.height);
          drewLastFrame = false;
        }
        return;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      drewLastFrame = true;

      for (const v of volleys) {
        const age = now - v.born;
        const heads: number[] = [];
        const alphas: number[] = [];

        for (let i = 0; i < v.threads.length; i++) {
          const t = v.threads[i];
          const local = (age - t.delay) / TRAVEL;
          if (local <= 0) {
            heads.push(0);
            alphas.push(0);
            continue;
          }
          const head = ease(Math.min(1, local));
          const fadeStart = t.delay + TRAVEL + HOLD;
          const alpha = presence * (age < fadeStart ? 1 : Math.max(0, 1 - (age - fadeStart) / FADE));
          heads.push(head);
          alphas.push(alpha);
          if (alpha <= 0.01) continue;

          const x0 = t.ox;
          const y0 = t.oy - scroll.y;

          // The thread itself, drawn up to its head.
          ctx.beginPath();
          const steps = 22;
          for (let k = 0; k <= steps; k++) {
            arcPoint(x0, y0, t.tx, t.ty, t.bend, (head * k) / steps, p);
            if (k === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          // A soft glow under a fine bright core.
          ctx.strokeStyle = `rgba(53, 255, 119, ${0.22 * alpha})`;
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.strokeStyle = `rgba(170, 255, 200, ${0.95 * alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // The head, while it is still flying.
          if (head < 0.999) {
            arcPoint(x0, y0, t.tx, t.ty, t.bend, head, p);
            ctx.fillStyle = `rgba(210, 255, 225, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // The web: cross-strands between neighbouring threads, strung once
        // both have flown past that point, sagging back toward the card.
        for (let i = 0; i < v.threads.length - 1; i++) {
          const a = v.threads[i];
          const b = v.threads[i + 1];
          const alpha = Math.min(alphas[i], alphas[i + 1]) * 0.75;
          if (alpha <= 0.01) continue;
          for (const s of [0.28, 0.5, 0.72]) {
            if (heads[i] < s || heads[i + 1] < s) continue;
            arcPoint(a.ox, a.oy - scroll.y, a.tx, a.ty, a.bend, s, p);
            arcPoint(b.ox, b.oy - scroll.y, b.tx, b.ty, b.bend, s, q);
            const mx = (p.x + q.x) / 2;
            const my = (p.y + q.y) / 2;
            const ox = (a.ox + b.ox) / 2;
            const oy = (a.oy + b.oy) / 2 - scroll.y;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.quadraticCurveTo(mx + (ox - mx) * 0.12, my + (oy - my) * 0.12, q.x, q.y);
            ctx.strokeStyle = `rgba(120, 255, 170, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  if (reduced) return null;

  return <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
