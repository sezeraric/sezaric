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
 * Only the rain: the bullet-time shot itself is a scrubbed video behind this
 * canvas. The rain still reacts to the same scroll curves, so it slows as the
 * shot holds instead of drifting on obliviously.
 */
export function Scene({ caps }: { caps: Capabilities }) {
  const rainIntensityRef = useRef(0.95);
  const rainTimeScale = useRef(1);

  useFrame(() => {
    const p = scroll.bulletTime;
    const c = phase(p);
    rainTimeScale.current = c.timeScale;
    rainIntensityRef.current = rainIntensity(scroll.bulletEntry, p);

    // "neo": for a few seconds the rain comes up to full strength and runs
    // fast, wherever on the page you are, then settles back.
    const since = (performance.now() - scroll.surge) / 1000;
    if (since >= 0 && since < 4) {
      const k = since < 0.4 ? since / 0.4 : 1 - (since - 0.4) / 3.6;
      rainIntensityRef.current = Math.max(rainIntensityRef.current, 0.95 * k);
      rainTimeScale.current *= 1 + 1.8 * k;
    }
  });

  return (
    <DigitalRain
      density={caps.rainDensity}
      intensityRef={rainIntensityRef}
      timeScaleRef={rainTimeScale}
    />
  );
}
