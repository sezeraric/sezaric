"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { SceneBoundary } from "@/components/SceneBoundary";
import type { ShowcaseState } from "@/components/scene/CaseStudyScene";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";
import { detect } from "@/lib/perf";
import { useIsClient } from "@/lib/useIsClient";

const CaseStudyScene = dynamic(
  () => import("@/components/scene/CaseStudyScene").then((m) => m.CaseStudyScene),
  { ssr: false },
);

export type Shot = { src: string; alt: string; caption: string };

/**
 * The shipped app on a phone, with the screen changing as you scroll, and the
 * 3D scan standing behind it.
 *
 * The static grid underneath is not a placeholder — it is the version served
 * whenever the 3D cannot or should not run: no WebGL, reduced motion, or a
 * failure inside the canvas. The screenshots are the content; the scene is a
 * way of presenting them, and it never gets to be the reason they are missing.
 */
export function CaseStudyShowcase({ shots, label }: { shots: Shot[]; label: string }) {
  const section = useRef<HTMLDivElement>(null);
  const state = useRef<ShowcaseState>({ progress: 0 });
  const [index, setIndex] = useState(0);
  const [near, setNear] = useState(false);
  const reduced = usePrefersReducedMotion();
  const isClient = useIsClient();
  const [caps] = useState(() => (typeof window === "undefined" ? null : detect()));
  const [webgl] = useState(() => {
    if (typeof document === "undefined") return false;
    try {
      return !!document.createElement("canvas").getContext("webgl2");
    } catch {
      return false;
    }
  });

  /*
   * Gated on isClient so the server and the first client render agree. Deciding
   * this from `window` during render instead would mean the server sends the
   * grid and the client immediately renders a canvas, which is a hydration
   * mismatch — React throws the tree away and the section goes blank.
   */
  const use3d = isClient && !reduced && webgl && caps !== null;

  // Only pay for the model and the textures once the section is close.
  useEffect(() => {
    const el = section.current;
    if (!el || !use3d) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "60% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [use3d]);

  // Scroll drives the scene through a ref, and the caption through a coarse
  // index, so this re-renders three times rather than once per frame.
  useEffect(() => {
    const el = section.current;
    if (!el || !use3d) return;
    let raf = 0;
    let last = -1;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const p = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;
      state.current.progress = p;

      const i = Math.min(Math.round(p * (shots.length - 1)), shots.length - 1);
      if (i !== last) {
        last = i;
        setIndex(i);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [use3d, shots.length]);

  if (!use3d) {
    return (
      <div>
        <p className="eyebrow">{label}</p>
        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
          {shots.map((shot) => (
            <li key={shot.src}>
              <figure className="h-full">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={720}
                  height={1566}
                  sizes="(max-width: 640px) 70vw, 20rem"
                  className="mx-auto w-[70%] rounded-xl border border-line sm:w-full"
                />
                <figcaption className="mt-3 text-center font-mono text-[11px] leading-relaxed text-text-faint sm:text-left">
                  {shot.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={section} className="relative h-[200svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center">
        <p className="eyebrow">{label}</p>

        <div className="relative mt-4 flex-1">
          {near && (
            <SceneBoundary>
              <Canvas
                dpr={caps?.dpr ?? [1, 2]}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                camera={{ fov: 34, position: [0, 0.15, 5.6], near: 0.1, far: 50 }}
                className="!absolute inset-0"
              >
                <CaseStudyScene shots={shots.map((s) => s.src)} stateRef={state} />
              </Canvas>
            </SceneBoundary>
          )}

          {/* The screenshots stay in the document for search and screen readers
              even though the visible copy of them is a texture on the canvas. */}
          <ul className="sr-only">
            {shots.map((shot) => (
              <li key={shot.src}>
                <Image src={shot.src} alt={shot.alt} width={720} height={1566} />
                <span>{shot.caption}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-16">
          {shots.map((shot, i) => (
            <p
              key={shot.src}
              className="absolute inset-x-0 max-w-sm font-mono text-[11px] leading-relaxed text-text-faint"
              style={{
                opacity: i === index ? 1 : 0,
                transition: "opacity .4s ease",
              }}
            >
              <span className="text-mx-dim">{String(i + 1).padStart(2, "0")}</span> {shot.caption}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
