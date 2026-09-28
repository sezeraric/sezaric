import * as THREE from "three";
import { glyphAtlas, ATLAS_GRID } from "@/lib/glyphAtlas";
import type { Form } from "@/lib/shapes";

/**
 * The particle cloud on the experience stage.
 *
 * Thousands of the rain's own glyphs — mirrored katakana, digits — each with
 * an address in every form (see lib/shapes.ts). The stage says where between
 * two forms the cloud should be; each particle leaves on its own small delay,
 * lifts off along its own direction and lands in the next form, so a change
 * reads as the thing dissolving and being recompiled rather than sliding.
 *
 * Only the two forms currently being blended are bound to the shader: when the
 * cloud passes a whole form, the attributes are swapped for the next pair.
 * Each form's buffer is uploaded once and reused, so a swap costs nothing.
 *
 * Plain three.js rather than a second react-three-fiber canvas: it is one
 * draw call, driven imperatively from the stage's own frame loop.
 */

const vertex = /* glsl */ `
  attribute vec4 aFrom;
  attribute vec4 aTo;
  attribute vec4 aSeed;   // x: phase, y: departure delay, z: glyph, w: speed
  attribute vec3 aDrift;  // the direction it lifts off in, mid-flight

  uniform float uT;         // 0..1 between the two bound forms
  uniform float uTime;
  uniform float uPixel;     // px per world unit at distance 1
  uniform float uGlyph;     // glyph size, form units
  uniform float uScale;     // form units → world
  uniform vec2  uCenter;    // world offset of the form's centre
  uniform float uFromRain;
  uniform float uToRain;
  uniform vec2  uTurn;      // yaw, pitch
  uniform float uGlyphs;
  uniform vec3  uTouch;     // world x, y of the pointer, and how present it is 0..1
  uniform float uTouchR;    // world radius the pointer parts the code within

  varying vec3  vColor;
  varying float vAlpha;
  varying float vGlyph;

  vec3 fall(vec3 p, float on) {
    if (on < 0.5) return p;
    float h = 3.4;
    p.y = mod(p.y - uTime * (0.35 + aSeed.w * 0.9) + h * 0.5, h) - h * 0.5;
    return p;
  }

  // Falling code fades out at the edges of its volume instead of stopping at a box.
  float rainEdge(vec3 p, float on) {
    if (on < 0.5) return 1.0;
    return (1.0 - smoothstep(1.05, 1.7, abs(p.y))) * (1.0 - smoothstep(1.6, 2.4, abs(p.x)));
  }

  void main() {
    vec3 a = fall(aFrom.xyz, uFromRain);
    vec3 b = fall(aTo.xyz, uToRain);

    // Particles do not leave together: the delay is what makes a change read
    // as a dissolve and a re-assembly instead of a slide.
    float t = clamp(uT * 1.8 - aSeed.y * 0.8, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    float air = sin(t * 3.14159);

    vec3 p = mix(a, b, t);
    p += aDrift * air * (0.25 + 0.55 * aSeed.y);
    // A slight, constant shimmer: the form is running, not printed.
    p.x += sin(uTime * 0.9 + aSeed.x * 6.28) * 0.006;
    p.y += cos(uTime * 0.7 + aSeed.x * 4.1) * 0.006;

    float cy = cos(uTurn.x), sy = sin(uTurn.x);
    p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
    float cp = cos(uTurn.y), sp = sin(uTurn.y);
    p = vec3(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);

    float bright = mix(aFrom.w, aTo.w, t);
    // The far side of a form is dimmer, so it never piles up into white.
    float facing = smoothstep(-1.1, 0.9, p.z);

    vec3 world = p * uScale;
    world.xy += uCenter;

    // The code can be touched: near the pointer the glyphs part, lift toward
    // you and burn brighter, and settle back when it moves on.
    vec2 dp = world.xy - uTouch.xy;
    float dl = length(dp);
    float touch = uTouch.z * exp(-(dl * dl) / (uTouchR * uTouchR));
    world.xy += (dp / max(dl, 1e-4)) * touch * uTouchR * (0.45 + 0.35 * aSeed.w);
    world.z += touch * uTouchR * 0.8;

    vec4 mv = viewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uGlyph * uScale * uPixel / -mv.z * (0.8 + 0.4 * bright), 1.0, 48.0);

    // Glyphs re-roll now and then, and constantly while in flight.
    float rate = 0.4 + aSeed.w * 1.6 + air * 14.0 + touch * 18.0;
    vGlyph = mod(floor(aSeed.z * uGlyphs) + floor(uTime * rate + aSeed.x * 9.0) * 37.0, uGlyphs);

    vec3 green = vec3(0.0, 0.93, 0.27);
    vec3 head = vec3(0.82, 1.0, 0.87);
    vColor = mix(green * (0.55 + 0.45 * bright), head, min(1.0, smoothstep(0.82, 1.0, bright) * 0.85 + air * 0.35 + touch * 0.8));
    float edge = mix(rainEdge(a, uFromRain), rainEdge(b, uToRain), t);
    vAlpha = bright * mix(0.3, 1.0, facing) * (0.72 + 0.28 * air) * edge + touch * 0.35 * edge;
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec2 uGrid;
  uniform float uOpacity;
  varying vec3  vColor;
  varying float vAlpha;
  varying float vGlyph;

  void main() {
    float col = mod(vGlyph, uGrid.x);
    float row = floor(vGlyph / uGrid.x);
    // Inset a hair so mipmapping does not pull in the neighbouring cell.
    vec2 pc = mix(vec2(0.06), vec2(0.94), gl_PointCoord);
    vec2 uv = vec2((col + pc.x) / uGrid.x, 1.0 - (row + pc.y) / uGrid.y);
    float m = texture2D(uAtlas, uv).r;
    float a = m * vAlpha * uOpacity;
    if (a < 0.015) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

export type Layout = {
  /** Centre of the form, CSS px from the canvas's top-left. */
  x: number;
  y: number;
  /** Half-height of the form, CSS px. */
  half: number;
  /** Glyph size, in form units. */
  glyph: number;
  yaw: number;
  pitch: number;
  opacity: number;
  /** The pointer, CSS px from the canvas's top-left; `on` 0..1. */
  touch: { x: number; y: number; on: number; radius: number };
};

const FOV = 35;
const DIST = 6;

export class ConstructField {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  private geometry = new THREE.BufferGeometry();
  private material: THREE.ShaderMaterial;
  private forms: { form: Form; attr: THREE.BufferAttribute }[] = [];
  private bound = -1;
  private width = 1;
  private height = 1;
  /** Where the cloud is, eased toward where the scroll says it should be. */
  morph = 0;

  constructor(canvas: HTMLCanvasElement, forms: Form[], dprMax: number) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprMax));
    this.camera.position.set(0, 0, DIST);

    const count = forms[0].points.length / 4;
    this.forms = forms.map((form) => ({ form, attr: new THREE.BufferAttribute(form.points, 4) }));

    const seed = new Float32Array(count * 4);
    const drift = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seed[i * 4] = Math.random();
      seed[i * 4 + 1] = Math.random();
      seed[i * 4 + 2] = Math.random();
      seed[i * 4 + 3] = Math.random();
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      drift[i * 3] = s * Math.cos(a);
      drift[i * 3 + 1] = u * 0.6 + 0.25; // a little upward, like heat
      drift[i * 3 + 2] = s * Math.sin(a);
    }
    this.geometry.setAttribute("position", this.forms[0].attr);
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    this.geometry.setAttribute("aDrift", new THREE.BufferAttribute(drift, 3));
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);

    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uT: { value: 0 },
        uTime: { value: 0 },
        uPixel: { value: 1 },
        uGlyph: { value: 0.03 },
        uScale: { value: 1 },
        uCenter: { value: new THREE.Vector2() },
        uFromRain: { value: 0 },
        uToRain: { value: 0 },
        uTurn: { value: new THREE.Vector2() },
        uGlyphs: { value: ATLAS_GRID.cols * ATLAS_GRID.rows },
        uAtlas: { value: glyphAtlas() },
        uGrid: { value: new THREE.Vector2(ATLAS_GRID.cols, ATLAS_GRID.rows) },
        uOpacity: { value: 1 },
        uTouch: { value: new THREE.Vector3(0, 0, 0) },
        uTouchR: { value: 0.3 },
      },
    });
    const points = new THREE.Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(points);
    this.bind(0);
  }

  get formCount() {
    return this.forms.length;
  }

  reach(i: number) {
    return this.forms[Math.max(0, Math.min(this.forms.length - 1, i))].form.reachX;
  }

  private bind(i: number) {
    const last = this.forms.length - 1;
    const a = Math.max(0, Math.min(last, i));
    const b = Math.min(last, a + 1);
    if (a === this.bound) return;
    this.bound = a;
    this.geometry.setAttribute("aFrom", this.forms[a].attr);
    this.geometry.setAttribute("aTo", this.forms[b].attr);
    this.material.uniforms.uFromRain.value = this.forms[a].form.rain ? 1 : 0;
    this.material.uniforms.uToRain.value = this.forms[b].form.rain ? 1 : 0;
  }

  resize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    const dpr = this.renderer.getPixelRatio();
    this.material.uniforms.uPixel.value = (this.height * dpr) / (2 * Math.tan((FOV * Math.PI) / 360));
  }

  render(time: number, layout: Layout) {
    const last = this.forms.length - 1;
    const m = Math.max(0, Math.min(last, this.morph));
    const i = Math.min(Math.floor(m), last - 1);
    this.bind(i);
    const u = this.material.uniforms;
    u.uT.value = m - i;
    u.uTime.value = time;

    // CSS px → world units on the z = 0 plane.
    const halfH = Math.tan((FOV * Math.PI) / 360) * DIST;
    const perPx = (2 * halfH) / this.height;
    u.uScale.value = layout.half * perPx;
    u.uCenter.value.set((layout.x - this.width / 2) * perPx, (this.height / 2 - layout.y) * perPx);
    u.uGlyph.value = layout.glyph;
    u.uTurn.value.set(layout.yaw, layout.pitch);
    u.uOpacity.value = layout.opacity;
    u.uTouch.value.set(
      (layout.touch.x - this.width / 2) * perPx,
      (this.height / 2 - layout.touch.y) * perPx,
      layout.touch.on,
    );
    u.uTouchR.value = layout.touch.radius * perPx;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
