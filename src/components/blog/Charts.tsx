import type { Dictionary } from "@/i18n";

/**
 * The two figures in the AI-bubble post.
 *
 * Neither is a data chart and neither pretends to be: the first is a labelled
 * conceptual curve, the second a two-column ledger. Both say so in their
 * captions, because drawing invented numbers as if they were measurements is
 * the one thing a figure must never do.
 *
 * Single accent colour, recessive axes, direct labels in text tokens rather
 * than in the accent, and a text description for anyone who cannot see them.
 */

export function BubbleShape({ d }: { d: Dictionary }) {
  const c = d.blog.charts.bubbleShape;

  // Points along a bubble: slow rise, spike, collapse, settle above the start.
  const path =
    "M 20 200 C 90 196, 140 188, 190 176 C 240 164, 275 140, 300 96 C 316 68, 330 40, 344 30 C 358 40, 366 84, 378 124 C 392 170, 430 176, 480 172";

  // x positions of the phase labels, matched to the curve's turning points.
  const marks = [20, 150, 265, 344, 392, 480];

  return (
    <svg
      viewBox="0 0 500 250"
      className="w-full"
      role="img"
      aria-labelledby="bubble-shape-title bubble-shape-desc"
    >
      <title id="bubble-shape-title">{c.axis}</title>
      <desc id="bubble-shape-desc">{c.description}</desc>

      {/* Baseline — the level the curve settles above. */}
      <line x1="20" y1="200" x2="480" y2="200" stroke="var(--color-line)" strokeWidth="1" />
      <line
        x1="20"
        y1="172"
        x2="480"
        y2="172"
        stroke="var(--color-line)"
        strokeWidth="1"
        strokeDasharray="3 5"
      />

      <path d={path} fill="none" stroke="var(--color-mx)" strokeWidth="2" strokeLinecap="round" />

      {/* The peak, marked but not celebrated. */}
      <circle cx="344" cy="30" r="3.5" fill="var(--color-mx)" />

      {marks.map((x, i) => (
        <g key={c.phases[i]}>
          <line x1={x} y1="206" x2={x} y2="212" stroke="var(--color-line-bright)" strokeWidth="1" />
          <text
            x={x}
            y="228"
            textAnchor={i === 0 ? "start" : i === marks.length - 1 ? "end" : "middle"}
            className="fill-[var(--color-text-faint)] font-mono"
            fontSize="10"
            letterSpacing="0.08em"
          >
            {c.phases[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Leftovers({ d }: { d: Dictionary }) {
  const c = d.blog.charts.leftovers;

  return (
    <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
      <div className="bg-ink p-5 sm:p-6">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-faint">
          {c.deadHead}
        </h3>
        <ul className="mt-4 space-y-2.5">
          {c.dead.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-text-faint">
              {/* Icon plus position carry the meaning; colour alone never does. */}
              <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-text-faint" />
              <span className="line-through decoration-text-faint/50">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-ink p-5 sm:p-6">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-mx-dim">
          {c.aliveHead}
        </h3>
        <ul className="mt-4 space-y-2.5">
          {c.alive.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-text">
              <span aria-hidden="true" className="mt-1.5 shrink-0 font-mono text-xs text-mx">
                →
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
