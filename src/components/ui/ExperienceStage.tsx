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
 * lights and it fires a fan of lasers that all meet at one point on the
 * figure — the focus, in the middle of the chest. A core ignites there, and
 * with every hit the figure is revealed a ring further out from that point,
 * so after the last role he has been built outward from a single spark. The
 * figure is the weave clip (public/weave.mp4, made in Higgsfield from the same
 * frame as the portrait), held on its finished wireframe. After the last role
 * the deck steps aside, the figure takes the centre and the wireframe turns
 * into the photograph.
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

const EXTEND = 0.26; // seconds, a beam from the card to the focus
const STAGGER = 0.022;
const SUSTAIN = 0.85;
const RETRACT = 0.3; // the beam is drawn into the focus
/** The focus, as a fraction of the figure's box: the middle of the chest. */
const FOCUS = { x: 0.5, y: 0.44 };
/** Where his feet are in the clip, as a fraction of its height. */
const BODY_FEET = 0.93;

type Beam = { x0: number; y0: number; delay: number; seed: number };
type Volley = { born: number; beams: Beam[]; hit: boolean; role: number; life: number };

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t;

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
    let lastCounter = -1;
    let drew = false;

    // The focus and the reveal around it, in stage coordinates.
    const focus = { x: 0, y: 0, lx: 0, ly: 0, maxR: 1 };
    let hits: number | null = null;
    let radius = 0;
    let flash = 0;
    let lastNow = 0;

    const fire = (i: number, now: number) => {
      const card = cards.current[i];
      if (!card) return;
      const base = st.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const wide = window.innerWidth >= 768;
      const count = wide ? 12 : 10;

      const beams: Beam[] = [];
      for (let k = 0; k < count; k++) {
        const u = (k + 0.5) / count;
        beams.push({
          // Out of the lit edge: the bottom of the card on a phone, where the
          // figure stands below it; its right edge on a wide screen.
          x0: wide ? c.right - base.left : c.left - base.left + c.width * (0.08 + 0.84 * u),
          y0: wide ? c.top - base.top + c.height * (0.1 + 0.8 * u) : c.bottom - base.top,
          // The middle beams first, the outer ones a beat later.
          delay: Math.abs(u - 0.5) * count * STAGGER,
          seed: Math.random(),
        });
      }
      const last = Math.max(...beams.map((b) => b.delay));
      // A new volley cuts the previous one short.
      for (const v of volleys) v.life = Math.min(v.life, now - v.born + 0.12);
      volleys.push({ born: now, beams, hit: false, role: i, life: last + EXTEND + SUSTAIN + RETRACT });

      card.classList.remove("is-firing");
      // Restart the edge's flash even if it is still running from last time.
      void card.offsetWidth;
      card.classList.add("is-firing");
    };

    const draw = (now: number, active: boolean) => {
      for (let i = volleys.length - 1; i >= 0; i--) {
        if (now - volleys[i].born > volleys[i].life) volleys.splice(i, 1);
      }
      const core = active && (hits ?? 0) > 0;
      if (!volleys.length && !core && flash < 0.01) {
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
        const fade = age > v.life - 0.12 ? clamp01((v.life - age) / 0.12) : 1;
        v.beams.forEach((b) => {
          const local = age - b.delay;
          if (local <= 0) return;
          const reach = easeOut(clamp01(local / EXTEND));
          const drawIn = easeIn(clamp01((local - EXTEND - SUSTAIN) / RETRACT));
          if (drawIn >= 1) return;
          if (reach >= 1 && !v.hit) {
            v.hit = true;
            hits = Math.max(hits ?? 0, v.role + 1);
            flash = 1;
          }
          const hx = b.x0 + (focus.x - b.x0) * reach;
          const hy = b.y0 + (focus.y - b.y0) * reach;
          const tx = b.x0 + (focus.x - b.x0) * drawIn;
          const ty = b.y0 + (focus.y - b.y0) * drawIn;
          // A laser hums: a fast, slight flicker, different on every beam.
          const a = fade * (0.82 + 0.18 * Math.sin(now * 70 + b.seed * 40));

          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(hx, hy);
          ctx.strokeStyle = `rgba(40, 255, 110, ${0.14 * a})`;
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.strokeStyle = `rgba(60, 255, 130, ${0.45 * a})`;
          ctx.lineWidth = 2.6;
          ctx.stroke();
          ctx.strokeStyle = `rgba(232, 255, 238, ${0.95 * a})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Where it leaves the card, a small bright point.
          if (drawIn < 0.05) {
            ctx.fillStyle = `rgba(200, 255, 215, ${0.7 * a})`;
            ctx.beginPath();
            ctx.arc(b.x0, b.y0, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // The core: a spark at the focus, flaring with every hit.
      if (core || flash > 0.01) {
        const r = 7 + 22 * flash;
        const g = ctx.createRadialGradient(focus.x, focus.y, 0, focus.x, focus.y, r * 2.4);
        g.addColorStop(0, `rgba(235, 255, 240, ${0.55 + 0.45 * flash})`);
        g.addColorStop(0.22, `rgba(80, 255, 140, ${0.35 + 0.4 * flash})`);
        g.addColorStop(1, "rgba(0, 255, 65, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(focus.x, focus.y, r * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // The edge of what has been built so far, as it grows.
      if (core && radius > 2) {
        const moving = clamp01(Math.abs((hits! / n) * focus.maxR - radius) / (focus.maxR * 0.06));
        const a = 0.1 + 0.6 * moving;
        ctx.beginPath();
        ctx.arc(focus.x, focus.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(40, 255, 110, ${0.18 * a})`;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.strokeStyle = `rgba(170, 255, 200, ${0.8 * a})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
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

      // Where the focus is this frame, in stage coordinates and in the
      // figure's own (for its mask).
      const fig = figure.current;
      if (fig) {
        const base = st.getBoundingClientRect();
        const f = fig.getBoundingClientRect();
        focus.lx = f.width * FOCUS.x;
        focus.ly = f.height * FOCUS.y;
        focus.x = f.left - base.left + focus.lx;
        focus.y = f.top - base.top + focus.ly;
        // Far enough to reach his feet — the furthest part of him from the
        // chest — so the last card is the one that completes him. (Measured
        // to the clip's corners instead, he was whole by the third card.)
        focus.maxR = f.height * (BODY_FEET - FOCUS.y) * 1.04;
      }

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

      // A card fires as it arrives. Scrolling back above it re-arms it. A
      // fast scroll that crosses several cards in one frame fires only the
      // one now on screen — the rest are passed, not thrown all at once.
      if (!armed) armed = Array.from({ length: n }, (_, i) => s.roleT - i < FIRE_AT);
      let toFire = -1;
      for (let i = 0; i < n; i++) {
        const local = s.roleT - i;
        if (armed[i] && local >= FIRE_AT) {
          armed[i] = false;
          if (local < 1 && s.reveal < 0.5) toFire = i;
        } else if (!armed[i] && local < FIRE_AT - 0.08) {
          armed[i] = true;
        }
      }
      if (toFire >= 0) fire(toFire, now);

      // How much of him has been built: one ring per card whose lasers have
      // hit. Scrolling back above a card takes its ring away again.
      const fired = armed.reduce((sum, a) => sum + (a ? 0 : 1), 0);
      if (hits === null) hits = fired;
      hits = Math.min(hits, fired);
      const dt = Math.min(0.05, Math.max(0, now - lastNow));
      lastNow = now;
      flash *= Math.exp(-dt * 5);
      const target = s.reveal > 0.02 ? focus.maxR * 1.2 : (focus.maxR * hits) / n;
      radius += (target - radius) * (1 - Math.exp(-dt * 4.5));
      if (fig) {
        fig.style.setProperty("--fx", `${focus.lx.toFixed(1)}px`);
        fig.style.setProperty("--fy", `${focus.ly.toFixed(1)}px`);
        fig.style.setProperty("--fr", `${Math.max(1, radius).toFixed(1)}px`);
      }

      draw(now, s.reveal < 0.3);
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

        {/*
          The lasers, over the deck: they leave from the card's lit edge and
          head away from it, so they never cross its text — and under the
          card's shadow they looked as if they started a hand's width below it.
        */}
        <canvas ref={canvas} className="exp-threads" aria-hidden="true" />

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
