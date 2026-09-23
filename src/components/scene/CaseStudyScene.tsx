"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { RoundedBox, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { showcase } from "@/lib/curves";

/**
 * The case-study showcase: a phone whose screen changes as you scroll, with
 * the 3D figure standing behind it.
 *
 * The figure is a scan exported with positions only — no normals, no UVs, no
 * material — so normals are generated on load and the surface is described by
 * a fresnel rim rather than by a texture. That is also why it sits so well
 * next to a bright phone screen: it reads as an outline, not as an object
 * competing for attention.
 */

const MODEL = "/figure.glb";

/** Screenshot aspect (720 x 1566). */
const SCREEN_W = 0.9;
const SCREEN_H = SCREEN_W * (1566 / 720);

const screenVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const screenFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform float uMix;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec3 c = mix(texture2D(uA, vUv).rgb, texture2D(uB, vUv).rgb, uMix);
    // Pull the screenshots toward the page's palette so a bright white app UI
    // does not punch a hole in a very dark section.
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(c, vec3(0.05, 0.12, 0.08) + vec3(0.10, 0.85, 0.35) * l, 0.18);
    gl_FragColor = vec4(c * 0.92, uOpacity);
  }
`;

const figureVert = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const figureFrag = /* glsl */ `
  precision highp float;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3  uRim;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocal;

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec3 n = normalize(vNormalW);
    float facing = abs(dot(n, normalize(vViewDir)));
    float fresnel = pow(1.0 - facing, 3.0);

    vec3 base = vec3(0.02, 0.08, 0.04) * (0.3 + 0.7 * facing);
    float band = hash21(vec2(floor(vLocal.x * 24.0), floor(vLocal.y * 80.0 - uTime * 1.4)));
    base += vec3(0.05, 0.7, 0.2) * step(0.955, band) * 0.55;

    float a = clamp(0.22 + fresnel * 0.95, 0.0, 1.0) * uOpacity;
    gl_FragColor = vec4(base + uRim * fresnel, a);
  }
`;

const faceFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec4 c = texture2D(uMap, vUv);
    // Graded toward the section's green so the photograph belongs to the same
    // picture as the wireframe it is sitting on, rather than looking pasted.
    float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    vec3 tinted = mix(c.rgb, vec3(0.06, 0.14, 0.09) + vec3(0.35, 1.0, 0.55) * l, 0.30);
    gl_FragColor = vec4(tinted, c.a * uOpacity);
  }
`;

export type ShowcaseState = {
  /** 0..1 through the showcase section. */
  progress: number;
};

function Figure({
  stateRef,
  spread,
}: {
  stateRef: React.RefObject<ShowcaseState>;
  spread: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { nodes } = useGLTF(MODEL);

  const geometry = useMemo(() => {
    const mesh = Object.values(nodes).find(
      (n): n is THREE.Mesh => (n as THREE.Mesh).isMesh === true,
    );
    if (!mesh) return new THREE.BoxGeometry(0.4, 2, 0.3);
    const g = mesh.geometry.clone();
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    return g;
  }, [nodes]);

  const head = useMemo(() => headOf(geometry), [geometry]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: figureVert,
        fragmentShader: figureFrag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uOpacity: { value: 0 },
          uTime: { value: 0 },
          uRim: { value: new THREE.Color("#35ff77") },
        },
      }),
    [],
  );

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const c = showcase(stateRef.current?.progress ?? 0, spread);
    const k = Math.min(1, dt * 6);

    material.uniforms.uTime.value += dt;
    material.uniforms.uOpacity.value +=
      (c.figureOpacity - material.uniforms.uOpacity.value) * k;

    const g = group.current;
    if (!g) return;
    g.position.x += (c.figureX - g.position.x) * k;
    g.position.y += (c.figureY - g.position.y) * k;
    g.position.z += (c.figureZ - g.position.z) * k;
    const s = c.figureScale;
    g.scale.x += (s - g.scale.x) * k;
    g.scale.y += (s - g.scale.y) * k;
    g.scale.z += (s - g.scale.z) * k;
    // Turns to face the camera as it takes the centre.
    g.rotation.y += (-c.figureX * 0.22 - g.rotation.y) * k;

    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __figure?: unknown }).__figure = {
        y: +g.position.y.toFixed(2),
        scale: +g.scale.y.toFixed(2),
        opacity: +material.uniforms.uOpacity.value.toFixed(2),
        headWorldY: +(g.position.y + head.y * g.scale.y).toFixed(2),
      };
    }
  });

  return (
    <group ref={group} scale={1.55}>
      <mesh geometry={geometry} frustumCulled={false}>
        <primitive object={material} attach="material" />
      </mesh>
      <Face head={head} stateRef={stateRef} spread={spread} />
    </group>
  );
}

