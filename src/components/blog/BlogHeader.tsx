import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { LocaleSwitch } from "@/components/ui/LocaleSwitch";

export function BlogHeader({ d, locale }: { d: Dictionary; locale: Locale }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-md">
      <nav className="shell flex h-16 items-center justify-between gap-3" aria-label="Primary">
        <Link
          href={`/${locale}`}
          className="font-mono text-sm tracking-[0.2em] text-text transition-colors hover:text-mx"
        >
          <span className="text-mx">$</span> {site.handle}
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href={`/${locale}`}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-faint transition-colors hover:text-mx"
          >
            {d.nav.backHome}
          </Link>
          <LocaleSwitch current={locale} label={d.nav.languageLabel} />
        </div>
      </nav>
    </header>
  );
}
