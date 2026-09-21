"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

import type { BootLine } from "@/i18n";

type Line = BootLine;

/**
 * Types a boot sequence out line by line.
 *
 * With reduced motion the whole sequence renders at once — there is no typing
 * state to run, so that case is derived rather than driven through an effect.
 */
export function Terminal({
  lines,
  className = "",
  onDone,
}: {
  lines: readonly Line[];
  className?: string;
  onDone?: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [typed, setTyped] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [finished, setFinished] = useState(false);

  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (reduced) {
      doneRef.current?.();
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => timers.push(setTimeout(res, ms)));

    (async () => {
      for (const line of lines) {
        if (cancelled) return;
        await wait(line.delay);
        for (let i = 1; i <= line.text.length; i++) {
          if (cancelled) return;
          setCurrent(line.text.slice(0, i));
          // Punctuation gets a beat, which is what makes typing feel human.
          const ch = line.text[i - 1];
          await wait(ch === "." || ch === "," ? 90 : 16 + Math.random() * 22);
        }
        if (cancelled) return;
        setTyped((d) => [...d, line.text]);
        setCurrent("");
      }
      if (cancelled) return;
      setFinished(true);
      doneRef.current?.();
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [lines, reduced]);

  const shown = reduced ? lines.map((l) => l.text) : typed;
  const showCaret = !reduced && !finished;
  const toneOf = (text: string) => lines.find((l) => l.text === text)?.tone;

  return (
    <div
      className={`font-mono text-[13px] leading-[1.9] sm:text-sm ${className}`}
      role="status"
      aria-live="polite"
    >
      {shown.map((text, i) => (
        <p
          key={i}
          className={
            toneOf(text) === "accent"
              ? "text-mx glow"
              : toneOf(text) === "ok"
                ? "text-mx-soft"
                : "text-text-dim"
          }
        >
          {text || " "}
        </p>
      ))}
      {showCaret && (
        <p className="text-text-dim">
          {current}
          <span className="caret ml-0.5 align-baseline" />
        </p>
      )}
    </div>
  );
}
