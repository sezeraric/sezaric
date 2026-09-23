"use client";

import { useEffect, useRef } from "react";
import { scroll } from "@/lib/scroll";
import { RabbitGlyph } from "./WhiteRabbit";

/**
 * The white rabbit, following you down the page.
 *
 * "Follow the white rabbit" used to point at a rabbit that sat still in the
 * terminal. This one keeps going: while you scroll it bounds left and right
 * along the bottom of the screen, and when you stop it ducks under the edge
 * and puts its head up to look at you — ears twitching, blinking, eyes on your
 * pointer. Scroll again and it drops out of sight and carries on hopping.
 *
 * Try to catch it and it plays along: "you caught me — oops, the code isn't
 * running right", then the one you caught glitches out of existence and the
 * real one puts its head in from the top-left corner with a line from the
 * film. It was never the rabbit you were holding.
 *
 * It keeps out of the way of the two cinematic moments (the bullet-time shot
 * and the pinned experience stage) and goes home once the contact section,
 * where it is waiting, comes into view. Everything runs from one frame loop
 * writing transforms; nothing here re-renders.
 */

type Mode =
  | "gone"
  | "hop"
  | "dive"
  | "rise"
  | "peek"
  | "duck"
  // Caught:
  | "caught"
  | "vanish"
  | "cameoIn"
  | "cameoTalk"
  | "cameoOut"
  | "rest";

const HOP = 0.52; // seconds per hop
const DIVE = 0.26;
const RISE = 0.5;
const DUCK = 0.2;
/** How long the page has to be still before the rabbit counts it as a stop. */
const STILL = 0.22;

const TYPE = 0.032; // seconds per typed character in a speech bubble
const CAUGHT_HOLD = 1.3;
const VANISH = 0.9;
const CAMEO_IN = 0.55;
const CAMEO_HOLD = 3;
const CAMEO_OUT = 0.4;
const REST = 1.4;

