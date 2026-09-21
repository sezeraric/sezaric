import { contact, profile } from "@/lib/content";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

type Link = { label: string; href: string; value: string };

const links: Link[] = [
  { label: "Email", href: `mailto:${profile.email}`, value: profile.email },
  { label: "GitHub", href: profile.github, value: `@${profile.handle}` },
  ...(profile.linkedin
    ? [{ label: "LinkedIn", href: profile.linkedin, value: "Profile" }]
    : []),
  ...(profile.x ? [{ label: "X", href: profile.x, value: "Profile" }] : []),
];

export function Contact() {
  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-line bg-surface/30 py-28 sm:py-36"
    >
      <div className="shell">
        <SectionHead eyebrow={contact.eyebrow} title={contact.title} lead={contact.body} />

        <Reveal delay={120}>
          <a
            href={`mailto:${profile.email}`}
            className="group mt-12 inline-flex items-center gap-4 rounded-sm border border-mx-dim/60 bg-mx-deep/30 px-6 py-4 font-mono text-sm tracking-[0.12em] uppercase text-mx transition-all hover:border-mx hover:bg-mx-deep/60"
          >
            {contact.cta}
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </a>
        </Reveal>

        <dl className="mt-16 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link, i) => (
            <Reveal key={link.label} as="div" delay={i * 60}>
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                className="block h-full bg-ink px-5 py-6 transition-colors hover:bg-surface-2"
              >
                <dt className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-faint">
                  {link.label}
                </dt>
                <dd className="mt-2 truncate text-sm text-text transition-colors group-hover:text-mx">
                  {link.value}
                </dd>
              </a>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-3 py-8 font-mono text-[11px] tracking-[0.15em] uppercase text-text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="text-text-faint/70">
          Built with Next.js, three.js and too much coffee
        </p>
      </div>
    </footer>
  );
}
