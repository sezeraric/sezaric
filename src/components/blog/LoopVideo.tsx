"use client";

import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * A short, silent, seamlessly looping clip used as decoration.
 *
 * With reduced motion it renders the poster frame instead — the point of the
 * shot survives as a still, and nobody who asked for less movement gets a
 * looping video anyway.
 */
export function LoopVideo({
  src,
  poster,
  className = "",
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt="" aria-hidden="true" className={className} />;
  }

  return (
    <video
      src={src}
      poster={poster}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
