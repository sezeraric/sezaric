"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { phase } from "@/lib/curves";
import { scroll } from "@/lib/scroll";

/**
 * The pinned bullet-time act.
 *
 * The tall outer section is the scroll budget; the sticky child is what you
 * actually see. The scrubbed video and the rain read the same progress value,
 * so the copy and the shot stay in lockstep without either driving the other.
 *
 * Only a coarse stage index is kept in React state. Everything continuous —
 * the progress rail, the problem log — is written straight to the DOM in a
 * frame loop, so this component re-renders three times for the whole section
 * instead of once per frame.
 */
function useScrollDriven(itemCount: number) {
  const [stage, setStage] = useState(0);
  const barRef = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    let last = -1;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = scroll.bulletTime;

      const next = p < 0.26 ? 0 : p < 0.76 ? 1 : 2;
      if (next !== last) {
        last = next;
        setStage(next);
      }

      if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;

      // Reveal the log one line at a time across the held shot.
      const log = phase(p).log;
      for (let i = 0; i < itemCount; i++) {
        const el = items.current[i];
        if (!el) continue;
        const at = itemCount > 1 ? i / (itemCount - 1) : 0;
        const lit = log > 0.02 && p > 0.3 + at * 0.34 ? 1 : 0;
        el.style.opacity = String(lit * log);
        el.style.transform = lit ? "none" : "translate3d(0.75rem, 0, 0)";
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [itemCount]);

  return { stage, barRef, items };
}

function Panel({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 pb-14 sm:pb-16"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "none" : "translate3d(0,1rem,0)",
        transition: "opacity .55s ease, transform .55s cubic-bezier(.16,1,.3,1)",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      {/*
        Absolutely positioned children resolve `inset-x-0` against the
        containing block's PADDING box, which cancels the page gutter, so it is
        reapplied here.
      */}
      <div className="shell">{children}</div>
    </div>
  );
}

export function BulletTimeSection({ d }: { d: Dictionary }) {
  const { bullets, bulletTime } = d;
  const { stage, barRef, items } = useScrollDriven(bullets.length);

  return (
    <section id="bullet-time" className="relative h-[460svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-end overflow-hidden">
        {/*
          The problem log. This is the point of the section: each line is
          something that actually breaks products in the field.
        */}
        {/* Scrim for the log — the clip has a blown-out window reflection there. */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34rem] bg-gradient-to-l from-ink via-ink/75 to-transparent lg:block"
          aria-hidden="true"
        />

        <ul className="absolute right-[var(--gutter)] top-1/2 hidden w-[19rem] -translate-y-1/2 space-y-3.5 lg:block">
          {bullets.map((b, i) => (
            <li
              key={b.label}
              ref={(el) => { items.current[i] = el; }}
              style={{ opacity: 0, transition: "opacity .4s ease, transform .4s cubic-bezier(.16,1,.3,1)" }}
            >
              <div className="flex items-center gap-2">
                <span className="h-px w-5 bg-mx/60" />
                <span className="font-mono text-[11px] tracking-[0.2em] text-mx glow-soft">
                  {b.label}
                </span>
              </div>
              <p className="mt-1 pl-7 font-mono text-[10px] leading-snug text-text-dim">
                {b.detail}
              </p>
            </li>
          ))}
        </ul>

        {/* Progress rail — reads as an instrument, and says the pin ends. */}
        <div className="absolute left-[var(--gutter)] top-1/2 hidden h-40 w-px -translate-y-1/2 bg-line md:block">
          <span
            ref={barRef}
            className="absolute inset-x-0 top-0 h-full origin-top bg-mx"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        {/*
          Scrim. The copy sits over a shot whose brightness is not under the
          layout's control, so readability cannot be left to chance.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[62svh] bg-gradient-to-t from-ink via-ink/88 to-transparent"
          aria-hidden="true"
        />

        <div className="relative h-[52svh] sm:h-[42svh]">
          <Panel show={stage === 0}>
            <p className="eyebrow">{bulletTime.eyebrow}</p>
            <h2 className="mt-4 max-w-2xl text-[clamp(1.75rem,4.2vw,3rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              {bulletTime.title}
            </h2>
          </Panel>

          <Panel show={stage === 1}>
            <p className="eyebrow">{bulletTime.incoming}</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-text-dim sm:text-lg">
              {bulletTime.body}
            </p>
          </Panel>

          <Panel show={stage === 2}>
            <p className="eyebrow">{bulletTime.resolved}</p>
            <p className="mt-4 max-w-xl text-[clamp(1.25rem,3vw,2rem)] font-medium leading-snug text-text">
              {bulletTime.outro}
            </p>
          </Panel>
        </div>
      </div>
    </section>
  );
}
