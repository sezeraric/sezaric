import type { Dictionary } from "@/i18n";
import { site } from "@/lib/site";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

type Link = { label: string; href: string; value: string };

export function Contact({ d }: { d: Dictionary }) {
  const links: Link[] = [
    { label: d.contact.links.email, href: `mailto:${site.email}`, value: site.email },
    { label: d.contact.links.github, href: site.github, value: `@${site.handle}` },
    ...(site.linkedin
      ? [{ label: d.contact.links.linkedin, href: site.linkedin, value: d.contact.profileLabel }]
      : []),
    ...(site.x ? [{ label: d.contact.links.x, href: site.x, value: d.contact.profileLabel }] : []),
  ];

  return (
    <section id="contact" className="scroll-mt-24 border-t border-line bg-surface/30 py-24 sm:py-36">
      <div className="shell">
        <SectionHead eyebrow={d.contact.eyebrow} title={d.contact.title} lead={d.contact.body} />

        <Reveal delay={120}>
          <a
            href={`mailto:${site.email}`}
            className="group mt-10 inline-flex items-center gap-4 rounded-sm border border-mx-dim/60 bg-mx-deep/30 px-5 py-4 font-mono text-xs uppercase tracking-[0.12em] text-mx transition-all hover:border-mx hover:bg-mx-deep/60 sm:mt-12 sm:px-6 sm:text-sm"
          >
            {d.contact.cta}
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </a>
        </Reveal>

        <dl className="mt-14 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link, i) => (
            <Reveal key={link.label} as="div" delay={i * 60}>
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                className="block h-full bg-ink px-5 py-6 transition-colors hover:bg-surface-2"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-faint">{link.label}</dt>
                <dd className="mt-2 truncate text-sm text-text">{link.value}</dd>
              </a>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Footer({ d }: { d: Dictionary }) {
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-3 py-8 font-mono text-[11px] uppercase tracking-[0.15em] text-text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {site.name}</p>
        <p className="text-text-faint/70">{d.footer.built}</p>
      </div>
    </footer>
  );
}
