"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { glyphAtlas, ATLAS_GRID } from "@/lib/glyphAtlas";

/**
 * Full-screen digital rain.
 *
 * Drawn as a clip-space quad: the vertex shader bypasses the projection matrix
 * entirely so this always covers the viewport no matter what the scene camera
 * is doing. Depth is off and renderOrder is far negative, so it is a backdrop
 * for the bullet-time scene rather than part of it.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Ignore model/view/projection: position is already clip space.
    gl_Position = vec4(position.xy, 0.999, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uAtlas;
  uniform vec2  uAtlasGrid;   // atlas columns, rows
  uniform vec2  uResolution;
  uniform float uTime;        // already time-dilated on the CPU
  uniform float uDensity;     // >1 = smaller cells = more columns
  uniform float uIntensity;   // global fade, keeps body copy readable
  uniform vec3  uColor;
  uniform vec3  uHeadColor;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    // y increasing downward, which is how rain reads.
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

    // Cells are a fixed pixel size, so density is resolution independent.
    float cellPx = 30.0 / uDensity;
    vec2 grid = max(uResolution / cellPx, vec2(1.0));
    vec2 gv = uv * grid;
    vec2 id = floor(gv);
    vec2 f  = fract(gv);

    // --- per-column motion -------------------------------------------------
    float speed  = mix(0.16, 0.55, hash11(id.x * 1.7));
    float offset = hash11(id.x * 5.3) * 30.0;
    float trail  = mix(0.18, 0.55, hash11(id.x * 9.1));

    // Head sweeps from above the screen to below it so trails enter cleanly.
    float head = fract(uTime * speed + offset) * (1.0 + trail) - trail;
    float cy   = id.y / grid.y;

    // Distance behind the head, in normalised screen heights.
    float d = head - cy;
    if (d < 0.0 || d > trail) {
      gl_FragColor = vec4(0.0);
      return;
    }

    float fade = pow(1.0 - d / trail, 1.45);

    // --- glyph -------------------------------------------------------------
    // Glyphs re-roll at a per-cell rate, which is the flicker in the film.
    float rate  = mix(3.0, 11.0, hash11(id.x * 2.9));
    float tick  = floor(uTime * rate + hash21(id) * 20.0);
    float gi    = floor(hash21(id + tick * 17.0) * (uAtlasGrid.x * uAtlasGrid.y));

    float col = mod(gi, uAtlasGrid.x);
    float row = floor(gi / uAtlasGrid.x);

    // CanvasTexture uploads flipped, so atlas row 0 lives at v = 1.
    vec2 auv = vec2(
      (col + f.x) / uAtlasGrid.x,
      (1.0 - row / uAtlasGrid.y) - f.y / uAtlasGrid.y
    );

    float mask = texture2D(uAtlas, auv).r;
    if (mask < 0.04) {
      gl_FragColor = vec4(0.0);
      return;
    }

    // --- colour ------------------------------------------------------------
    // The leading glyph burns near-white, the trail falls off to deep green.
    // GLSL smoothstep is undefined when edge0 > edge1, so invert rather than
    // swapping the edges.
    float isHead = 1.0 - smoothstep(0.0, 0.05, d);
    vec3  rgb = mix(uColor * fade, uHeadColor, isHead);

    // Columns sit at different brightnesses so the field has depth.
    rgb *= mix(0.7, 1.25, hash11(id.x * 13.7));

    float a = mask * clamp(fade + isHead * 0.9, 0.0, 1.0) * uIntensity;
    gl_FragColor = vec4(rgb * a, a);
  }
`;

export type RainHandle = {
  setIntensity: (v: number) => void;
  setTimeScale: (v: number) => void;
};

export function DigitalRain({
  density = 1,
  intensityRef,
  timeScaleRef,
}: {
  density?: number;
  /** Read every frame. 0 hides the rain, 1 is full strength. */
  intensityRef: React.RefObject<number>;
  /** Read every frame. 1 is normal speed, 0 freezes the field. */
  timeScaleRef: React.RefObject<number>;
}) {
  const size = useThree((s) => s.size);
  const dilated = useRef(0);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uAtlas: { value: glyphAtlas() },
        uAtlasGrid: { value: new THREE.Vector2(ATLAS_GRID.cols, ATLAS_GRID.rows) },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uDensity: { value: density },
        uIntensity: { value: 0 },
        uColor: { value: new THREE.Color("#00e844") },
        uHeadColor: { value: new THREE.Color("#c9ffd8") },
      },
    });
  }, [density]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    // Clamp delta so a backgrounded tab does not jump the field on return.
    const dt = Math.min(delta, 1 / 30);
    dilated.current += dt * (timeScaleRef.current ?? 1);
    u.uTime.value = dilated.current;
    u.uIntensity.value += ((intensityRef.current ?? 1) - u.uIntensity.value) * Math.min(1, dt * 6);
    u.uResolution.value.set(
      state.size.width * state.viewport.dpr,
      state.size.height * state.viewport.dpr,
    );
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1000} key={`${size.width}x${size.height}`}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
