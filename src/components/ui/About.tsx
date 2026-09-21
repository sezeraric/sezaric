import Image from "next/image";
import { about, profile } from "@/lib/content";
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
    accent === "red"
      ? "border-mx-dim/50 hover:border-mx/70"
      : "border-line hover:border-line-bright";
  const dot = accent === "red" ? "bg-mx" : "bg-[#3b6ea5]";

  return (
    <article
      className={`group relative rounded-sm border bg-surface/60 p-6 backdrop-blur-sm transition-colors sm:p-8 ${tone}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-text-faint">
          {label}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-medium text-text sm:text-2xl">{heading}</h3>
      <p className="mt-3 leading-relaxed text-text-dim">{body}</p>
    </article>
  );
}

export function About() {
  return (
    <section id="about" className="shell scroll-mt-24 py-28 sm:py-36">
      <SectionHead eyebrow={about.eyebrow} title={about.title} />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
        <Reveal delay={0}>
          <Pill {...about.blue} label={about.blue.pill} accent="blue" />
        </Reveal>
        <Reveal delay={90}>
          <Pill {...about.red} label={about.red.pill} accent="red" />
        </Reveal>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-[18rem_1fr] md:gap-16">
        <Reveal>
          <div>
            <p className="eyebrow">{"// whoami"}</p>
            {/*
              The cut-out fades into the page's black at the shoulders, so it
              needs no frame — a border would just draw the edge back on.
            */}
            <Image
              src={profile.portrait}
              alt={`${profile.name}, ${profile.role}`}
              width={828}
              height={1289}
              sizes="(max-width: 768px) 60vw, 18rem"
              className="mt-6 w-44 max-w-full md:w-full"
              priority={false}
            />
          </div>
        </Reveal>
        <div className="space-y-5">
          {about.bio.map((para, i) => (
            <Reveal key={i} delay={i * 80}>
              <p className="text-lg leading-relaxed text-text-dim">{para}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
