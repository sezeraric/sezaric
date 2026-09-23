"use client";

import { useEffect, useRef, useState } from "react";
import { scroll } from "@/lib/scroll";
import { figurePresence, revealMove, weaveProgress } from "@/lib/curves";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useIsNarrow } from "@/lib/useViewport";
import { ScrollVideo } from "./ui/ScrollVideo";

/**
 * The woven figure: green threads stream in and build a wireframe of him feet
 * first while the experience section is read, and the reveal section after it
 * turns the wireframe into the photograph.
 *
 * It is one clip (public/weave.mp4, made in Higgsfield from the same frame the
 * 3D scan was built from), scrubbed by scroll like the bullet-time shot. It
 * stands fixed while the page slides over it — at the bottom of the screen on
 * a phone, beside the copy on a wide one — and walks to the centre for the
 * reveal.
 *
 * The clip is on pure black and is drawn with `lighten`, so its background
 * simply disappears into the page instead of showing as a rectangle; the rain
 * steps out of the way while it is on screen (see Scene) so nothing shows
 * through the coat.
 */

const DESKTOP_SRC = "/weave.mp4";
const MOBILE_SRC = "/weave-mobile.mp4";
const POSTER = "/weave-poster.jpg";
/** The finished picture, for reduced motion: no scrubbing, just him. */
const STILL = "/weave-last.jpg";

const progress = () => weaveProgress(scroll.expProgress, scroll.becoming);
const active = () => figurePresence(scroll.expEntry, scroll.becomingExit) > 0;

export default function WeaveLayer() {
  const frame = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const narrow = useIsNarrow();
  // A few megabytes most visits never reach: only fetched once the
  // experience section is within a few screens.
  const [near, setNear] = useState(false);

  useEffect(() => {
    let raf = 0;
    let lastOpacity = -1;
    let lastX = Number.NaN;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!near && scroll.expNear > 0) setNear(true);

      const el = frame.current;
      if (!el) return;

      const presence = figurePresence(scroll.expEntry, scroll.becomingExit);
      if (presence !== lastOpacity) {
        lastOpacity = presence;
        el.style.opacity = String(presence);
        // Out of the layer tree entirely when it is not on screen.
        el.style.visibility = presence > 0 ? "visible" : "hidden";
      }

      // Beside the copy while it is being built, centre stage for the reveal.
      // A phone already has it centred.
      const x = narrow ? 0 : 1 - revealMove(scroll.becoming);
      if (x !== lastX) {
        lastX = x;
        el.style.setProperty("--weave-shift", String(x));
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [near, narrow]);

  return (
    <div
      ref={frame}
      className="weave pointer-events-none absolute inset-0"
      style={{ opacity: 0, visibility: "hidden" }}
      aria-hidden="true"
    >
      <div className="weave-clip">
        {near &&
          (reduced ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={STILL} alt="" className="h-full w-full object-contain" />
          ) : (
            <ScrollVideo
              key={narrow ? "m" : "d"}
              src={narrow ? MOBILE_SRC : DESKTOP_SRC}
              poster={POSTER}
              progress={progress}
              active={active}
              className="h-full w-full object-contain"
            />
          ))}
      </div>
    </div>
  );
}
