"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true afterwards.
 *
 * Anything that depends on the browser — WebGL support, device capabilities —
 * must not change what is rendered until hydration has finished, or React
 * finds markup it did not produce and throws the whole tree away. Gating on
 * this keeps the server and the first client render identical.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
