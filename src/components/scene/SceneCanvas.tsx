"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { detect, type Capabilities } from "@/lib/perf";
import { Scene } from "./Scene";

/**
 * The fixed WebGL backdrop.
 *
 * Everything readable lives in the DOM above this; the canvas is decoration and
 * is marked aria-hidden and pointer-events-none so it never interferes with
 * reading, selection, or keyboard navigation.
 */
export default function SceneCanvas() {
  // Client-only component, so there is no server render to mismatch against
  // and no reason to defer this to an effect.
  const [caps] = useState<Capabilities>(() => detect());
  const [failed, setFailed] = useState(false);

  /*
   * Kick react-use-measure, which R3F's <Canvas> uses to decide when to create
   * the renderer.
   *
   * That hook drops a measurement unless its "mounted" ref is already true, and
   * that ref is set in a passive effect — so the ResizeObserver's very first
   * callback can land first and be thrown away. The element never changes size
   * again, so no further callback ever arrives and the canvas stays at 0x0 with
   * no WebGL context at all. Re-dispatching resize on the next frames makes the
   * hook re-measure once it is definitely mounted.
   */
  useEffect(() => {
    let frame = 0;
    let ticks = 0;
    const kick = () => {
      window.dispatchEvent(new Event("resize"));
      if (++ticks < 3) frame = requestAnimationFrame(kick);
    };
    frame = requestAnimationFrame(kick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const aberration = useMemo(() => new THREE.Vector2(0.0006, 0.0009), []);

  if (failed) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      data-tier={caps.tier}
    >
      <Canvas
        dpr={caps.dpr}
        gl={{
          antialias: caps.tier === "high",
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 42, near: 0.1, far: 120, position: [0, 1.8, 8.4] }}
        onCreated={(state) => {
          const { gl } = state;
          if (process.env.NODE_ENV === "development") {
            // Handle for inspecting draw calls and scene graph from the console.
            (window as unknown as { __r3f?: unknown }).__r3f = state;
          }
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
        fallback={null}
        onError={() => setFailed(true)}
      >
        <Scene caps={caps} />

        {caps.postprocessing && !caps.reducedMotion && (
          <EffectComposer enableNormalPass={false}>
            <Bloom
              intensity={0.85}
              luminanceThreshold={0.22}
              luminanceSmoothing={0.35}
              mipmapBlur
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={aberration}
              radialModulation={false}
              modulationOffset={0}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
