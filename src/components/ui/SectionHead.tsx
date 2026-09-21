import { Reveal } from "./Reveal";
import { ScrambleText } from "./ScrambleText";

export function SectionHead({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="max-w-3xl">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <Reveal delay={60}>
        <ScrambleText
          as="h2"
          text={title}
          className="mt-4 block text-[clamp(1.9rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-text"
        />
      </Reveal>
      {lead && (
        <Reveal delay={120}>
          <p className="mt-6 text-lg leading-relaxed text-text-dim">{lead}</p>
        </Reveal>
      )}
    </header>
  );
}
