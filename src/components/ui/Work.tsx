import type { Dictionary } from "@/i18n";
import { ScreensFan } from "./ScreensFan";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

export function Work({ d }: { d: Dictionary }) {
  const c = d.caseStudy;
  return (
    // Clipped sideways at the screen edge, never inside it: a tilted phone in
    // the screens fan must not give the page a sideways scroll.
    <section id="work" className="scroll-mt-24 overflow-x-clip border-t border-line bg-surface/30 py-24 sm:py-36">
      <div className="shell">
        <SectionHead eyebrow={c.eyebrow} title={c.name} lead={c.summary} />

        <Reveal delay={60}>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-mx-dim">{c.kind}</p>
        </Reveal>

        {/* Numbers first: they are the part a reader actually weighs. */}
        <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:mt-14 lg:grid-cols-4">
          {c.stats.map((stat, i) => (
            <Reveal key={stat.label} as="li" delay={i * 70}>
              <div className="h-full bg-ink px-4 py-6 sm:px-5 sm:py-7">
                <p className="font-mono text-[clamp(1.5rem,6vw,2.75rem)] font-semibold leading-none text-mx glow-soft">
                  {stat.value}
                </p>
                <p className="mt-2.5 font-mono text-[10px] uppercase leading-snug tracking-[0.16em] text-text-faint sm:text-[11px]">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:mt-16 sm:grid-cols-2">
          {c.highlights.map((h, i) => (
            <Reveal key={h.title} as="article" delay={i * 70}>
              <div className="h-full bg-ink p-6 sm:p-8">
                <h3 className="flex items-baseline gap-3 text-lg font-medium text-text">
                  <span className="font-mono text-xs text-mx-dim">{String(i + 1).padStart(2, "0")}</span>
                  {h.title}
                </h3>
                <p className="mt-3 leading-relaxed text-text-dim">{h.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Real screens from the shipped app, side by side. */}
        <div className="mt-12 sm:mt-16">
          <ScreensFan shots={[...c.shots]} label={c.shotsLabel} />
        </div>

        <Reveal delay={80}>
          <div className="mt-14">
            <p className="eyebrow">{c.stackLabel}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {c.stack.map((tech) => (
                <li key={tech} className="rounded-sm border border-line px-2.5 py-1 font-mono text-xs text-text-dim">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
