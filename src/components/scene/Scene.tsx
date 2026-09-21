"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { scroll } from "@/lib/scroll";
import { phase, rainIntensity } from "@/lib/curves";
import type { Capabilities } from "@/lib/perf";
import { DigitalRain } from "./DigitalRain";

/**
 * The live layer.
 *
 * Only the rain now: the bullet-time shot itself is a scrubbed video behind
 * this canvas. The rain still reacts to the same scroll curves, so it slows as
 * the shot holds instead of drifting on obliviously.
 */
export function Scene({ caps }: { caps: Capabilities }) {
  const rainIntensityRef = useRef(0.95);
  const rainTimeScale = useRef(1);

  useFrame(() => {
    const p = scroll.bulletTime;
    const c = phase(p);
    rainTimeScale.current = c.timeScale;
    rainIntensityRef.current = rainIntensity(scroll.bulletEntry, p);
  });

  return (
    <DigitalRain
      density={caps.rainDensity}
      intensityRef={rainIntensityRef}
      timeScaleRef={rainTimeScale}
    />
  );
}
