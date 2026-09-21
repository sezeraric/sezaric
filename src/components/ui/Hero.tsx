"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n";
import { site } from "@/lib/site";
import { Terminal } from "./Terminal";

export function Hero({ d }: { d: Dictionary }) {
  const [booted, setBooted] = useState(false);

  return (
    <section id="hero" className="relative flex min-h-svh flex-col justify-center">
      <div className="shell w-full py-24 sm:py-28">
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

      <div className="shell pb-10" style={{ opacity: booted ? 1 : 0, transition: "opacity 1.2s ease 400ms" }}>
        <a
          href="#bullet-time"
          className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-text-faint transition-colors hover:text-mx"
        >
          <span className="relative flex h-9 w-5 items-start justify-center rounded-full border border-line-bright pt-1.5">
            <span className="h-1.5 w-1 animate-bounce rounded-full bg-mx" />
          </span>
          {d.hero.scroll}
        </a>
      </div>
    </section>
  );
}
