"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { scroll } from "@/lib/scroll";
import { phase } from "@/lib/curves";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { useIsNarrow } from "@/lib/useViewport";
import { ScrollVideo } from "./ui/ScrollVideo";
import { SceneBoundary } from "./SceneBoundary";

/**
 * Everything behind the page, in one fixed layer.
 *
 * Order matters and is expressed by DOM order rather than z-index: the video
 * paints first, the WebGL rain paints over it. Both live inside a single
 * `-z-10` container so the page content sits above the pair without either of
 * them needing a stacking context of its own.
 *
 * The whole layer is decorative — aria-hidden, no pointer events — and the page
 * reads correctly if neither the video nor WebGL ever arrives.
 */

const SceneCanvas = dynamic(() => import("./scene/SceneCanvas"), { ssr: false });

const DESKTOP_SRC = "/bullet-time.mp4";
const MOBILE_SRC = "/bullet-time-mobile.mp4";
const POSTER = "/bullet-time-poster.jpg";

export default function BackdropLayer() {
  const shotRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  // A 2 MB clip is not worth pushing at a phone when the 860 KB one is
  // indistinguishable at that size.
  const src = useIsNarrow() ? MOBILE_SRC : DESKTOP_SRC;

  // Fade the shot in and out at the edges of its section, off the main thread's
  // React work — this runs every frame and must never re-render.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = shotRef.current;
      if (el) el.style.opacity = String(phase(scroll.bulletTime).presence);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <div ref={shotRef} className="absolute inset-0" style={{ opacity: 0 }}>
        {reduced ? (
          // Reduced motion: hold a single frame rather than scrubbing.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={POSTER} alt="" className="h-full w-full object-cover" />
        ) : (
          <ScrollVideo
            src={src}
            poster={POSTER}
            className="h-full w-full object-cover"
          />
        )}
        {/* Sits the clip back into the page's blacks. */}
        <div className="absolute inset-0 bg-ink/45" />
      </div>

      <SceneBoundary>
        <SceneCanvas />
      </SceneBoundary>
    </div>
  );
}
