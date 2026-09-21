import Image from "next/image";
import type { Dictionary } from "@/i18n";
import { site } from "@/lib/site";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { PillChoice } from "./PillChoice";

export function About({ d }: { d: Dictionary }) {
  return (
    <section id="about" className="shell scroll-mt-24 py-24 sm:py-36">
      <SectionHead eyebrow={d.about.eyebrow} title={d.about.title} />

      <Reveal>
        <div className="mt-10 sm:mt-12">
          <PillChoice d={d} />
        </div>
      </Reveal>

      <div
        id="whoami"
        className="mt-14 grid scroll-mt-24 gap-10 sm:mt-16 md:grid-cols-[18rem_1fr] md:gap-16"
      >
        <Reveal>
          <div>
            <p className="eyebrow">{d.about.whoami}</p>
            {/*
              The cut-out fades into the page's black at the shoulders, so it
              needs no frame — a border would just draw the edge back on.
            */}
            <Image
              src={site.portrait}
              alt={`${site.name}, ${d.meta.role}`}
              width={828}
              height={1289}
              sizes="(max-width: 768px) 45vw, 18rem"
              className="mt-6 w-40 max-w-full sm:w-44 md:w-full"
            />
          </div>
        </Reveal>
        <div className="space-y-5">
          {d.about.bio.map((para, i) => (
            <Reveal key={i} delay={i * 80}>
              <p className="text-base leading-relaxed text-text-dim sm:text-lg">{para}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
