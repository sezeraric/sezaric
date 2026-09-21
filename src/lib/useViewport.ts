"use client";

import { useSyncExternalStore } from "react";

const NARROW = "(max-width: 899px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(NARROW).matches;
/** The server assumes desktop; the client corrects it on hydration. */
const getServerSnapshot = () => false;

/**
 * Whether the viewport is phone-sized, read as an external store rather than
 * measured in an effect — same reasoning as usePrefersReducedMotion: a defined
 * server snapshot, no cascading render at mount, and it reacts to resizes.
 */
export function useIsNarrow(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
