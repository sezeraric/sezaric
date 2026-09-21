"use client";

import { useState } from "react";
import { bootLines, profile } from "@/lib/content";
import { Terminal } from "./Terminal";

export function Hero() {
  const [booted, setBooted] = useState(false);

  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col justify-center"
    >
      <div className="shell w-full py-28">
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
            <Terminal lines={bootLines} onDone={() => setBooted(true)} />
          </div>
        </div>

        <div
          className="mt-10 max-w-4xl"
          style={{
            opacity: booted ? 1 : 0,
            transform: booted ? "none" : "translate3d(0,1.25rem,0)",
            transition: "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)",
          }}
        >
          <h1 className="text-[clamp(2.75rem,9vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-text">
            {profile.name}
          </h1>
          <p className="mt-5 font-mono text-sm tracking-[0.18em] text-mx uppercase glow-soft">
            {profile.role} — {profile.focus}
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-dim">
            {profile.tagline}
          </p>
        </div>
      </div>

      <div
        className="shell pb-10"
        style={{
          opacity: booted ? 1 : 0,
          transition: "opacity 1.2s ease 400ms",
        }}
      >
        <a
          href="#bullet-time"
          className="group inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-text-faint uppercase transition-colors hover:text-mx"
        >
          <span className="relative flex h-9 w-5 items-start justify-center rounded-full border border-line-bright pt-1.5">
            <span className="h-1.5 w-1 animate-bounce rounded-full bg-mx" />
          </span>
          Scroll
        </a>
      </div>
    </section>
  );
}
