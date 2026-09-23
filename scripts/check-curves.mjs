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

  const { phase, rainIntensity, backdropPresence, figurePresence, weaveProgress, revealMove, WIREFRAME_DONE } =
    await import(pathToFileURL(out).href);

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

  // --- the woven figure ---------------------------------------------------
  const weave = [];
  for (const [e, r] of [[0, 0], [0.5, 0], [1, 0], [1, 0.1], [1, 0.4], [1, 0.75], [1, 1]]) {
    weave.push({ experience: e, reveal: r, clip: +weaveProgress(e, r).toFixed(3), move: +revealMove(r).toFixed(2) });
  }
  console.log("Weave clip:");
  console.table(weave);

  if (weaveProgress(0, 0) > 1e-6) fail.push("clip not at its first frame before the experience section");
  // The wireframe is finished exactly as the career has been read...
  if (Math.abs(weaveProgress(1, 0) - WIREFRAME_DONE) > 1e-6) fail.push("wireframe not complete at the end of the experience section");
  // ...and it never runs backwards as you keep scrolling.
  let last = -1;
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const v = i <= 100 ? weaveProgress(t * 2, 0) : weaveProgress(1, (t - 0.5) * 2);
    if (v < last - 1e-9) { fail.push(`clip runs backwards at step ${i}`); break; }
    last = v;
  }
  // The photograph is in, and holds, well before the pin lets go.
  if (weaveProgress(1, 0.75) < 0.999) fail.push("photograph not fully in by three quarters of the reveal");
  // It reaches the centre before it starts turning into the photograph.
  if (revealMove(0.3) < 0.999) fail.push("still walking to the centre as the reveal plays");
  if (weaveProgress(1, 0.1) - WIREFRAME_DONE > 1e-6) fail.push("reveal starts before the figure is centred");

  // Present only for its two sections.
  if (figurePresence(0, 0) > 1e-6) fail.push("figure visible before the experience section");
  if (figurePresence(1, 0) < 0.999) fail.push("figure not fully present through the experience section");
  if (figurePresence(1, 1) > 1e-6) fail.push("figure still visible after the reveal");

  if (fail.length) {
    console.error("FAIL:\n - " + fail.join("\n - "));
    process.exit(1);
  }
  console.log("all choreography invariants hold");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
