import Image from "next/image";
import { Reveal } from "./Reveal";

export type Shot = { src: string; alt: string; caption: string };

/** Visual order, left to right: the first shot is the one that takes the centre. */
const ORDER = [1, 0, 2] as const;

/**
 * The shipped app's screens, side by side: one in front in the middle, one
 * either side of it, fanned back.
 *
 * Plain markup and CSS — no canvas. The phones start folded behind the middle
 * one and fan out as the row scrolls into view, driven by the same reveal
 * attribute as everything else on the page, so it costs nothing on a phone and
 * still reads as three screens if scripting never runs.
 */
export function ScreensFan({ shots, label }: { shots: Shot[]; label: string }) {
  const placed = ORDER.map((i) => shots[i]).filter(Boolean);

  return (
    <div>
      <p className="eyebrow">{label}</p>

      <Reveal className="fan mt-8 sm:mt-10">
        <div className="flex items-end justify-center">
          {placed.map((shot, slot) => {
            const side = slot === 0 ? "left" : slot === 2 ? "right" : "centre";
            return (
              <figure
                key={shot.src}
                className={`fan-phone fan-${side} relative ${
                  side === "centre"
                    ? "z-20 w-[46%] sm:w-[31%]"
                    : "z-10 w-[37%] sm:w-[25%]"
                } ${side === "left" ? "-mr-[9%] sm:-mr-[4%]" : ""} ${
                  side === "right" ? "-ml-[9%] sm:-ml-[4%]" : ""
                }`}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={720}
                  height={1566}
                  sizes="(max-width: 640px) 46vw, 20rem"
                  className="w-full rounded-[1.1rem] border border-line bg-ink shadow-[0_24px_60px_rgba(0,0,0,0.75)] sm:rounded-[1.4rem]"
                />
              </figure>
            );
          })}
        </div>
      </Reveal>

      <ol className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-6">
        {placed.map((shot, slot) => (
          <li key={shot.src} className="flex gap-3 font-mono text-[11px] leading-relaxed text-text-faint">
            <span className="text-mx-dim">{String(slot + 1).padStart(2, "0")}</span>
            <span>{shot.caption}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
