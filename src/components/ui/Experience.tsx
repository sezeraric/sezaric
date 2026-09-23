import type { Dictionary } from "@/i18n";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { ExperienceStage } from "./ExperienceStage";

/**
 * The career. The roles themselves are a pinned stage in which each one
 * casts the threads that build the figure (see ExperienceStage); education
 * follows in the normal flow of the page.
 */
export function Experience({ d }: { d: Dictionary }) {
  return (
    <section id="experience" className="scroll-mt-24 pt-24 sm:pt-36">
      <div className="shell">
        <SectionHead eyebrow={d.experience.eyebrow} title={d.experience.title} />
      </div>

      <ExperienceStage roles={d.experience.roles} reveal={d.becoming} />

      <div className="shell pb-24 sm:pb-36">
        <Reveal>
          <div className="border-t border-line pt-10">
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
      </div>
    </section>
  );
}
