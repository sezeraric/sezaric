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

  const { phase, rainIntensity, backdropPresence, stageAt, cardMotion, WIREFRAME_DONE, FIRE_AT, CLIP_START } =
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

  // --- the experience stage ------------------------------------------------
  const ROLES = 5;
  const stage = [];
  for (const p of [0, 0.05, 0.2, 0.4, 0.6, 0.735, 0.8, 0.9, 1]) {
    const c = stageAt(p, ROLES);
    stage.push({ p, roleT: +c.roleT.toFixed(2), clip: +c.clip.toFixed(3), reveal: +c.reveal.toFixed(2) });
  }
  console.log("Experience stage:");
  console.table(stage);

  if (Math.abs(stageAt(0, ROLES).clip - CLIP_START) > 1e-6) fail.push("clip not at CLIP_START when the stage pins");
  // The wireframe is complete exactly when the last role has been read...
  const lastRole = ROLES / (ROLES + 1.8);
  if (Math.abs(stageAt(lastRole, ROLES).clip - WIREFRAME_DONE) > 1e-6) fail.push("wireframe not complete after the last role");
  // ...the clip never runs backwards...
  {
    let last = -1;
    for (let i = 0; i <= 400; i++) {
      const v = stageAt(i / 400, ROLES).clip;
      if (v < last - 1e-9) { fail.push(`clip runs backwards at p=${i / 400}`); break; }
      last = v;
    }
  }
  // ...and the photograph is fully in, and held, before the pin lets go.
  if (stageAt(0.97, ROLES).clip < 0.999) fail.push("photograph not held at the end of the stage");
  if (stageAt(lastRole, ROLES).reveal > 1e-6) fail.push("deck stepping aside before the last role is read");

  // Cards: never more than two on screen at once, and each is fully shown
  // for most of its own segment.
  for (let i = 0; i <= 500; i++) {
    const roleT = (i / 500) * ROLES;
    let visible = 0;
    for (let k = 0; k < ROLES; k++) {
      const m = cardMotion(roleT, k, ROLES);
      if (m.enter * (1 - m.exit) > 0.02) visible++;
    }
    if (visible > 2) { fail.push(`${visible} cards on screen at roleT=${roleT.toFixed(2)}`); break; }
  }
  for (let k = 0; k < ROLES; k++) {
    const m = cardMotion(k + 0.5, k, ROLES);
    if (m.enter < 0.999 || m.exit > 1e-6) fail.push(`card ${k} not fully shown mid-segment`);
    // It fires once it has arrived.
    if (cardMotion(k + FIRE_AT, k, ROLES).enter < 0.999) fail.push(`card ${k} fires before it has arrived`);
  }

  if (fail.length) {
    console.error("FAIL:\n - " + fail.join("\n - "));
    process.exit(1);
  }
  console.log("all choreography invariants hold");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
