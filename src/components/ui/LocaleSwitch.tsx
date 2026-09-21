"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

/**
 * Swaps the locale segment of the current path, so switching language keeps
 * you on the page you were reading instead of dumping you at the home page.
 *
 * Rendered as real links, not buttons: each language has its own URL, and a
 * visitor should be able to open, copy or share either one.
 */
export function LocaleSwitch({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() || `/${current}`;

  const hrefFor = (locale: Locale) => {
    const parts = pathname.split("/");
    // parts[0] is "" because the path starts with a slash.
    parts[1] = locale;
    return parts.join("/") || `/${locale}`;
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden="true" className="text-text-faint/50">/</span>}
          <Link
            href={hrefFor(locale)}
            hrefLang={locale}
            aria-current={locale === current ? "true" : undefined}
            title={localeNames[locale]}
            className={`px-1 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
              locale === current ? "text-mx" : "text-text-faint hover:text-text-dim"
            }`}
          >
            {locale}
          </Link>
        </span>
      ))}
    </div>
  );
}
