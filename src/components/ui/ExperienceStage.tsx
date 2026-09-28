"use client";

import { useEffect, useRef, useState } from "react";
import { scroll } from "@/lib/scroll";
import { FIRE_AT, cardMotion, stageAt } from "@/lib/curves";
import { detect } from "@/lib/perf";
import { site } from "@/lib/site";
import {
  atomForm,
  codeForm,
  globeForm,
  helixForm,
  loadImage,
  phoneForm,
  portraitForm,
  rainForm,
  type Form,
} from "@/lib/shapes";
import type { ConstructField, Layout } from "@/components/scene/ConstructField";

/**
 * The career, compiled.
 *
 * The section pins and one particle cloud lives on the stage — thousands of
 * the rain's own glyphs. Before the first card they are still falling code.
 * As each role comes up, the code dissolves and re-assembles into that role's
 * form: an atom for the React years, the double helix for health technology,
 * a phone for cross-platform mobile, a globe for freelance clients, `</>` for
 * where it began. After the last role the deck steps aside, and the same
 * particles land in one last form: him, sampled from the portrait photograph.
 *
 * Every particle holds an address in every form at once (lib/shapes.ts), and
 * scroll position only says which two forms it is between (lib/curves.ts,
 * `stageAt().morph`). Scrolling back un-compiles him, role by role.
 *
 * Everything continuous is written from one frame loop — nothing re-renders
 * while scrolling. Reduced motion, no script and no WebGL get the roles as a
 * plain list from CSS alone (see globals.css).
 */

export type Role = {
  company: string;
  title: string;
  period: string;
  points: readonly string[];
};

/** One form per role, in the order the cards come up. */
const ROLE_FORMS: { make: (n: number) => Form; label: string }[] = [
  { make: atomForm, label: "react" },
  { make: helixForm, label: "genome" },
  { make: phoneForm, label: "mobile" },
  { make: globeForm, label: "world" },
  { make: codeForm, label: "</>" },
];

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Region = { x0: number; y0: number; x1: number; y1: number };
const mixRegion = (a: Region, b: Region, t: number): Region => ({
  x0: lerp(a.x0, b.x0, t),
  y0: lerp(a.y0, b.y0, t),
  x1: lerp(a.x1, b.x1, t),
  y1: lerp(a.y1, b.y1, t),
});

