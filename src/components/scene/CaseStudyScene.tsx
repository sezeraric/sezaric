"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { RoundedBox, useGLTF } from "@react-three/drei";
import * as THREE from "three";

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

export type ShowcaseState = {
  /** 0..1 through the showcase section. */
  progress: number;
};

function Figure({ stateRef, layout }: { stateRef: React.RefObject<ShowcaseState>; layout: Layout }) {
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
    material.uniforms.uTime.value += dt;
    const target = THREE.MathUtils.smoothstep(stateRef.current?.progress ?? 0, 0, 0.12);
    material.uniforms.uOpacity.value +=
      (target - material.uniforms.uOpacity.value) * Math.min(1, dt * 5);
  });

  return (
    <mesh geometry={geometry} position={layout.figure} scale={layout.figureScale} frustumCulled={false}>
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Phone({
  shots,
  stateRef,
  layout,
}: {
  shots: string[];
  stateRef: React.RefObject<ShowcaseState>;
  layout: Layout;
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

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const p = stateRef.current?.progress ?? 0;
    const u = material.uniforms;

    // Map scroll onto the screenshot sequence: A and B are the two frames the
    // scroll is currently between, and uMix is how far between them it is.
    const span = textures.length - 1;
    const pos = THREE.MathUtils.clamp(p, 0, 1) * span;
    const i = Math.min(Math.floor(pos), span - 1);
    u.uA.value = textures[i];
    u.uB.value = textures[i + 1];
    // Hold each frame, then cross-fade quickly, rather than a constant blur.
    u.uMix.value = THREE.MathUtils.smoothstep(pos - i, 0.35, 0.75);

    const target = THREE.MathUtils.smoothstep(p, 0, 0.1);
    u.uOpacity.value += (target - u.uOpacity.value) * Math.min(1, dt * 6);

    if (group.current) {
      // A slow turn across the section, so the phone is never a flat rectangle.
      const yaw = THREE.MathUtils.lerp(0.34, -0.16, THREE.MathUtils.smoothstep(p, 0, 1));
      group.current.rotation.y += (yaw - group.current.rotation.y) * Math.min(1, dt * 4);
      group.current.position.y +=
        (Math.sin(p * Math.PI) * 0.06 - group.current.position.y) * Math.min(1, dt * 4);
    }
  });

  return (
    <group ref={group} position={layout.phone}>
      <RoundedBox args={[SCREEN_W + 0.075, SCREEN_H + 0.075, 0.055]} radius={0.055} smoothness={4}>
        <meshStandardMaterial color="#0b0f0d" roughness={0.35} metalness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0, 0.029]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

type Layout = {
  figure: [number, number, number];
  figureScale: number;
  phone: [number, number, number];
};

/**
 * Side by side needs width. On a narrow canvas the pair is stacked in depth
 * instead — phone in front, figure behind it — rather than pushed off frame.
 */
function useLayout(): Layout {
  const { size, camera } = useThree();
  const aspect = size.width / Math.max(size.height, 1);
  const wide = aspect > 0.95;

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0, 0.15, wide ? 5.6 : 6.6);
    cam.updateProjectionMatrix();
  }, [camera, wide]);

  return wide
    ? { figure: [-1.15, 0, -0.9], figureScale: 1.55, phone: [0.75, 0, 0] }
    : { figure: [0, 0.05, -1.7], figureScale: 1.75, phone: [0, 0, 0] };
}

export function CaseStudyScene({
  shots,
  stateRef,
}: {
  shots: string[];
  stateRef: React.RefObject<ShowcaseState>;
}) {
  const layout = useLayout();

  return (
    <>
      {/* Enough light to shape the phone's body; the rest is emissive. */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#9effc4" />
      <directionalLight position={[-4, 1, -2]} intensity={0.5} color="#1d7a3d" />

      <Figure stateRef={stateRef} layout={layout} />
      <Phone shots={shots} stateRef={stateRef} layout={layout} />
    </>
  );
}

useGLTF.preload(MODEL);
