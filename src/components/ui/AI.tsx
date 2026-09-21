import { ai } from "@/lib/content";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

export function AI() {
  return (
    <section id="ai" className="shell scroll-mt-24 py-28 sm:py-36">
      <SectionHead eyebrow={ai.eyebrow} title={ai.title} lead={ai.body} />

      <ol className="mt-14 space-y-px overflow-hidden rounded-sm border border-line bg-line">
        {ai.notes.map((note, i) => (
          <Reveal key={note.title} as="li" delay={i * 80}>
            <div className="grid gap-3 bg-ink p-6 sm:p-8 md:grid-cols-[16rem_1fr] md:gap-10">
              <h3 className="flex items-baseline gap-3 text-lg font-medium text-text">
                <span className="font-mono text-xs text-mx-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {note.title}
              </h3>
              <p className="leading-relaxed text-text-dim">{note.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
