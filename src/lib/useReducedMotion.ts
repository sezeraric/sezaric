"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

/** Server renders the motion-on branch, which the client corrects on hydration. */
const getServerSnapshot = () => false;

/**
 * Reads the OS motion preference as an external store.
 *
 * useSyncExternalStore rather than an effect that calls setState: it gives a
 * defined server snapshot (so there is no hydration mismatch), reacts if the
 * preference changes mid-session, and avoids a cascading render at mount.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
