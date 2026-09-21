"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { scrollToElement } from "@/lib/smoothScroll";

type Kind = "blue" | "red";

/**
 * The choice.
 *
 * The pills are photographed renders composited with CSS 3D transforms — not
 * WebGL. The page already runs one WebGL context behind everything, and a
 * second one is exactly what was pushing phones past their memory budget and
 * making Safari kill the tab. This looks three-dimensional, tilts toward the
 * pointer and floats, and costs no GPU context at all, so it cannot take a
 * device down.
 *
 * Both pills are real buttons: choosing one answers, and the red one wakes the
 * page up and drops you into the bio.
 */
export function PillChoice({ d }: { d: Dictionary }) {
  const [choice, setChoice] = useState<Kind | null>(null);
  const [glitch, setGlitch] = useState(false);
  const reduced = usePrefersReducedMotion();

  const choose = useCallback(
    (kind: Kind) => {
      setChoice(kind);
      if (kind !== "red") return;

      if (!reduced) {
        setGlitch(true);
        window.setTimeout(() => setGlitch(false), 520);
      }
      // Down the rabbit hole: land on the bio once the flash has played.
      window.setTimeout(
        () => {
          const target = document.getElementById("whoami");
          if (target) scrollToElement(target, reduced);
        },
        reduced ? 0 : 650,
      );
    },
    [reduced],
  );

  const c = d.about;

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
        {c.choose.prompt}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8">
        <PillCard
          kind="blue"
          label={c.blue.pill}
          heading={c.blue.heading}
          body={c.blue.body}
          action={c.choose.takeBlue}
          state={choice === null ? "idle" : choice === "blue" ? "chosen" : "rejected"}
          onChoose={() => choose("blue")}
          reduced={reduced}
        />
        <PillCard
          kind="red"
          label={c.red.pill}
          heading={c.red.heading}
          body={c.red.body}
          action={c.choose.takeRed}
          state={choice === null ? "idle" : choice === "red" ? "chosen" : "rejected"}
          onChoose={() => choose("red")}
          reduced={reduced}
        />
      </div>

      {/* The answer. aria-live so a screen reader hears it too. */}
      <div className="mt-8 min-h-[3.5rem]" aria-live="polite">
        {choice && (
          <p
            className={`max-w-xl font-mono text-sm leading-relaxed ${
              choice === "red" ? "text-mx glow-soft" : "text-[#8fb4e3]"
            }`}
          >
            {choice === "red" ? c.choose.redResponse : c.choose.blueResponse}
            {choice === "blue" && (
              <button
                type="button"
                onClick={() => choose("red")}
                className="ml-3 whitespace-nowrap text-mx underline decoration-mx/40 underline-offset-4 transition-colors hover:decoration-mx"
              >
                {c.choose.tryOther} →
              </button>
            )}
          </p>
        )}
      </div>

      {glitch && <div className="glitch-flash" aria-hidden="true" />}
    </div>
  );
}

function PillCard({
  kind,
  label,
  heading,
  body,
  action,
  state,
  onChoose,
  reduced,
}: {
  kind: Kind;
  label: string;
  heading: string;
  body: string;
  action: string;
  state: "idle" | "chosen" | "rejected";
  onChoose: () => void;
  reduced: boolean;
}) {
  const tilt = useRef<HTMLDivElement>(null);

  // Tilt toward the pointer, written straight to the DOM so moving the mouse
  // never re-renders React. Touch devices get the float only.
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduced || e.pointerType !== "mouse" || !tilt.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.current.style.transform = `rotateY(${x * 28}deg) rotateX(${-y * 22}deg) translateZ(20px)`;
  };
  const onLeave = () => {
    if (tilt.current) tilt.current.style.transform = "";
  };

  const glow = kind === "red" ? "rgba(255, 46, 77, 0.55)" : "rgba(59, 130, 246, 0.55)";
  const ring =
    kind === "red"
      ? "hover:border-[#ff2e4d]/50 focus-visible:border-[#ff2e4d]/70"
      : "hover:border-[#3b82f6]/50 focus-visible:border-[#3b82f6]/70";

  return (
    <button
      type="button"
      onClick={onChoose}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-label={action}
      aria-pressed={state === "chosen"}
      className={`group relative flex h-full flex-col rounded-sm border border-line bg-surface/50 p-6 text-left backdrop-blur-sm transition-all duration-500 sm:p-8 ${ring} ${
        state === "rejected" ? "opacity-35 saturate-50" : ""
      } ${state === "chosen" ? "border-line-bright" : ""}`}
      style={{ perspective: "900px" }}
    >
      {/* The pill. perspective on the button, the transform on this layer. */}
      <div className="relative mx-auto flex h-36 w-full items-center justify-center sm:h-44">
        <div
          aria-hidden="true"
          className="absolute h-20 w-40 rounded-full blur-3xl transition-opacity duration-500"
          style={{
            background: glow,
            opacity: state === "chosen" ? 0.9 : state === "rejected" ? 0 : 0.35,
          }}
        />
        <div
          ref={tilt}
          className="relative transition-transform duration-300 ease-out"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className={reduced ? "" : kind === "red" ? "pill-float pill-float-b" : "pill-float"}
            style={{
              transform:
                state === "chosen" ? "scale(1.12)" : state === "rejected" ? "scale(0.8)" : undefined,
              transition: "transform .6s cubic-bezier(.16,1,.3,1)",
            }}
          >
            <Image
              src={`/pills/${kind}.png`}
              alt=""
              width={640}
              height={kind === "red" ? 516 : 607}
              sizes="(max-width: 640px) 60vw, 16rem"
              className="h-auto w-40 drop-shadow-[0_18px_28px_rgba(0,0,0,0.7)] sm:w-52"
              style={{ transform: kind === "blue" ? "scaleX(-1)" : undefined }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2.5">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: kind === "red" ? "#ff2e4d" : "#3b82f6" }}
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">
          {label}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-medium text-text sm:text-2xl">{heading}</h3>
      <p className="mt-3 leading-relaxed text-text-dim">{body}</p>
    </button>
  );
}