export function ExperienceStage({
  roles,
  reveal,
}: {
  roles: readonly Role[];
  reveal: { eyebrow: string; title: string };
}) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const caption = useRef<HTMLSpanElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);

  const onScreen = useRef(false);
  const [near, setNear] = useState(false);
  const [noField, setNoField] = useState(false);

  // Build the cloud only once the section is close; run the loop only while it is.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen.current = e.isIntersecting;
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "120% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The deck, the rail and the heading: plain DOM, from the start.
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const n = roles.length;
    let lastCounter = -1;
    let armed: boolean[] | null = null;
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
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
      scroll.stageMorph = s.morph;
      scroll.stageReveal = s.reveal;

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

      // The card's edge facing the cloud flashes as its form starts to build.
      if (!armed) armed = Array.from({ length: n }, (_, i) => s.roleT - i < FIRE_AT * 0.5);
      for (let i = 0; i < n; i++) {
        const local = s.roleT - i;
        if (armed[i] && local >= FIRE_AT * 0.5) {
          armed[i] = false;
          const card = cards.current[i];
          if (card && local < 1 && s.reveal < 0.5) {
            card.classList.remove("is-firing");
            void card.offsetWidth;
            card.classList.add("is-firing");
          }
        } else if (!armed[i] && local < FIRE_AT * 0.5 - 0.08) {
          armed[i] = true;
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      scroll.stageActive = false;
    };
  }, [roles.length]);

  // The cloud.
  useEffect(() => {
    if (!near) return;
    const st = stage.current;
    const cv = canvas.current;
    if (!st || !cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let field: ConstructField | null = null;
    let raf = 0;
    const n = roles.length;
    const caps = detect();
    const count = caps.tier === "high" ? 16000 : caps.tier === "medium" ? 11000 : 6500;

    const labels = ["", ...roles.map((_, i) => ROLE_FORMS[i % ROLE_FORMS.length].label), ""];

    // Pointer: a little parallax, and the place where the code is touched.
    let px = 0;
    let py = 0;
    const touch = { x: -1e4, y: -1e4, at: -1e9, on: 0 };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        px = (e.clientX / window.innerWidth) * 2 - 1;
        py = (e.clientY / window.innerHeight) * 2 - 1;
      }
      const r = st.getBoundingClientRect();
      touch.x = e.clientX - r.left;
      touch.y = e.clientY - r.top;
      touch.at = performance.now() / 1000;
    };
    const onLeave = () => {
      touch.at = -1e9;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const resize = () => {
      if (!field) return;
      const r = st.getBoundingClientRect();
      field.resize(r.width, r.height);
    };

    const start = async () => {
      // Build forms one at a time so the main thread gets a breath between.
      const breathe = () => new Promise((r) => setTimeout(r, 0));
      const forms: Form[] = [rainForm(count)];
      for (let i = 0; i < n; i++) {
        await breathe();
        if (cancelled) return;
        forms.push(ROLE_FORMS[i % ROLE_FORMS.length].make(count));
      }
      const img = await loadImage(site.portrait);
      if (cancelled) return;
      forms.push(portraitForm(img, count));

      const { ConstructField } = await import("@/components/scene/ConstructField");
      if (cancelled) return;
      try {
        field = new ConstructField(cv, forms, caps.dpr[1]);
      } catch {
        setNoField(true);
        return;
      }
      resize();
      window.addEventListener("resize", resize);
      raf = requestAnimationFrame(loop);
    };

    const eased = { x: 0, y: 0, half: 0, glyph: 0.03, yaw: 0, pitch: 0 };
    let first = true;
    let lastNow = 0;
    let lastLabel = "";

    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      if (!onScreen.current || !field) return;
      const now = ms / 1000;
      const dt = Math.min(0.05, Math.max(0, now - lastNow));
      lastNow = now;

      // The cloud follows the scroll with a little lag, like the demo's
      // `uMorph += (target - uMorph) * k`, but frame-rate independent.
      const target = scroll.stageMorph;
      field.morph = first ? target : field.morph + (target - field.morph) * (1 - Math.exp(-dt * 3.6));
      const rv = scroll.stageReveal;

      // Where the form may sit: beside the deck on a wide screen, under it on a
      // phone; the whole stage below the heading once the deck steps aside.
      const base = st.getBoundingClientRect();
      const w = base.width;
      const h = base.height;
      const wide = w >= 768;
      let roleRegion: Region;
      if (wide) {
        const d = deck.current?.getBoundingClientRect();
        const left = d ? d.right - base.left + w * 0.04 : w * 0.5;
        roleRegion = { x0: left, y0: h * 0.1, x1: w * 0.95, y1: h * 0.92 };
      } else {
        let bottom = h * 0.5;
        const i = Math.min(n - 1, Math.max(0, Math.floor(target) - 1));
        const card = cards.current[i];
        if (card) bottom = card.getBoundingClientRect().bottom - base.top;
        roleRegion = { x0: 0, y0: Math.min(bottom + 14, h * 0.7), x1: w, y1: h - 16 };
      }
      const hd = heading.current?.getBoundingClientRect();
      const headBottom = hd ? hd.bottom - base.top : h * 0.25;
      // Wide: the heading holds the left, he takes the right.
      const revealRegion: Region = wide
        ? { x0: w * 0.36, y0: h * 0.07, x1: w * 0.99, y1: h * 0.995 }
        : { x0: 0, y0: Math.min(headBottom + 8, h * 0.45), x1: w, y1: h - 8 };
      const region = mixRegion(roleRegion, revealRegion, rv);

      const m = clamp01(field.morph / (field.formCount - 1)) * (field.formCount - 1);
      const i = Math.min(Math.floor(m), field.formCount - 2);
      const f = m - i;
      const reach = lerp(field.reach(i), field.reach(i + 1), f);
      const rw = region.x1 - region.x0;
      const rh = region.y1 - region.y0;
      const half = Math.max(20, Math.min((rh / 2) * 0.88, (rw / 2 / reach) * 0.9));
      const portrait = clamp01(field.morph - n);
      const glyphPx = (wide ? lerp(9, 7, portrait) : lerp(6.5, 5.2, portrait));

      const k = first ? 1 : 1 - Math.exp(-dt * 7);
      first = false;
      eased.x += ((region.x0 + region.x1) / 2 - eased.x) * k;
      eased.y += ((region.y0 + region.y1) / 2 - eased.y) * k;
      eased.half += (half - eased.half) * k;
      eased.glyph += (glyphPx / Math.max(eased.half, 1) - eased.glyph) * k;
      // A slow sway while it is an object; the face looks straight out.
      const yaw = Math.sin(now * 0.32) * 0.55 * (1 - portrait) + px * lerp(0.3, 0.12, portrait);
      const pitch = py * lerp(0.16, 0.08, portrait) + Math.sin(now * 0.23) * 0.06 * (1 - portrait);
      eased.yaw += (yaw - eased.yaw) * (1 - Math.exp(-dt * 3));
      eased.pitch += (pitch - eased.pitch) * (1 - Math.exp(-dt * 3));

      // The touch fades in while the pointer moves over the cloud and lets go
      // a moment after it stops — a still cursor should not hold a hole open.
      const live = now - touch.at < 1.2 ? 1 : 0;
      touch.on += (live - touch.on) * (1 - Math.exp(-dt * (live ? 8 : 2.5)));

      const layout: Layout = {
        x: eased.x,
        y: eased.y,
        half: eased.half,
        glyph: eased.glyph,
        yaw: eased.yaw,
        pitch: eased.pitch,
        opacity: 1,
        touch: { x: touch.x, y: touch.y, on: touch.on, radius: wide ? 78 : 56 },
      };
      field.render(now, layout);

      // Name the form being built, in the site's terminal voice.
      const cap = caption.current;
      if (cap) {
        const label = labels[Math.round(field.morph)] ?? "";
        if (label !== lastLabel) {
          lastLabel = label;
          cap.textContent = label ? `build → ${label}` : "";
        }
        const settle = 1 - Math.min(1, Math.abs(field.morph - Math.round(field.morph)) * 3);
        cap.style.opacity = (label ? settle * (1 - rv) * 0.9 : 0).toFixed(3);
        const cy = Math.min(h - 22, eased.y + eased.half + 18);
        cap.style.transform = `translate3d(${eased.x.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translateX(-50%)`;
      }
    };

    start().catch(() => setNoField(true));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      field?.dispose();
    };
  }, [near, roles]);

  const n = roles.length;

  return (
    <div ref={track} className="exp-track" style={{ "--exp-segments": n + 1.8 } as React.CSSProperties}>
      <div ref={stage} className="exp-stage" data-static={noField ? "" : undefined}>
        {/* The cloud. Under the deck, so the cards stay solid over it. */}
        <canvas ref={canvas} className="exp-field" aria-hidden="true" />
        <span ref={caption} className="exp-caption font-mono" aria-hidden="true" />

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
