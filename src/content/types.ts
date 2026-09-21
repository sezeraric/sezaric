import type { Locale } from "@/i18n/config";

/**
 * A post is a list of typed blocks rather than a Markdown string.
 *
 * The site has a strong visual language — pull quotes, diagrams, asides — and
 * a block list keeps each of those a real component with real styling instead
 * of something smuggled through raw HTML.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "aside"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "figure"; chart: ChartId; caption?: string };

export type ChartId = "bubble-shape" | "leftovers";

export type PostBody = {
  title: string;
  /** Shown on the index card and as the meta description. */
  lead: string;
  /** Short kicker above the title. */
  kicker: string;
  blocks: Block[];
};

export type Post = {
  slug: string;
  /** ISO date. Used for sorting and for the <time> element. */
  date: string;
  /** Rough reading time in minutes, per locale. */
  minutes: Record<Locale, number>;
  cover?: { src: string; alt: Record<Locale, string> };
  body: Record<Locale, PostBody>;
};
