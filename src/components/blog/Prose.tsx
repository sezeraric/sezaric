import Image from "next/image";
import type { Block, ChartId } from "@/content/types";
import type { Dictionary } from "@/i18n";
import { BubbleShape, Leftovers } from "./Charts";

/**
 * Renders a post's blocks.
 *
 * `**bold**` inside a paragraph is the only inline markup, handled here rather
 * than by pulling in a Markdown parser for one feature.
 */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-medium text-text">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Figure({ chart, d }: { chart: ChartId; d: Dictionary }) {
  if (chart === "bubble-shape") return <BubbleShape d={d} />;
  return <Leftovers d={d} />;
}

export function Prose({ blocks, d }: { blocks: Block[]; d: Dictionary }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                className="!mt-14 text-[clamp(1.35rem,3.5vw,1.9rem)] font-semibold leading-tight tracking-[-0.01em] text-text"
              >
                {block.text}
              </h2>
            );

          case "p":
            return (
              <p key={i} className="text-base leading-[1.75] text-text-dim sm:text-[1.0625rem]">
                <Rich text={block.text} />
              </p>
            );

          case "list":
            return (
              <ul key={i} className="space-y-3">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3 leading-[1.7] text-text-dim">
                    <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-mx-dim" />
                    <span><Rich text={item} /></span>
                  </li>
                ))}
              </ul>
            );

          case "quote":
            return (
              <blockquote
                key={i}
                className="!my-10 border-l-2 border-mx-dim pl-5 text-[clamp(1.125rem,2.6vw,1.5rem)] font-medium leading-snug text-text sm:pl-7"
              >
                {block.text}
              </blockquote>
            );

          case "aside":
            return (
              <aside
                key={i}
                className="!my-10 rounded-sm border border-line bg-surface/50 p-5 text-sm leading-relaxed text-text-dim sm:p-6"
              >
                <Rich text={block.text} />
              </aside>
            );

          case "image":
            return (
              <figure key={i} className="!my-12">
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={1600}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 46rem"
                  className="w-full rounded-sm border border-line"
                />
                {block.caption && (
                  <figcaption className="mt-3 font-mono text-[11px] leading-relaxed text-text-faint">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "figure":
            return (
              <figure key={i} className="!my-12 rounded-sm border border-line bg-surface/30 p-5 sm:p-7">
                <Figure chart={block.chart} d={d} />
                {block.caption && (
                  <figcaption className="mt-4 font-mono text-[11px] leading-relaxed text-text-faint">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
        }
      })}
    </div>
  );
}
