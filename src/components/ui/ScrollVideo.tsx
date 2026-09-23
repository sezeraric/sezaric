"use client";

import { useEffect, useRef, useState } from "react";
import { scroll } from "@/lib/scroll";
import { backdropPresence } from "@/lib/curves";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * A video scrubbed by scroll position rather than played.
 *
 * Scroll is time: the section's progress maps straight onto currentTime, so
 * scrolling back rewinds. Three things make this behave:
 *
 *  - The source is re-encoded with every frame a keyframe (see scripts/
 *    encode-scrub.sh). Seeking a normally-encoded MP4 lands on the nearest
 *    keyframe and the picture visibly snaps.
 *  - currentTime is eased toward the target instead of being assigned raw, so
 *    a flung scroll does not turn into a stutter of seek requests.
 *  - Seeks are skipped while one is already in flight, which is what keeps
 *    Safari from falling behind.
 *
 * If the file cannot load, or the visitor asked for reduced motion, nothing is
 * rendered and whatever sits behind it stays visible.
 */
/** The bullet-time shot: the default the component was written for. */
const bulletTimeProgress = () => scroll.bulletTime;
const bulletTimeActive = () => backdropPresence(scroll.bulletEntry, scroll.bulletTime) > 0;

export function ScrollVideo({
  src,
  poster,
  className = "",
  onReady,
  progress = bulletTimeProgress,
  active = bulletTimeActive,
}: {
  src: string;
  poster?: string;
  className?: string;
  onReady?: (ready: boolean) => void;
  /** 0..1, read every frame: where in the clip the scroll is. */
  progress?: () => number;
  /** Whether the clip is on screen at all; nothing is decoded while it is not. */
  active?: () => boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const reduced = usePrefersReducedMotion();
  const readyRef = useRef(onReady);
  const progressRef = useRef(progress);
  const activeRef = useRef(active);
  useEffect(() => {
    readyRef.current = onReady;
    progressRef.current = progress;
    activeRef.current = active;
  }, [onReady, progress, active]);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;

    let raf = 0;
    let current = 0;
    let seeking = false;
    let duration = 0;

    const onMeta = () => {
      duration = video.duration || 0;
      readyRef.current?.(true);
      prime();
    };

    /*
     * Mobile browsers will not paint a frame from a video that has never
     * played: seeking a freshly-loaded element leaves it showing the poster.
     * A muted, inline play immediately followed by pause decodes the first
     * frame and unblocks every seek after it. It is allowed without a gesture
     * precisely because the element is muted and playsInline.
     */
    const prime = () => {
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.then(() => video.pause()).catch(() => {
          // Blocked by policy: scrubbing still works wherever seeking paints.
        });
      } else {
        video.pause();
      }
    };
    const onSeeked = () => { seeking = false; };
    const onError = () => { setFailed(true); readyRef.current?.(false); };

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    // Some mobile browsers ignore preload="auto" until asked explicitly.
    if (video.readyState === 0) video.load();
    else onMeta();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!duration) return;

      /*
       * The shot is only on screen for one section of the page. Seeking while
       * it is hidden is a decode nobody can see, and on a phone that decode
       * competes with the scroll itself — which is exactly when it hurts.
       */
      if (!activeRef.current()) return;

      // A little headroom at each end so the first and last frames hold.
      const p = Math.min(Math.max(progressRef.current(), 0), 1);
      const target = p * duration * 0.999;

      current += (target - current) * 0.18;
      if (Math.abs(target - current) < 0.004) current = target;

      if (!seeking && Math.abs(video.currentTime - current) > 1 / 60) {
        seeking = true;
        video.currentTime = current;
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
  }, [reduced, src]);

  if (failed || reduced) return null;

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      preload="auto"
      muted
      playsInline
      // Decorative: the section's meaning is carried by the copy beside it.
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
