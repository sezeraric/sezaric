"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n";
import { site } from "@/lib/site";
import { Terminal } from "./Terminal";
import { RabbitGlyph } from "./WhiteRabbit";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

export function Hero({ d }: { d: Dictionary }) {
  const [booted, setBooted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const reduced = usePrefersReducedMotion();

  // Come back if the visitor scrolls up again after following it.
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(false), 1600);
    return () => window.clearTimeout(t);
  }, [leaving]);

  return (
    <section id="hero" className="relative flex min-h-svh flex-col justify-center">
      {/*
        The bullet-time shot now fades in while the hero's tail is still on
        screen, so that the section never arrives over a stretch of black. This
        keeps the copy readable across that overlap.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink via-ink/70 to-transparent"
        aria-hidden="true"
      />

      <div className="shell relative w-full py-24 sm:py-28">
        <div className="max-w-2xl">
          <div className="hairline rounded-sm bg-ink/70 p-4 backdrop-blur-[2px] sm:p-6">
            <div className="mb-4 flex items-center gap-2 border-b border-line pb-3">
              <span className="h-2 w-2 rounded-full bg-danger/70" />
              <span className="h-2 w-2 rounded-full bg-amber/70" />
              <span className="h-2 w-2 rounded-full bg-mx/70" />
              <span className="ml-2 font-mono text-[11px] tracking-widest text-text-faint">
                /dev/tty0
              </span>
            </div>
            <Terminal lines={d.boot} onDone={() => setBooted(true)} />
          </div>
        </div>

        <div
          className="mt-10 max-w-4xl"
          style={{
            opacity: booted ? 1 : 0,
            transform: booted ? "none" : "translate3d(0,1.25rem,0)",
            transition:
              "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)",
          }}
        >
          <h1 className="text-[clamp(2.25rem,8.5vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-text">
            {site.name}
          </h1>
          <p className="mt-5 font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-mx glow-soft sm:text-sm sm:tracking-[0.18em]">
            {d.meta.role} — {d.meta.focus}
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-dim sm:text-lg">
            {d.meta.tagline}
          </p>
        </div>
      </div>

      <div className="shell relative pb-10" style={{ opacity: booted ? 1 : 0, transition: "opacity 1.2s ease 400ms" }}>
        {/*
          The rabbit the boot sequence tells you to follow. It appears the moment
          that line finishes typing, and following it is the way in: the link is
          a real anchor, so the smooth-scroll handler takes the page down while
          the rabbit bounds off ahead.
        */}
        <a
          href="#bullet-time"
          onClick={() => setLeaving(true)}
          aria-label={d.hero.followRabbit}
          className="group inline-flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-text-faint transition-colors hover:text-mx"
        >
          <span
            key={booted ? "in" : "out"}
            className={`rabbit block h-12 w-12 ${
              reduced ? "" : leaving ? "rabbit-leave" : booted ? "rabbit-enter" : ""
            }`}
          >
            <span className={`block h-full w-full ${reduced || leaving ? "" : "rabbit-idle"}`}>
              <RabbitGlyph className="h-full w-full" />
            </span>
          </span>
          <span>
            {d.hero.followRabbit}
            <span aria-hidden="true" className="ml-2 inline-block transition-transform group-hover:translate-y-0.5">
              ↓
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
