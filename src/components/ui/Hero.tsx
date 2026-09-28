"use client";

import { useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { site } from "@/lib/site";
import { Terminal } from "./Terminal";
import { CodeRabbit, type CodeRabbitHandle } from "./CodeRabbit";
import { ScrambleText } from "./ScrambleText";

export function Hero({ d }: { d: Dictionary }) {
  const [booted, setBooted] = useState(false);
  const rabbit = useRef<CodeRabbitHandle>(null);

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

      <div className="shell relative w-full pb-10 pt-20 sm:py-28">
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

            {/*
              The rabbit is caught together out of the rain right under the
              line that tells you to follow it — the terminal is at the top of
              every screen, so it is always in view. Following it (a real
              anchor; the smooth-scroll handler takes the page down) lets it
              go: it falls away as code down the page ahead of you.
            */}
            {booted && (
              <a
                href="#bullet-time"
                onClick={() => rabbit.current?.leave()}
                aria-label={d.hero.followRabbit}
                className="group mt-2 flex items-end gap-3 font-mono text-[13px] text-mx transition-colors hover:text-mx-soft sm:text-sm"
              >
                <CodeRabbit ref={rabbit} className="block h-[108px] w-[136px] sm:h-[136px] sm:w-[172px]" />
                <span aria-hidden="true" className="mb-2 inline-block transition-transform group-hover:translate-y-1">
                  ↓
                </span>
              </a>
            )}
          </div>
        </div>

        <div
          className="mt-7 max-w-4xl sm:mt-10"
          style={{
            opacity: booted ? 1 : 0,
            transform: booted ? "none" : "translate3d(0,1.25rem,0)",
            transition:
              "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)",
          }}
        >
          {/* The name decodes out of the rain once the terminal is done, and
              flickers back through it when a pointer passes over. */}
          <ScrambleText
            as="h1"
            text={site.name}
            active={booted}
            replayOnHover
            speed={30}
            className="block text-[clamp(2.25rem,8.5vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-text"
          />
          <p className="mt-5 font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-mx glow-soft sm:text-sm sm:tracking-[0.18em]">
            {d.meta.role} — {d.meta.focus}
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-text-dim sm:mt-6 sm:text-lg">
            {d.meta.tagline}
          </p>
        </div>
      </div>


    </section>
  );
}
