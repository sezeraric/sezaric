"use client";

import { useEffect, useRef, useState } from "react";
import { scroll } from "@/lib/scroll";
import { FIRE_AT, cardMotion, stageAt } from "@/lib/curves";
import { useIsNarrow } from "@/lib/useViewport";
import { ScrollVideo } from "./ScrollVideo";

/**
 * The career, as the thing he is built from.
 *
 * The section pins. Each role comes up as a card; as it arrives, its edge
 * lights and it casts a web of green threads — oval arcs fanning out both
 * ways, cross-strands strung between neighbours — onto the figure standing
 * beside it, landing on the band of the body that role builds: the first role
 * the feet, the last the head. The weave clip (public/weave.mp4, made in
 * Higgsfield from the same frame as the portrait) builds the wireframe in step.
 * After the last role the deck steps aside, the figure takes the centre and
 * the wireframe turns into the photograph.
 *
 * Everything continuous is written to the DOM from one frame loop — nothing
 * here re-renders while scrolling. Reduced motion and no-script get the plain
 * list and the finished photograph, from CSS alone (see globals.css).
 */

export type Role = {
  company: string;
  title: string;
  period: string;
  points: readonly string[];
};

const DESKTOP_SRC = "/weave.mp4";
const MOBILE_SRC = "/weave-mobile.mp4";
const POSTER = "/weave-poster.jpg";
const STILL = "/weave-last.jpg";

const TRAVEL = 1.1; // seconds, a thread from the card to the figure
const STAGGER = 0.03;
const HOLD = 0.5;
const FADE = 1.0;

type Thread = { x0: number; y0: number; x1: number; y1: number; bend: number; delay: number };
type Volley = { born: number; threads: Thread[]; end: number };

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Point on the oval arc from (x0,y0) to (x1,y1) at s: the midpoint pushed sideways by `bend`. */
function arc(t: Thread, s: number, out: { x: number; y: number }) {
  const dx = t.x1 - t.x0;
  const dy = t.y1 - t.y0;
  const cx = t.x0 + dx * 0.5 - dy * t.bend;
  const cy = t.y0 + dy * 0.5 + dx * t.bend;
  const u = 1 - s;
  out.x = u * u * t.x0 + 2 * u * s * cx + s * s * t.x1;
  out.y = u * u * t.y0 + 2 * u * s * cy + s * s * t.y1;
}

