import { projects } from "@/lib/content";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

export function Projects() {
  return (
    <section className="shell py-24 sm:py-32">
      <SectionHead eyebrow={projects.eyebrow} title={projects.title} />

      <ul className="mt-14 grid gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
        {projects.items.map((project, i) => (
          <Reveal key={project.name} as="li" delay={(i % 3) * 60}>
            <article className="flex h-full flex-col bg-ink p-6 transition-colors hover:bg-surface-2">
              <h3 className="text-base font-medium text-text">{project.name}</h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-text-dim">
                {project.blurb}
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-sm border border-line px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] uppercase text-text-faint"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
