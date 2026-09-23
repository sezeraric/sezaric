import type { Dictionary } from "@/i18n";
import { SECTION } from "@/lib/scroll";

/**
 * The reveal: the wireframe the experience section wove walks to the centre
 * and turns into the photograph it was built from.
 *
 * The section itself is only scroll budget and a caption; the figure is the
 * weave clip in the backdrop layer, which reads this section's progress.
 */
export function Becoming({ d }: { d: Dictionary }) {
  return (
    <section
      id={SECTION.becoming}
      aria-labelledby="becoming-title"
      className="relative h-[230svh]"
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="shell relative z-10 pt-24 sm:pt-28">
          <p className="eyebrow">{d.becoming.eyebrow}</p>
          <h2
            id="becoming-title"
            className="mt-3 max-w-xl text-[clamp(1.75rem,6vw,3.25rem)] font-semibold leading-[1.05] tracking-tight text-text"
          >
            {d.becoming.title}
          </h2>
        </div>
      </div>
    </section>
  );
}
