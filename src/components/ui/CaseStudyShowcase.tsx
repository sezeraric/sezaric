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
/** Pre-rendered turns of the scan, in scroll order. */
const TURNS = ["/figure/turn-0.webp", "/figure/turn-1.webp", "/figure/turn-2.webp", "/figure/turn-3.webp"];

/**
 * The scan, for devices that do not get the 3D scene.
 *
 * Same model, rendered offline (see src/app/[locale]/figure-shots) to four
 * transparent frames of a slow turn. A phone gets the figure standing behind
 * the screenshots and turning as they scroll past it, which is what the canvas
 * does — without a second WebGL context, which is what made iOS kill the tab.
 */
function FigureTurn() {
  const host = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    // Nothing runs, and nothing is fetched, until the section is close.
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), {
      rootMargin: "40% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el || !near) return;
    let raf = 0;
    let last = -1;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const rect = el.getBoundingClientRect();
      // How far the column has travelled through the viewport, 0..1.
      const span = rect.height + window.innerHeight;
      const p = Math.min(Math.max((window.innerHeight - rect.top) / span, 0), 1);
      const i = Math.min(Math.floor(p * TURNS.length), TURNS.length - 1);
      if (i !== last) {
        last = i;
        setFrame(i);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [near]);

  return (
    <div
      ref={host}
      className="pointer-events-none absolute inset-0 flex justify-start sm:justify-center"
      aria-hidden="true"
    >
      {/* Narrow screens stand him to the left of the column so he is not
          simply hidden behind an opaque screenshot; wide ones have room for
          him to stand behind the row. */}
      <div className="sticky top-[18vh] -ml-6 h-[56vh] w-[46%] max-w-[13rem] sm:ml-0 sm:h-[62vh] sm:w-full sm:max-w-sm">
        {near &&
          TURNS.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={320}
              height={800}
              sizes="20rem"
              className="absolute inset-0 m-auto h-full w-auto transition-opacity duration-500"
              style={{ opacity: i === frame ? 0.75 : 0 }}
            />
          ))}
      </div>
    </div>
  );
}

export function CaseStudyShowcase({ shots, label }: { shots: Shot[]; label: string }) {
  const section = useRef<HTMLDivElement>(null);
  const state = useRef<ShowcaseState>({ progress: 0 });
  const [index, setIndex] = useState(0);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [crashed, setCrashed] = useState(false);
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
   *
   * Also gated on the high tier, which in practice means "not a phone". This
   * scene would be the page's SECOND WebGL context, on top of the backdrop,
   * a video and a 40k-triangle model. On iOS that combination pushes the tab
   * past its memory budget and Safari kills and reloads it — the site appears
   * to restart itself while you are reading. A phone gets the grid, which
   * carries the same information and costs nothing.
   */
  const use3d = isClient && !reduced && webgl && caps?.tier === "high" && !crashed;

  // Only pay for the model and the textures once the section is close.
  useEffect(() => {
    const el = section.current;
    if (!el || !use3d) return;
    const preload = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          preload.disconnect();
        }
      },
      { rootMargin: "60% 0px" },
    );
    preload.observe(el);

    // A mounted canvas keeps drawing forever unless told otherwise. Pausing
    // the frame loop while the section is off screen is most of the cost of
    // this scene on a page the visitor scrolls straight past.
    const onScreen = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { rootMargin: "10% 0px" },
    );
    onScreen.observe(el);

    return () => {
      preload.disconnect();
      onScreen.disconnect();
    };
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
      <div className="relative">
        <p className="eyebrow relative z-10">{label}</p>
        {!reduced && <FigureTurn />}
        <ul className="relative mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
          {shots.map((shot) => (
            <li key={shot.src}>
              <figure className="h-full">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={720}
                  height={1566}
                  sizes="(max-width: 640px) 70vw, 20rem"
                  className="ml-auto mr-0 w-[64%] rounded-xl border border-line bg-ink shadow-[0_0_40px_rgba(0,0,0,0.85)] sm:mx-auto sm:w-full"
                />
                <figcaption className="ml-auto mt-3 max-w-[64%] text-right font-mono text-[11px] leading-relaxed text-text-faint sm:max-w-none sm:text-left">
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
    <div ref={section} className="relative h-[300svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center">
        <p className="eyebrow">{label}</p>

        <div className="relative mt-4 flex-1">
          {near && (
            <SceneBoundary>
              <Canvas
                dpr={caps?.dpr ?? [1, 2]}
                frameloop={visible ? "always" : "never"}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                camera={{ fov: 34, position: [0, 0.15, 5.6], near: 0.1, far: 50 }}
                className="!absolute inset-0"
                onCreated={({ gl }) => {
                  gl.domElement.addEventListener(
                    "webglcontextlost",
                    (e) => {
                      // Losing the context here means the device is out of
                      // budget. Retrying would just lose it again, so hand the
                      // section back to the static grid for good.
                      e.preventDefault();
                      setCrashed(true);
                    },
                    { once: true },
                  );
                }}
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
