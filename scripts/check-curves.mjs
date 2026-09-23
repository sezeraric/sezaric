/**
 * Prints the scroll choreography as a table and asserts the invariants that
 * make the bullet-time section read correctly.
 *
 * Run with `npm run check:curves`. The scene itself can only be judged by eye,
 * but the timing behind it is pure maths and worth checking on its own.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = mkdtempSync(join(tmpdir(), "curves-"));
const out = join(dir, "curves.mjs");

try {
  execFileSync(
    "npx",
    ["--yes", "esbuild", "src/lib/curves.ts", `--outfile=${out}`, "--format=esm", "--log-level=error"],
    { stdio: "inherit" },
  );

  const { phase, rainIntensity, backdropPresence, showcase } = await import(pathToFileURL(out).href);

  // The approach: section rising into view, pin not started yet (p is still 0).
  const approach = [];
  for (const entry of [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1]) {
    approach.push({
      entry,
      shotOpacity: +backdropPresence(entry, 0).toFixed(2),
      rain: +rainIntensity(entry, 0).toFixed(2),
    });
  }
  console.log("Approach (before the pin starts):");
  console.table(approach);

  // The pin itself.
  const rows = [];
  for (const p of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1]) {
    const c = phase(p);
    rows.push({
      p,
      freeze: +c.freeze.toFixed(2),
      timeScale: +c.timeScale.toFixed(2),
      log: +c.log.toFixed(2),
      shotOpacity: +backdropPresence(1, p).toFixed(2),
      rain: +rainIntensity(1, p).toFixed(2),
    });
  }
  console.log("Pinned:");
  console.table(rows);

  const fail = [];
  const a = phase(0);
  const b = phase(1);
  if (a.freeze > 1e-3 || b.freeze > 1e-3) fail.push("time dilated at a section edge");
  if (a.log > 1e-3 || b.log > 1e-3) fail.push("problem log showing at a section edge");

  // The point of the approach: the shot must already be on screen before the
  // pin begins, or the visitor scrolls into a stretch of black.
  if (backdropPresence(0, 0) > 1e-3) fail.push("shot visible before the section approaches");
  if (backdropPresence(0.5, 0) < 0.45) {
    fail.push(`shot still faint halfway through the approach (${backdropPresence(0.5, 0)})`);
  }
  if (backdropPresence(1, 0) < 0.99) {
    fail.push(`shot not fully in by the time the pin starts (${backdropPresence(1, 0)})`);
  }
  if (backdropPresence(1, 1) > 1e-3) fail.push("shot still visible after the pin ends");

  // The rain must never fully stop: a frozen field reads as a broken page.
  for (let i = 0; i <= 400; i++) {
    const t = phase(i / 400).timeScale;
    if (t < 0.05) { fail.push(`rain effectively stopped at p=${(i / 400).toFixed(3)}`); break; }
    if (t > 1.0001) { fail.push(`rain sped up past normal at p=${(i / 400).toFixed(3)}`); break; }
  }

  // Rain has to get out of the way of the clip, and of body copy later.
  if (rainIntensity(1, 0.5) > 0.4) fail.push("rain too strong over the clip");
  if (rainIntensity(1, 1) > 0.2) fail.push("rain too strong over body copy");

  // --- case-study showcase -------------------------------------------------
  const show = [];
  for (const p of [0, 0.2, 0.35, 0.5, 0.62, 0.75, 0.84, 0.92, 1]) {
    const c = showcase(p, 1);
    show.push({
      p,
      phoneX: +c.phoneX.toFixed(2),
      figureX: +c.figureX.toFixed(2),
      figureScale: +c.figureScale.toFixed(2),
      figureY: +c.figureY.toFixed(2),
      phoneOpacity: +c.phoneOpacity.toFixed(2),
      screen: +c.screen.toFixed(2),
    });
  }
  console.log("Showcase:");
  console.table(show);

  const a0 = showcase(0, 1);
  const aMid = showcase(0.5, 1);
  const aEnd = showcase(1, 1);

  // They must start on opposite sides...
  if (Math.sign(a0.phoneX) === Math.sign(a0.figureX)) {
    fail.push("phone and figure start on the same side");
  }
  // ...and swap over.
  if (Math.sign(showcase(0.15, 1).phoneX) === Math.sign(showcase(0.75, 1).phoneX)) {
    fail.push("phone never crosses to the other side");
  }
  if (Math.sign(showcase(0.15, 1).figureX) === Math.sign(showcase(0.75, 1).figureX)) {
    fail.push("figure never crosses to the other side");
  }
  // The finale: figure centred, larger, phone gone.
  if (Math.abs(aEnd.figureX) > 1e-6) fail.push(`figure not centred at the end (${aEnd.figureX})`);
  if (aEnd.figureScale <= a0.figureScale) fail.push("figure does not grow at the end");
  if (aEnd.phoneOpacity > 1e-6) fail.push(`phone still visible at the end (${aEnd.phoneOpacity})`);
  if (aEnd.figureY >= 0) fail.push("figure does not drop as it grows, so it will be cropped at the head");
  // Every screenshot has to be reached before the finale takes over.
  if (showcase(0.84, 1).screen < 0.999) fail.push("last screenshot never fully shown");
  // The face is the section's last beat: nothing of it before the figure is
  // already on its way forward, and fully there by the end.
  if (showcase(0.88, 1).face > 1e-6) fail.push("face showing before the finale");
  if (aEnd.face < 0.999) fail.push("face never fully arrives");
  if (a0.screen > 1e-6) fail.push("screen sequence does not start at the first shot");
  void aMid;

  if (fail.length) {
    console.error("FAIL:\n - " + fail.join("\n - "));
    process.exit(1);
  }
  console.log("all choreography invariants hold");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
