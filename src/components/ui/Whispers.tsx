"use client";

import { useEffect, useRef } from "react";
import { scroll } from "@/lib/scroll";

/**
 * The Matrix, talking back.
 *
 * - Leave the tab and its title calls you back.
 * - Sit still long enough and a small terminal in the corner knocks, the way
 *   it does on Neo's screen — once per visit, and it goes away the moment you
 *   move.
 * - Type "neo" anywhere and the rain behind the page surges.
 *
 * All of it is quiet by default and none of it blocks anything: the terminal
 * is a polite live region, pointer-events off, and reduced motion keeps the
 * words but drops the typing.
 */

const IDLE_AFTER = 26; // seconds
const TYPE = 0.045; // seconds per character
const HOLD = 4.5;

type Lines = { away: string; idle: readonly string[]; idleTouch: readonly string[]; neo: string };

export function Whispers({ lines }: { lines: Lines }) {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = box.current;
    const out = text.current;
    if (!el || !out) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = !window.matchMedia("(pointer: fine)").matches;

    // --- the tab calls you back ----------------------------------------
    let title = document.title;
    const onVisibility = () => {
      if (document.hidden) {
        title = document.title;
        document.title = lines.away;
      } else {
        document.title = title;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // --- the corner terminal -------------------------------------------
    let queue: string[] = [];
    let current = "";
    let shown = 0;
    let lineAt = 0;
    let raf = 0;
    let open = false;
    let written: string[] = [];

    const render = (caret: boolean) => {
      out.textContent = [...written, current.slice(0, shown)].join("\n") + (caret ? "▌" : "");
    };
    const close = () => {
      if (!open) return;
      open = false;
      el.dataset.open = "false";
      cancelAnimationFrame(raf);
    };
    const tick = (ms: number) => {
      const now = ms / 1000;
      const want = reduced ? current.length : Math.floor((now - lineAt) / TYPE);
      if (shown < current.length) {
        shown = Math.min(current.length, want);
        render(true);
      } else if (queue.length) {
        if (now - lineAt > current.length * TYPE + 0.6) {
          written.push(current);
          current = queue.shift()!;
          shown = 0;
          lineAt = now;
        }
        render(Math.floor(now * 2) % 2 === 0);
      } else {
        render(Math.floor(now * 2) % 2 === 0);
        if (now - lineAt > current.length * TYPE + HOLD) return close();
      }
      raf = requestAnimationFrame(tick);
    };
    const say = (all: readonly string[]) => {
      cancelAnimationFrame(raf);
      written = [];
      queue = all.slice(1);
      current = all[0] ?? "";
      shown = 0;
      lineAt = performance.now() / 1000;
      open = true;
      el.dataset.open = "true";
      raf = requestAnimationFrame(tick);
    };

    // Knock once per visit, after a real stretch of stillness.
    let knocked = false;
    let idleTimer = 0;
    const arm = () => {
      window.clearTimeout(idleTimer);
      if (knocked) return;
      idleTimer = window.setTimeout(() => {
        if (document.hidden) return arm();
        knocked = true;
        say(touch ? lines.idleTouch : lines.idle);
      }, IDLE_AFTER * 1000);
    };
    const onActivity = () => {
      arm();
      // Moving on dismisses the knock, but not the answer to "neo".
      if (open && el.dataset.kind !== "neo" && performance.now() / 1000 - lineAt > 1.2) close();
    };
    arm();

    // --- "neo" -----------------------------------------------------------
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      onActivity();
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))) return;
      if (e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-3);
      if (typed === "neo") {
        typed = "";
        scroll.surge = performance.now();
        el.dataset.kind = "neo";
        say([lines.neo]);
      }
    };

    const events = ["pointermove", "pointerdown", "wheel", "touchstart", "scroll"] as const;
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      window.removeEventListener("keydown", onKey);
    };
  }, [lines]);

  return (
    <div ref={box} className="whisper" data-open="false" role="status" aria-live="polite">
      <span className="whisper-dot" aria-hidden="true" />
      <span ref={text} className="whisper-text" />
    </div>
  );
}
