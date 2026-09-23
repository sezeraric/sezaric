import type { Dictionary } from "@/i18n";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { WEB_CARD_ATTR } from "@/lib/scroll";

/**
 * The career, as the thing the figure is built from.
 *
 * Scrolling through the roles plays the weave clip in the backdrop: green
 * threads stream in and build the figure as the career is read, and each role
 * casts its own web of threads into it as it passes (see WebThreads). That is why
 * this section has no opaque layer over the page and each card is its own
 * solid panel instead: whole cards sliding over the figure read as intended,
 * where a translucent layer only turned the gaps between them into stripes.
 * On a phone the gaps are wide on purpose: they are the windows the figure is
 * seen through as it is built. On a wide screen the list keeps to the left so the figure
 * has the right-hand side; on a phone the figure stands at the bottom and the
 * cards slide over it.
 */
export function Experience({ d }: { d: Dictionary }) {
  const webCard = { [WEB_CARD_ATTR]: "" };
  return (
    <section id="experience" className="shell scroll-mt-24 py-24 sm:py-36">
      <SectionHead eyebrow={d.experience.eyebrow} title={d.experience.title} />

      <ol className="mt-12 border-l border-line sm:mt-14 lg:max-w-[56%]">
        {d.experience.roles.map((role, i) => (
          <Reveal key={role.company} as="li" delay={i * 60}>
            <article
              {...webCard}
              className="relative mb-[24svh] rounded-r-sm border border-l-0 border-line bg-ink py-4 pl-5 pr-4 sm:mb-10 sm:py-6 sm:pl-10 sm:pr-6"
            >
              {/* Timeline node. Only the current role is filled. */}
              <span
                className={`absolute -left-[4.5px] top-[1.4rem] h-2 w-2 rounded-full sm:top-[1.9rem] ${i === 0 ? "bg-mx" : "bg-line-bright"}`}
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
        <div className="mt-4 rounded-sm border border-line bg-ink p-5 sm:p-6 lg:max-w-[56%]">
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
