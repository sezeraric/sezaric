import type { Dictionary } from "@/i18n";
import { Reveal } from "./Reveal";

export function Skills({ d }: { d: Dictionary }) {
  return (
    <section className="shell py-16 sm:py-24">
      <Reveal>
        <p className="eyebrow">{d.skills.eyebrow}</p>
      </Reveal>

      <dl className="mt-10 divide-y divide-line border-y border-line">
        {d.skills.groups.map((group, i) => (
          <Reveal key={group.group} as="div" delay={i * 60}>
            <div className="grid gap-3 py-6 md:grid-cols-[14rem_1fr] md:gap-8">
              <dt className="font-mono text-xs uppercase tracking-[0.2em] text-mx-dim">
                {group.group}
              </dt>
              <dd className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-sm border border-line px-2.5 py-1 font-mono text-xs text-text-dim transition-colors hover:border-mx-dim hover:text-text"
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
