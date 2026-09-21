import { caseStudy } from "@/lib/content";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

export function Work() {
  return (
    <section id="work" className="scroll-mt-24 border-t border-line bg-surface/30 py-28 sm:py-36">
      <div className="shell">
        <SectionHead
          eyebrow={caseStudy.eyebrow}
          title={caseStudy.name}
          lead={caseStudy.summary}
        />

        <Reveal delay={60}>
          <p className="mt-5 font-mono text-xs tracking-[0.2em] uppercase text-mx-dim">
            {caseStudy.kind}
          </p>
        </Reveal>

        {/* Numbers first: they are the part a reader actually weighs. */}
        <ul className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line lg:grid-cols-4">
          {caseStudy.stats.map((stat, i) => (
            <Reveal key={stat.label} as="li" delay={i * 70}>
              <div className="h-full bg-ink px-5 py-7">
                <p className="font-mono text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-none text-mx glow-soft">
                  {stat.value}
                </p>
                <p className="mt-2.5 font-mono text-[11px] tracking-[0.18em] uppercase text-text-faint">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-16 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2">
          {caseStudy.highlights.map((h, i) => (
            <Reveal key={h.title} as="article" delay={i * 70}>
              <div className="h-full bg-ink p-6 sm:p-8">
                <h3 className="flex items-baseline gap-3 text-lg font-medium text-text">
                  <span className="font-mono text-xs text-mx-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {h.title}
                </h3>
                <p className="mt-3 leading-relaxed text-text-dim">{h.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {caseStudy.shots.length > 0 && (
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {caseStudy.shots.map((shot, i) => (
              <Reveal key={shot.src} delay={i * 70}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  className="w-full rounded-sm border border-line"
                />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={80}>
          <div className="mt-12">
            <p className="eyebrow">{"// stack"}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {caseStudy.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-sm border border-line px-2.5 py-1 font-mono text-xs text-text-dim"
                >
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
