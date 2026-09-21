"use client";

import { useEffect, useState } from "react";
import { nav, profile } from "@/lib/content";

export function Nav() {
  const [active, setActive] = useState<string>("hero");
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const sections = nav
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
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? "border-b border-line bg-ink/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <nav className="shell flex h-16 items-center justify-between" aria-label="Primary">
        <a
          href="#hero"
          className="font-mono text-sm tracking-[0.2em] text-text transition-colors hover:text-mx"
        >
          <span className="text-mx">$</span> {profile.handle}
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {nav.slice(1).map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
                className={`relative px-3 py-2 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors ${
                  active === item.id ? "text-mx" : "text-text-faint hover:text-text-dim"
                }`}
              >
                {item.label}
                <span
                  className="absolute inset-x-3 -bottom-px h-px bg-mx transition-transform duration-300 origin-left"
                  style={{ transform: active === item.id ? "scaleX(1)" : "scaleX(0)" }}
                />
              </a>
            </li>
          ))}
        </ul>

        <a
          href={`mailto:${profile.email}`}
          className="hairline rounded-sm px-3 py-1.5 font-mono text-[11px] tracking-[0.18em] uppercase text-text-dim transition-colors hover:border-mx-dim hover:text-mx"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
