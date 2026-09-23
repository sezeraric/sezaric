"use client";

/**
 * Offline render rig for the figure — a build tool, not a page.
 *
 * Phones never get the 3D showcase (a second WebGL context alongside the
 * backdrop is what made iOS kill the tab), so the scan is rendered here to a
 * short sequence of transparent PNGs that the mobile showcase can flip through
 * for free. Open it, call `window.__renderShots()`, and save what it returns.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const W = 640;
const H = 960;
const FRAMES = 8;

const vert = /* glsl */ `
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

const frag = /* glsl */ `
  precision highp float;
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
    base += vec3(0.05, 0.7, 0.2) * step(0.985, band) * 0.45;
    float a = clamp(0.22 + fresnel * 0.95, 0.0, 1.0);
    gl_FragColor = vec4(base + uRim * fresnel, a);
  }
`;

export function Rig() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    host.current?.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 100);
    camera.position.set(0, 1.35, 6.2);
    camera.lookAt(0, 1.05, 0);

    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uRim: { value: new THREE.Color("#35ff77") } },
    });

    const group = new THREE.Group();
    scene.add(group);

    new GLTFLoader().load("/figure.glb", (gltf) => {
      let mesh: THREE.Mesh | null = null;
      gltf.scene.traverse((o) => {
        if ((o as THREE.Mesh).isMesh && !mesh) mesh = o as THREE.Mesh;
      });
      if (!mesh) return;
      const g = (mesh as THREE.Mesh).geometry.clone();
      if (!g.getAttribute("normal")) g.computeVertexNormals();

      // Frame it by its own bounds rather than by a guessed scale.
      g.computeBoundingBox();
      const box = g.boundingBox!;
      const size = new THREE.Vector3();
      box.getSize(size);
      const centre = new THREE.Vector3();
      box.getCenter(centre);
      const scale = 2.1 / Math.max(size.y, 0.001);

      const m = new THREE.Mesh(g, material);
      m.frustumCulled = false;
      m.position.set(-centre.x, -box.min.y, -centre.z);
      group.add(m);
      group.scale.setScalar(scale);

      (window as unknown as { __ready?: boolean }).__ready = true;
    });

    (window as unknown as { __renderShots?: () => string[] }).__renderShots = () => {
      const out: string[] = [];
      for (let i = 0; i < FRAMES; i++) {
        const t = FRAMES > 1 ? i / (FRAMES - 1) : 0;
        group.rotation.y = -0.5 + t * 1.0;
        material.uniforms.uTime.value = t * 6.2;
        renderer.render(scene, camera);
        out.push(renderer.domElement.toDataURL("image/png"));
      }
      return out;
    };

    return () => {
      renderer.dispose();
      material.dispose();
    };
  }, []);

  return <div ref={host} style={{ background: "#111", width: W, height: H }} />;
}
