import { en } from "./dictionaries/en";
import { tr } from "./dictionaries/tr";
import type { Locale } from "./config";

export type { Dictionary, BootLine } from "./dictionaries/en";

const dictionaries = { en, tr } as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

/**
 * Fills a `{n}` placeholder in a dictionary string.
 *
 * Dictionaries hold data, never functions: they are passed into client
 * components, and a function cannot cross that boundary.
 */
export function formatCount(template: string, n: number): string {
  return template.replace("{n}", String(n));
}
