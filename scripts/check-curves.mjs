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

  const { phase, rainIntensity } = await import(pathToFileURL(out).href);

  const rows = [];
  for (const p of [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1]) {
    const c = phase(p);
    rows.push({
      p,
      freeze: +c.freeze.toFixed(2),
      timeScale: +c.timeScale.toFixed(2),
      log: +c.log.toFixed(2),
      presence: +c.presence.toFixed(2),
      rain: rainIntensity(p),
    });
  }
  console.table(rows);

  const fail = [];
  const a = phase(0);
  const b = phase(1);
  if (a.presence > 1e-3) fail.push("shot visible at p=0");
  if (b.presence > 1e-3) fail.push(`shot visible at p=1 (${b.presence})`);
  if (a.freeze > 1e-3 || b.freeze > 1e-3) fail.push("time dilated at a section edge");
  if (a.log > 1e-3 || b.log > 1e-3) fail.push("problem log showing at a section edge");

  // The rain must never fully stop: a frozen field reads as a broken page.
  for (let i = 0; i <= 400; i++) {
    const t = phase(i / 400).timeScale;
    if (t < 0.05) { fail.push(`rain effectively stopped at p=${(i / 400).toFixed(3)}`); break; }
    if (t > 1.0001) { fail.push(`rain sped up past normal at p=${(i / 400).toFixed(3)}`); break; }
  }

  // Body copy further down the page must never sit under a bright rain field.
  if (rainIntensity(1) > 0.2) fail.push("rain too strong over body copy");

  if (fail.length) {
    console.error("FAIL:\n - " + fail.join("\n - "));
    process.exit(1);
  }
  console.log("all choreography invariants hold");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
