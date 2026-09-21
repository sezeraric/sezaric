import type { Dictionary } from "@/i18n";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

export function Experience({ d }: { d: Dictionary }) {
  return (
    <section id="experience" className="shell scroll-mt-24 py-24 sm:py-36">
      <SectionHead eyebrow={d.experience.eyebrow} title={d.experience.title} />

      <ol className="mt-12 border-l border-line sm:mt-14">
        {d.experience.roles.map((role, i) => (
          <Reveal key={role.company} as="li" delay={i * 60}>
            <article className="relative pb-10 pl-5 sm:pb-12 sm:pl-10">
              {/* Timeline node. Only the current role is filled. */}
              <span
                className={`absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full ${i === 0 ? "bg-mx" : "bg-line-bright"}`}
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <h3 className="text-base font-medium text-text sm:text-lg">
                  {role.title}
                  <span className="text-text-faint"> · </span>
                  <span className="text-mx-soft">{role.company}</span>
                </h3>
                <p className="shrink-0 font-mono text-xs tracking-[0.12em] text-text-faint">{role.period}</p>
              </div>
              <ul className="mt-3 space-y-1.5">
                {role.points.map((point) => (
                  <li key={point} className="flex gap-2.5 leading-relaxed text-text-dim">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-mx-dim" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </ol>

      <Reveal delay={80}>
        <div className="mt-4 border-t border-line pt-10">
          <p className="eyebrow">{d.education.eyebrow}</p>
          <dl className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-3">
            {d.education.items.map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-xs tracking-[0.12em] text-text-faint">{item.label}</dt>
                <dd className="mt-1 text-text-dim">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </section>
  );
}