export function ExperienceStage({
  roles,
  reveal,
}: {
  roles: readonly Role[];
  reveal: { eyebrow: string; title: string };
}) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);

  const clip = useRef(0);
  const onScreen = useRef(false);
  const [near, setNear] = useState(false);
  const narrow = useIsNarrow();

  // Fetch the clip only when the section is close; run the loop only while it is.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen.current = e.isIntersecting;
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const t = track.current;
    const st = stage.current;
    const cv = canvas.current;
    if (!t || !st || !cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const n = roles.length;
    let dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = st.getBoundingClientRect();
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
    };
    size();
    window.addEventListener("resize", size);

    const volleys: Volley[] = [];
    let armed: boolean[] | null = null;
    let drew = false;
    let lastCounter = -1;
    const p = { x: 0, y: 0 };
    const q = { x: 0, y: 0 };

    const fire = (i: number, now: number) => {
      const card = cards.current[i];
      const fig = figure.current;
      if (!card || !fig) return;
      const base = st.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const f = fig.getBoundingClientRect();
      const wide = window.innerWidth >= 768;
      const count = wide ? 18 : 14;

      // The band of the body this role builds, feet first.
      const bandY = f.top + f.height * (0.88 - 0.64 * ((i + 0.5) / n)) - base.top;
      const bandH = ((f.height * 0.64) / n) * 0.8;
      const bodyX = f.left + f.width * 0.5 - base.left;
      const bodyW = f.width * (i === 0 ? 0.12 : 0.2);

      const threads: Thread[] = [];
      for (let k = 0; k < count; k++) {
        const u = (k + 0.5) / count;
        // Out of the lit edge: the bottom of the card on a phone, where the
        // figure stands below it; its right edge on a wide screen.
        const x0 = wide ? c.right - base.left : c.left - base.left + c.width * (0.1 + 0.8 * u);
        const y0 = wide ? c.top - base.top + c.height * (0.12 + 0.76 * u) : c.bottom - base.top;
        const side = k % 2 === 0 ? 1 : -1;
        threads.push({
          x0,
          y0,
          x1: bodyX + (Math.random() - 0.5) * 2 * bodyW,
          y1: bandY + (Math.random() - 0.5) * bandH,
          bend: side * (0.24 + Math.random() * 0.3),
          delay: k * STAGGER + Math.random() * 0.06,
        });
      }
      const last = threads[threads.length - 1].delay;
      volleys.push({ born: now, threads, end: last + TRAVEL + HOLD + FADE });

      card.classList.remove("is-firing");
      // Restart the edge's flash even if it is still running from last time.
      void card.offsetWidth;
      card.classList.add("is-firing");
    };

    const draw = (now: number) => {
      for (let i = volleys.length - 1; i >= 0; i--) {
        if (now - volleys[i].born > volleys[i].end) volleys.splice(i, 1);
      }
      if (!volleys.length) {
        if (drew) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, cv.width, cv.height);
          drew = false;
        }
        return;
      }
      drew = true;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      for (const v of volleys) {
        const age = now - v.born;
        const heads: number[] = [];
        const alphas: number[] = [];

        v.threads.forEach((t) => {
          const local = (age - t.delay) / TRAVEL;
          if (local <= 0) {
            heads.push(0);
            alphas.push(0);
            return;
          }
          const head = easeOut(Math.min(1, local));
          const fadeFrom = t.delay + TRAVEL + HOLD;
          const a = age < fadeFrom ? 1 : Math.max(0, 1 - (age - fadeFrom) / FADE);
          heads.push(head);
          alphas.push(a);
          if (a <= 0.01) return;

          ctx.beginPath();
          const steps = 24;
          for (let k = 0; k <= steps; k++) {
            arc(t, (head * k) / steps, p);
            if (k === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = `rgba(40, 255, 110, ${0.2 * a})`;
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.strokeStyle = `rgba(190, 255, 210, ${0.9 * a})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // The spark at the front, while it is still travelling.
          if (head < 0.995) {
            arc(t, head, p);
            ctx.fillStyle = `rgba(230, 255, 236, ${a})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(60, 255, 130, ${0.25 * a})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // The web: cross-strands between neighbouring threads, strung once
        // both have flown past, sagging back toward the card.
        for (let i = 0; i < v.threads.length - 1; i++) {
          const a = Math.min(alphas[i], alphas[i + 1]) * 0.7;
          if (a <= 0.01) continue;
          const t0 = v.threads[i];
          const t1 = v.threads[i + 1];
          for (const s of [0.22, 0.42, 0.62, 0.82]) {
            if (heads[i] < s || heads[i + 1] < s) continue;
            arc(t0, s, p);
            arc(t1, s, q);
            const mx = (p.x + q.x) / 2;
            const my = (p.y + q.y) / 2;
            const ox = (t0.x0 + t1.x0) / 2;
            const oy = (t0.y0 + t1.y0) / 2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.quadraticCurveTo(mx + (ox - mx) * 0.14, my + (oy - my) * 0.14, q.x, q.y);
            ctx.strokeStyle = `rgba(130, 255, 175, ${a * (1.05 - s * 0.6)})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      const now = ms / 1000;
      if (!onScreen.current) {
        scroll.stageActive = false;
        return;
      }

      const r = t.getBoundingClientRect();
      const vh = window.innerHeight;
      const budget = r.height - vh;
      const progress = budget > 0 ? clamp01(-r.top / budget) : 0;
      scroll.stageActive = r.top <= 1 && r.bottom >= vh - 1;

      const s = stageAt(progress, n);
      clip.current = s.clip;
      st.style.setProperty("--reveal", s.reveal.toFixed(4));

      for (let i = 0; i < n; i++) {
        const card = cards.current[i];
        if (card) {
          const m = cardMotion(s.roleT, i, n);
          const o = m.enter * (1 - m.exit);
          card.style.opacity = o.toFixed(3);
          card.style.transform = `translate3d(0, ${((1 - m.enter) * 40 - m.exit * 40).toFixed(1)}px, 0)`;
          card.style.visibility = o > 0.01 ? "visible" : "hidden";
        }
        const fill = fills.current[i];
        if (fill) fill.style.transform = `scaleX(${clamp01(s.roleT - i).toFixed(3)})`;
      }

      const current = Math.min(n - 1, Math.floor(s.roleT));
      if (counter.current && current !== lastCounter) {
        lastCounter = current;
        counter.current.textContent = String(current + 1).padStart(2, "0");
      }
      if (deck.current) {
        deck.current.style.opacity = (1 - s.reveal).toFixed(3);
        deck.current.style.visibility = s.reveal < 0.99 ? "visible" : "hidden";
      }
      if (heading.current) {
        heading.current.style.opacity = s.reveal.toFixed(3);
        heading.current.style.transform = `translate3d(0, ${((1 - s.reveal) * 24).toFixed(1)}px, 0)`;
      }

      // A card fires as it arrives. Scrolling back above it re-arms it.
      if (!armed) armed = Array.from({ length: n }, (_, i) => s.roleT - i < FIRE_AT);
      for (let i = 0; i < n; i++) {
        const local = s.roleT - i;
        if (armed[i] && local >= FIRE_AT && s.reveal < 0.5) {
          armed[i] = false;
          fire(i, now);
        } else if (!armed[i] && local < FIRE_AT - 0.08) {
          armed[i] = true;
        }
      }

      draw(now);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      scroll.stageActive = false;
    };
  }, [roles.length]);

  const n = roles.length;

  return (
    <div ref={track} className="exp-track" style={{ "--exp-segments": n + 1.8 } as React.CSSProperties}>
      <div ref={stage} className="exp-stage">
        {/* The figure. Its black falls away into the stage with `lighten`. */}
        <div ref={figure} className="exp-figure" aria-hidden="true">
          {near && (
            <ScrollVideo
              key={narrow ? "m" : "d"}
              src={narrow ? MOBILE_SRC : DESKTOP_SRC}
              poster={POSTER}
              progress={() => clip.current}
              active={() => onScreen.current}
              className="h-full w-full object-contain"
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element -- the finished picture for reduced motion, sized by CSS */}
          <img src={STILL} alt="" className="exp-still h-full w-full object-contain" loading="lazy" />
        </div>

        {/* The threads: under the cards, so they come out from behind the lit edge. */}
        <canvas ref={canvas} className="exp-threads" aria-hidden="true" />

        <div ref={deck} className="exp-deck">
          <div className="exp-rail" aria-hidden="true">
            <span className="exp-counter font-mono">
              <span ref={counter}>01</span>
              <span className="text-text-faint"> / {String(n).padStart(2, "0")}</span>
            </span>
            <ol className="exp-segments">
              {roles.map((role, i) => (
                <li key={role.company}>
                  <span className="exp-segment">
                    <span
                      ref={(el) => {
                        fills.current[i] = el;
                      }}
                      className="exp-fill"
                    />
                  </span>
                  <span className="exp-segment-label">{role.company}</span>
                </li>
              ))}
            </ol>
          </div>

          <ol className="exp-cards">
            {roles.map((role, i) => (
              <li
                key={role.company}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                className="exp-card"
              >
                <p className="font-mono text-[11px] tracking-[0.14em] text-text-faint">{role.period}</p>
                <h3 className="mt-2 text-[1.05rem] font-medium leading-snug text-text sm:text-xl">
                  {role.title}
                </h3>
                <p className="mt-0.5 font-medium text-mx-soft">{role.company}</p>
                <ul className="exp-points mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
                  {role.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-text-dim">
                      <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-mx-dim" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                {/* The edge the threads leave from; flashes as they go. */}
                <span className="exp-emitter" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>

        <div ref={heading} className="exp-heading shell">
          <p className="eyebrow">{reveal.eyebrow}</p>
          <p className="mt-3 max-w-xl text-[clamp(1.75rem,6vw,3.25rem)] font-semibold leading-[1.05] tracking-tight text-text">
            {reveal.title}
          </p>
        </div>
      </div>
    </div>
  );
}
