"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { scroll } from "@/lib/scroll";
import { figurePresence, phase, rainIntensity } from "@/lib/curves";
import type { Capabilities } from "@/lib/perf";
import { DigitalRain } from "./DigitalRain";


/**
 * The live layer.
 *
 * Only the rain: the bullet-time shot and the woven figure are scrubbed videos
 * in the same backdrop layer. The rain still reacts to the same scroll curves,
 * so it slows as the shot holds instead of drifting on obliviously, and steps
 * back while the figure is on screen.
 */
export function Scene({ caps }: { caps: Capabilities }) {
  const rainIntensityRef = useRef(0.95);
  const rainTimeScale = useRef(1);

  useFrame(() => {
    const p = scroll.bulletTime;
    const c = phase(p);
    rainTimeScale.current = c.timeScale;
    // The figure's sections have no opaque layer over the backdrop, and the
    // clip is blended over the rain, so the rain all but leaves while the
    // figure is there — otherwise glyphs would show through the black coat.
    const figure = figurePresence(scroll.expEntry, scroll.becomingExit);
    rainIntensityRef.current = rainIntensity(scroll.bulletEntry, p) * (1 - 0.92 * figure);
  });

  return (
    <DigitalRain
      density={caps.rainDensity}
      intensityRef={rainIntensityRef}
      timeScaleRef={rainTimeScale}
    />
  );
}
