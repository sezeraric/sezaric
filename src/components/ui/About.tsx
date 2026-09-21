import Image from "next/image";
import type { Dictionary } from "@/i18n";
import { site } from "@/lib/site";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

function Pill({
  label,
  heading,
  body,
  accent,
}: {
  label: string;
  heading: string;
  body: string;
  accent: "blue" | "red";
}) {
  const tone =
    accent === "red" ? "border-mx-dim/50 hover:border-mx/70" : "border-line hover:border-line-bright";
  const dot = accent === "red" ? "bg-mx" : "bg-[#3b6ea5]";

  return (
    <article className={`group relative h-full rounded-sm border bg-surface/60 p-6 backdrop-blur-sm transition-colors sm:p-8 ${tone}`}>
      <div className="flex items-center gap-2.5">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-faint">{label}</span>
      </div>
      <h3 className="mt-5 text-xl font-medium text-text sm:text-2xl">{heading}</h3>
      <p className="mt-3 leading-relaxed text-text-dim">{body}</p>
    </article>
  );
}

export function About({ d }: { d: Dictionary }) {
  return (
    <section id="about" className="shell scroll-mt-24 py-24 sm:py-36">
      <SectionHead eyebrow={d.about.eyebrow} title={d.about.title} />

      <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6">
        <Reveal><Pill {...d.about.blue} label={d.about.blue.pill} accent="blue" /></Reveal>
        <Reveal delay={90}><Pill {...d.about.red} label={d.about.red.pill} accent="red" /></Reveal>
      </div>

      <div className="mt-14 grid gap-10 sm:mt-16 md:grid-cols-[18rem_1fr] md:gap-16">
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