/** Where the scan's head is, in the model's own coordinates. */
type Head = { x: number; y: number; z: number; height: number };

function headOf(geometry: THREE.BufferGeometry): Head {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox ?? new THREE.Box3();
  const size = new THREE.Vector3();
  const centre = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(centre);
  // A standing figure is roughly seven and a half heads tall, and the scan is
  // a whole body, so this lands on the head without hand-tuned numbers.
  const height = size.y / 7.5;
  return {
    x: centre.x,
    y: box.max.y - height * 0.52,
    z: centre.z + size.z * 0.34,
    height,
  };
}

/**
 * The photograph, over the scan's head, at the very end.
 *
 * The scan has no face — it is a surface, and the fresnel shader is what makes
 * it read at all. So the section ends by giving it one: as the figure comes
 * forward the real face fades in over the wireframe head. It is billboarded,
 * because a flat photograph is only ever right from straight on, and the
 * figure is square to the camera by then anyway.
 */
function Face({
  head,
  stateRef,
  spread,
}: {
  head: Head;
  stateRef: React.RefObject<ShowcaseState>;
  spread: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, "/figure/face.webp");

  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return new THREE.ShaderMaterial({
      vertexShader: screenVert,
      fragmentShader: faceFrag,
      transparent: true,
      depthWrite: false,
      uniforms: { uMap: { value: texture }, uOpacity: { value: 0 } },
    });
  }, [texture]);

  useEffect(() => () => material.dispose(), [material]);

  const size = useMemo(() => {
    const image = texture.image as { width: number; height: number } | undefined;
    const aspect = image && image.height ? image.width / image.height : 0.8;
    // A photographed head is taller than the skull the scan gives us: hair at
    // the top, jaw at the bottom. Measured against the rendered frames rather
    // than guessed — see public/figure.
    const h = head.height * 1.25;
    return [h * aspect, h] as const;
  }, [texture, head.height]);

  const billboard = useMemo(() => new THREE.Quaternion(), []);

  useFrame(({ camera }, delta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(delta, 1 / 30);
    const c = showcase(stateRef.current?.progress ?? 0, spread);
    const u = material.uniforms.uOpacity;
    u.value += (c.face - u.value) * Math.min(1, dt * 6);
    // Nothing to draw, and nothing to compute, for most of the section.
    m.visible = u.value > 0.003;
    if (!m.visible || !m.parent) return;
    // Square to the camera, in spite of whatever the figure's group is doing.
    m.parent.getWorldQuaternion(billboard);
    m.quaternion.copy(billboard.invert()).multiply(camera.quaternion);

    if (process.env.NODE_ENV === "development") {
      // Handle for checking the reveal without having to trust a screenshot.
      const w = m.getWorldPosition(new THREE.Vector3());
      (window as unknown as { __face?: unknown }).__face = {
        opacity: +u.value.toFixed(3),
        world: w.toArray().map((n) => +n.toFixed(2)),
        height: +(size[1] * (m.parent.scale.y || 1)).toFixed(2),
      };
    }
  });

  return (
    <mesh
      ref={mesh}
      position={[head.x, head.y, head.z]}
      renderOrder={2}
      frustumCulled={false}
      visible={false}
    >
      <planeGeometry args={[size[0], size[1]]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Phone({
  shots,
  stateRef,
  spread,
}: {
  shots: string[];
  stateRef: React.RefObject<ShowcaseState>;
  spread: number;
}) {
  const group = useRef<THREE.Group>(null);
  const textures = useLoader(THREE.TextureLoader, shots);

  useMemo(() => {
    for (const t of textures) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 8;
    }
  }, [textures]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: screenVert,
        fragmentShader: screenFrag,
        transparent: true,
        uniforms: {
          uA: { value: textures[0] },
          uB: { value: textures[Math.min(1, textures.length - 1)] },
          uMix: { value: 0 },
          uOpacity: { value: 0 },
        },
      }),
    [textures],
  );

  // The body needs its own fade: the screen's opacity lives in a shader
  // uniform, and without this the chassis stayed behind as a dark rectangle
  // after the phone was supposed to have left.
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0b0f0d",
        roughness: 0.35,
        metalness: 0.7,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  useEffect(() => () => {
    material.dispose();
    bodyMaterial.dispose();
  }, [material, bodyMaterial]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const p = stateRef.current?.progress ?? 0;
    const c = showcase(p, spread);
    const u = material.uniforms;

    // Map scroll onto the screenshot sequence: A and B are the two frames the
    // scroll is currently between, and uMix is how far between them it is.
    const span = textures.length - 1;
    const pos = c.screen * span;
    const i = Math.min(Math.floor(pos), span - 1);
    u.uA.value = textures[i];
    u.uB.value = textures[i + 1];
    // Hold each frame, then cross-fade quickly, rather than a constant blur.
    u.uMix.value = THREE.MathUtils.smoothstep(pos - i, 0.35, 0.75);

    const k = Math.min(1, dt * 6);
    const appear = THREE.MathUtils.smoothstep(p, 0, 0.08);
    const visible = appear * c.phoneOpacity;
    u.uOpacity.value += (visible - u.uOpacity.value) * k;
    bodyMaterial.opacity += (visible - bodyMaterial.opacity) * k;

    const g = group.current;
    if (!g) return;
    g.position.x += (c.phoneX - g.position.x) * k;
    g.position.z += (c.phoneZ - g.position.z) * k;
    g.rotation.y += (c.phoneYaw - g.rotation.y) * k;
    // A little float, so it never sits perfectly still.
    const bob = Math.sin(p * Math.PI * 2) * 0.05;
    g.position.y += (bob - g.position.y) * Math.min(1, dt * 3);
  });

  return (
    <group ref={group}>
      <RoundedBox args={[SCREEN_W + 0.075, SCREEN_H + 0.075, 0.055]} radius={0.055} smoothness={4}>
        <primitive object={bodyMaterial} attach="material" />
      </RoundedBox>
      <mesh position={[0, 0, 0.029]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * How much horizontal swing the canvas can take. A narrow one cannot hold two
 * objects side by side, so the crossing becomes a small shift and the depth
 * between them does the separating instead.
 */
function useSpread(): number {
  const { size, camera } = useThree();
  const aspect = size.width / Math.max(size.height, 1);
  const wide = aspect > 0.95;

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0, 0.15, wide ? 5.8 : 6.8);
    cam.updateProjectionMatrix();
  }, [camera, wide]);

  return wide ? 1 : 0.34;
}

export function CaseStudyScene({
  shots,
  stateRef,
}: {
  shots: string[];
  stateRef: React.RefObject<ShowcaseState>;
}) {
  const spread = useSpread();

  return (
    <>
      {/* Enough light to shape the phone's body; the rest is emissive. */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#9effc4" />
      <directionalLight position={[-4, 1, -2]} intensity={0.5} color="#1d7a3d" />

      <Figure stateRef={stateRef} spread={spread} />
      <Phone shots={shots} stateRef={stateRef} spread={spread} />
    </>
  );
}

useGLTF.preload(MODEL);