const clamp = (n: number, a: number, b: number) => (n < a ? a : n > b ? b : n);
const easeOutBack = (t: number) => {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeIn = (t: number) => t * t;

/** The rabbit face on, peeking over the bottom edge of the screen. */
function RabbitFace() {
  return (
    <svg viewBox="0 0 100 120" className="h-full w-full" aria-hidden="true">
      <g className="rabbit-peek-ear-l">
        <ellipse cx="36" cy="36" rx="9" ry="30" transform="rotate(-12 36 36)" fill="#f4f7f5" />
        <ellipse cx="36.5" cy="39" rx="3.8" ry="20" transform="rotate(-12 36.5 39)" fill="#f1c7d1" opacity="0.7" />
      </g>
      <g className="rabbit-ear">
        <ellipse cx="64" cy="33" rx="9" ry="32" transform="rotate(9 64 33)" fill="#f4f7f5" />
        <ellipse cx="63.6" cy="36" rx="3.8" ry="21" transform="rotate(9 63.6 36)" fill="#f1c7d1" opacity="0.7" />
      </g>
      <ellipse cx="50" cy="84" rx="32" ry="28" fill="#f4f7f5" />
      <ellipse cx="34" cy="95" rx="12" ry="9" fill="#ffffff" />
      <ellipse cx="66" cy="95" rx="12" ry="9" fill="#ffffff" />
      <g className="rabbit-eyes">
        <g className="rabbit-pupils">
          <ellipse cx="39" cy="80" rx="4.3" ry="5.4" fill="#0b1510" />
          <ellipse cx="61" cy="80" rx="4.3" ry="5.4" fill="#0b1510" />
          <circle cx="40.6" cy="78" r="1.4" fill="#ffffff" />
          <circle cx="62.6" cy="78" r="1.4" fill="#ffffff" />
        </g>
      </g>
      <path d="M46.5 89.5 Q50 87.6 53.5 89.5 Q51.6 93 50 93 Q48.4 93 46.5 89.5Z" fill="#e6a1b2" />
      <path d="M50 93 Q47.4 97 44.8 96 M50 93 Q52.6 97 55.2 96" stroke="#c9aab3" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <g stroke="#d3dcd6" strokeWidth="0.8" strokeLinecap="round" opacity="0.8">
        <line x1="40" y1="92.5" x2="21" y2="89" />
        <line x1="40" y1="95" x2="20" y2="97.5" />
        <line x1="60" y1="92.5" x2="79" y2="89" />
        <line x1="60" y1="95" x2="80" y2="97.5" />
      </g>
      {/* Paws on the edge of the screen. */}
      <ellipse cx="37" cy="112" rx="8.5" ry="6.5" fill="#f4f7f5" />
      <ellipse cx="63" cy="112" rx="8.5" ry="6.5" fill="#f4f7f5" />
      <g stroke="#dfe6e1" strokeWidth="0.9" strokeLinecap="round">
        <line x1="34" y1="109" x2="34" y2="113" />
        <line x1="37" y1="108.5" x2="37" y2="113" />
        <line x1="40" y1="109" x2="40" y2="113" />
        <line x1="60" y1="109" x2="60" y2="113" />
        <line x1="63" y1="108.5" x2="63" y2="113" />
        <line x1="66" y1="109" x2="66" y2="113" />
      </g>
    </svg>
  );
}

export function RabbitGuide({
  label,
  caught,
  cameo,
}: {
  label: string;
  /** What the caught rabbit says. */
  caught: string;
  /** Lines the real rabbit says from the corner, in turn. */
  cameo: readonly string[];
}) {
  const hopper = useRef<HTMLButtonElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const cameoEl = useRef<HTMLDivElement>(null);
  /** Set by a tap; read by the frame loop. */
  const tapped = useRef(false);
  const lines = useRef({ caught, cameo });
  useEffect(() => {
    lines.current = { caught, cameo };
  }, [caught, cameo]);
  const body = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const peeker = useRef<HTMLButtonElement>(null);
  const pupils = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hop = hopper.current;
    const bod = body.current;
    const sh = shadow.current;
    const pk = peeker.current;
    const bub = bubble.current;
    const cam = cameoEl.current;
    if (!hop || !bod || !sh || !pk || !bub || !cam) return;
    pupils.current = pk.querySelector(".rabbit-pupils");

    // Home, once the contact section — where it is waiting — is on screen.
    let home = false;
    const contact = document.getElementById("contact");
    const io = contact
      ? new IntersectionObserver(([e]) => (home = e.isIntersecting), { threshold: 0.15 })
      : null;
    if (contact && io) io.observe(contact);

    // Eyes follow the pointer, where there is one.
    let lookX = 0;
    let lookY = 0;
    const onPointer = (e: PointerEvent) => {
      const r = pk.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.4);
      const d = Math.max(1, Math.hypot(dx, dy));
      lookX = (dx / d) * 1.8;
      lookY = (dy / d) * 1.4;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let mode: Mode = "gone";
    let modeAt = 0;
    let next: "hop" | "gone" | "rise" = "gone";
    let x = 0.84; // 0..1 across the screen
    let fromX = x;
    let toX = x;
    let dirX = -1;
    let fromBelow = false;
    let lastY = scroll.y;
    let lastMove = -10;
    let raf = 0;

    const size = () => (window.innerWidth < 768 ? 46 : 58);
    const floor = () => (window.innerWidth < 768 ? 22 : 26);

    const set = (m: Mode, now: number) => {
      mode = m;
      modeAt = now;
    };

    const planHop = () => {
      fromX = x;
      const step = 0.2 + Math.random() * 0.12;
      let target = x + dirX * step;
      if (target < 0.08 || target > 0.92) {
        dirX = -dirX;
        target = x + dirX * step;
      }
      toX = clamp(target, 0.08, 0.92);
    };

    const placeHopper = (px: number, lift: number, t: number, face: number, visible: boolean) => {
      const s = size();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const left = px * vw - s / 2;
      const top = vh - floor() - s - lift;
      hop.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
      hop.style.opacity = visible ? "1" : "0";
      // Catchable while it is on screen, and never an invisible tap target.
      hop.style.pointerEvents = visible ? "auto" : "none";
      // Stretch in the air, squash on the ground; nose up rising, down falling.
      const air = Math.sin(Math.PI * clamp(t, 0, 1));
      const sy = 1 + 0.16 * air - (t > 0.9 ? 0.18 * ((t - 0.9) / 0.1) : 0);
      const sx = 1 / Math.sqrt(Math.max(0.6, sy));
      const tilt = (0.5 - t) * 26 * face;
      bod.style.transform = `scale(${(sx * face).toFixed(3)}, ${sy.toFixed(3)}) rotate(${tilt.toFixed(1)}deg)`;
      const shadowScale = 1 - 0.6 * air;
      sh.style.transform = `translate3d(${(px * vw - s * 0.4).toFixed(1)}px, ${(vh - floor() - 5).toFixed(1)}px, 0) scale(${shadowScale.toFixed(3)}, 1)`;
      sh.style.opacity = visible ? (0.55 * shadowScale).toFixed(3) : "0";
    };

    const placePeeker = (hidden: number) => {
      const w = window.innerWidth < 768 ? 62 : 78;
      pk.style.width = `${w}px`;
      pk.style.height = `${w * 1.2}px`;
      pk.style.left = `${(x * window.innerWidth - w / 2).toFixed(1)}px`;
      // 7% is the part of the paws that hangs below the edge even when peeking.
      pk.style.transform = `translate3d(0, ${(7 + hidden * 100).toFixed(1)}%, 0)`;
      pk.style.visibility = hidden >= 0.999 ? "hidden" : "visible";
      pk.tabIndex = mode === "peek" ? 0 : -1;
    };

    // --- speech bubble ---------------------------------------------------
    let bubbleText = "";
    let bubbleAt = 0;
    let bubbleAnchor = { x: 0, y: 0, side: "above" as "above" | "right" };
    let cameoLine = 0;
    let caughtEl: HTMLElement | null = null;

    const say = (text: string, now: number, anchor: typeof bubbleAnchor) => {
      bubbleText = text;
      bubbleAt = now;
      bubbleAnchor = anchor;
      bub.classList.remove("is-fading");
      bub.dataset.side = anchor.side;
      bub.style.visibility = "visible";
    };
    const hush = () => bub.classList.add("is-fading");
    const drawBubble = (now: number) => {
      if (!bubbleText) return;
      const shown = Math.min(bubbleText.length, Math.floor((now - bubbleAt) / TYPE));
      const typing = shown < bubbleText.length;
      const content = bubbleText.slice(0, shown) + (typing ? "▌" : "");
      if (bub.textContent !== content) bub.textContent = content;
      const w = bub.offsetWidth;
      const h = bub.offsetHeight;
      const vw = window.innerWidth;
      let left: number;
      let top: number;
      if (bubbleAnchor.side === "above") {
        left = clamp(bubbleAnchor.x - w / 2, 12, vw - w - 12);
        top = bubbleAnchor.y - h - 14;
      } else {
        left = Math.min(bubbleAnchor.x + 12, vw - w - 12);
        top = bubbleAnchor.y - h * 0.3;
      }
      bub.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
      // Point the tail at the rabbit, wherever the bubble ended up.
      bub.style.setProperty("--tail", `${clamp(bubbleAnchor.x - left, 14, w - 14).toFixed(1)}px`);
    };
    const typedFor = (text: string) => text.length * TYPE;

    const placeCameo = (shown: number) => {
      // Leans in from behind the left edge: about three quarters of the head
      // shows, the rest stays behind the edge of the screen.
      cam.style.transform = `translate3d(${(-100 + 78 * shown).toFixed(1)}%, 0, 0)`;
      cam.style.visibility = shown <= 0.001 ? "hidden" : "visible";
    };

    const catchIt = (now: number) => {
      const fromPeek = mode === "peek" || mode === "rise";
      caughtEl = fromPeek ? pk : hop;
      const r = caughtEl.getBoundingClientRect();
      caughtEl.classList.add("is-caught");
      say(lines.current.caught, now, { x: r.left + r.width / 2, y: r.top + (fromPeek ? r.height * 0.1 : 0), side: "above" });
      set("caught", now);
    };

    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop);
      const now = ms / 1000;
      drawBubble(now);

      if (tapped.current) {
        tapped.current = false;
        if (mode === "peek" || mode === "rise" || mode === "hop" || mode === "dive") catchIt(now);
      }

      const y = scroll.y;
      if (Math.abs(y - lastY) > 0.5) lastMove = now;
      lastY = y;
      const scrolling = now - lastMove < STILL;
      const allowed =
        !document.hidden && scroll.bulletTime >= 0.999 && !scroll.stageActive && !home;

      const age = now - modeAt;

      switch (mode) {
        case "gone":
          placeHopper(x, -80, 0, dirX, false);
          placePeeker(1);
          if (allowed) {
            if (scrolling) {
              fromBelow = true;
              planHop();
              set("hop", now);
            } else {
              set("rise", now);
            }
          }
          break;

        case "rise": {
          const t = clamp(age / RISE, 0, 1);
          placePeeker(1 - easeOutBack(t));
          placeHopper(x, -80, 0, dirX, false);
          if (!allowed) {
            next = "gone";
            set("duck", now);
          } else if (scrolling) {
            next = "hop";
            set("duck", now);
          } else if (t >= 1) set("peek", now);
          break;
        }

        case "peek": {
          placePeeker(0);
          if (pupils.current) {
            pupils.current.style.transform = `translate(${lookX.toFixed(2)}px, ${lookY.toFixed(2)}px)`;
          }
          if (!allowed) {
            next = "gone";
            set("duck", now);
          } else if (scrolling) {
            next = "hop";
            set("duck", now);
          }
          break;
        }

        case "duck": {
          const t = clamp(age / DUCK, 0, 1);
          placePeeker(easeIn(t));
          if (t >= 1) {
            if (next === "hop" && allowed) {
              fromBelow = true;
              planHop();
              set("hop", now);
            } else {
              set("gone", now);
            }
          }
          break;
        }

        case "hop": {
          const t = clamp(age / HOP, 0, 1);
          const px = fromX + (toX - fromX) * t;
          // The first hop out of a peek leaps up from below the edge.
          const start = fromBelow ? -size() - floor() : 0;
          const base = start * (1 - t);
          const apex = window.innerWidth < 768 ? 64 : 88;
          const lift = base + apex * 4 * t * (1 - t);
          const face = toX >= fromX ? 1 : -1;
          placeHopper(px, lift, t, face, true);
          placePeeker(1);
          if (t >= 1) {
            x = toX;
            fromBelow = false;
            if (!allowed) {
              next = "gone";
              set("dive", now);
            } else if (scrolling) {
              planHop();
              set("hop", now);
            } else {
              next = "rise";
              set("dive", now);
            }
          }
          break;
        }

        case "dive": {
          const t = clamp(age / DIVE, 0, 1);
          // A quick hop down, under the edge of the screen.
          const lift = 30 * Math.sin(Math.PI * t * 0.6) - (size() + floor() + 10) * easeIn(t);
          placeHopper(x, lift, 0.5 + t * 0.5, dirX >= 0 ? 1 : -1, t < 0.98);
          if (t >= 1) set(next === "rise" && allowed ? "rise" : "gone", now);
          break;
        }

        // --- caught ---------------------------------------------------------
        // Frozen where it was grabbed, trembling, saying its line.
        case "caught":
          if (age >= typedFor(lines.current.caught) + CAUGHT_HOLD) {
            caughtEl?.classList.add("is-glitching");
            hush();
            set("vanish", now);
          }
          break;

        case "vanish":
          if (age >= VANISH) {
            if (caughtEl) {
              caughtEl.classList.remove("is-caught", "is-glitching");
              if (caughtEl === hop) placeHopper(x, -80, 0, dirX, false);
            }
            placePeeker(1);
            caughtEl = null;
            set("cameoIn", now);
          }
          break;

        case "cameoIn": {
          const t = clamp(age / CAMEO_IN, 0, 1);
          placeCameo(easeOutBack(t));
          if (t >= 1) {
            const all = lines.current.cameo;
            const text = all.length ? all[cameoLine % all.length] : "";
            cameoLine++;
            const r = cam.getBoundingClientRect();
            say(text, now, { x: r.right + 6, y: r.top + r.height * 0.62, side: "right" });
            set("cameoTalk", now);
          }
          break;
        }

        case "cameoTalk":
          if (age >= typedFor(bubbleText) + CAMEO_HOLD) {
            hush();
            set("cameoOut", now);
          }
          break;

        case "cameoOut": {
          const t = clamp(age / CAMEO_OUT, 0, 1);
          placeCameo(1 - easeIn(t));
          if (t >= 1) {
            bubbleText = "";
            bub.style.visibility = "hidden";
            set("rest", now);
          }
          break;
        }

        case "rest":
          if (age >= REST) set("gone", now);
          break;
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      io?.disconnect();
    };
  }, []);

  // Grabbing at it: pointerdown on the hopper, which is moving too fast for a
  // click to land reliably; a normal click (or Enter) on the peeking head.
  const grab = () => {
    tapped.current = true;
  };

  return (
    <div className="rabbit-guide pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <div ref={shadow} className="rabbit-guide-shadow" aria-hidden="true" />
      <button
        ref={hopper}
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onPointerDown={grab}
        className="rabbit-guide-hopper"
      >
        <div ref={body} className="h-full w-full">
          <RabbitGlyph className="h-full w-full" />
        </div>
      </button>
      <button
        ref={peeker}
        type="button"
        onClick={grab}
        tabIndex={-1}
        aria-label={label}
        className="rabbit-guide-peeker pointer-events-auto"
      >
        <RabbitFace />
      </button>
      {/* The real one, from the top-left corner. */}
      <div ref={cameoEl} className="rabbit-guide-cameo" aria-hidden="true">
        <RabbitFace />
      </div>
      <div ref={bubble} className="rabbit-bubble" role="status" aria-live="polite" />
    </div>
  );
}
