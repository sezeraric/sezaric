"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { LocaleSwitch } from "./LocaleSwitch";

export function Nav({ d, locale }: { d: Dictionary; locale: Locale }) {
  const [active, setActive] = useState<string>("hero");
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const sections = d.nav.items
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => el !== null);

    const io = new IntersectionObserver(
      (entries) => {
        // The section covering the middle of the viewport wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.1, 0.5, 1] },
    );
    sections.forEach((s) => io.observe(s));

    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [d]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? "border-b border-line bg-ink/85 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="shell flex h-16 items-center justify-between gap-3" aria-label="Primary">
        <Link
          href={`/${locale}`}
          className="shrink-0 font-mono text-sm tracking-[0.2em] text-text transition-colors hover:text-mx"
        >
          <span className="text-mx">$</span> {site.handle}
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {d.nav.items.slice(1).map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
                className={`relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  active === item.id ? "text-mx" : "text-text-faint hover:text-text-dim"
                }`}
              >
                {item.label}
                <span
                  className="absolute inset-x-3 -bottom-px h-px origin-left bg-mx transition-transform duration-300"
                  style={{ transform: active === item.id ? "scaleX(1)" : "scaleX(0)" }}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${locale}/blog`}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-faint transition-colors hover:text-mx"
          >
            {d.nav.blog}
          </Link>
          <LocaleSwitch current={locale} label={d.nav.languageLabel} />
          <a
            href={`mailto:${site.email}`}
            className="hairline hidden rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim transition-colors hover:border-mx-dim hover:text-mx sm:block"
          >
            {d.nav.contact}
          </a>
        </div>
      </nav>
    </header>
  );
}
