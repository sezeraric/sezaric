/**
 * Device capability tiers.
 *
 * WebGL work that is fine on a laptop will melt a mid-range phone, so the scene
 * reads these once at mount and scales itself down instead of shipping the same
 * cost everywhere.
 */
export type Tier = "high" | "medium" | "low";

export type Capabilities = {
  tier: Tier;
  dpr: [number, number];
  reducedMotion: boolean;
  /** Rain glyph grid density multiplier. */
  rainDensity: number;
  bulletCount: number;
  postprocessing: boolean;
};

export function detect(): Capabilities {
  if (typeof window === "undefined") {
    return { tier: "high", dpr: [1, 2], reducedMotion: false, rainDensity: 1, bulletCount: 8, postprocessing: true };
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;

  let tier: Tier = "high";
  if (coarse || narrow) tier = cores >= 8 ? "medium" : "low";
  else if (cores <= 4) tier = "medium";

  const byTier: Record<Tier, Omit<Capabilities, "tier" | "reducedMotion">> = {
    high: { dpr: [1, 2], rainDensity: 1, bulletCount: 8, postprocessing: true },
    medium: { dpr: [1, 1.5], rainDensity: 0.7, bulletCount: 6, postprocessing: true },
    low: { dpr: [1, 1], rainDensity: 0.5, bulletCount: 4, postprocessing: false },
  };

  const caps = { tier, reducedMotion, ...byTier[tier] };

  /*
   * No postprocessing on a touch device, whatever its core count says.
   * Bloom is several full-screen passes over a canvas that already covers the
   * viewport, and on a phone that GPU time is taken straight out of the
   * scroll's frame budget. The rain reads fine without it.
   */
  if (coarse) caps.postprocessing = false;

  return caps;
}
