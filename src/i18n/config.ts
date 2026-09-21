export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];

/**
 * Used when the visitor's language is neither Turkish nor English.
 *
 * English rather than Turkish: an unmatched Accept-Language almost always
 * means someone from outside Turkey, and English is the safer fallback for
 * them. Turkish visitors are matched explicitly.
 */
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Picks a locale from an Accept-Language header.
 *
 * Parses quality values properly rather than reading the first tag: browsers
 * send things like `de,tr;q=0.9,en;q=0.8`, where the first tag is not the one
 * the visitor most wants from *this* site.
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return { tag: tag.toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    // Match the primary subtag, so tr-TR and en-GB both resolve.
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }

  return defaultLocale;
}

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
};
