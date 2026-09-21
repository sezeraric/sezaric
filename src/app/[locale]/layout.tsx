import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { site } from "@/lib/site";
import "../globals.css";

const sans = Geist({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-mono-face", subsets: ["latin"], display: "swap" });

/** Both languages are prerendered; nothing here needs a server at request time. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  const description = `${d.meta.role} — ${d.meta.focus}. ${d.meta.tagline}`;

  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} — ${d.meta.role}`, template: `%s — ${site.name}` },
    description,
    keywords: [...d.meta.keywords],
    authors: [{ name: site.name, url: site.github }],
    creator: site.name,
    alternates: {
      canonical: `/${locale}`,
      // Tells search engines these are the same page in two languages rather
      // than duplicates competing with each other.
      languages: {
        tr: "/tr",
        en: "/en",
        "x-default": "/en",
      },
    },
    openGraph: {
      type: "website",
      title: `${site.name} — ${d.meta.role}`,
      description,
      siteName: site.name,
      locale: locale === "tr" ? "tr_TR" : "en_US",
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title: `${site.name} — ${d.meta.role}`, description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#050807",
  colorScheme: "dark",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const d = getDictionary(locale as Locale);
  const description = `${d.meta.role} — ${d.meta.focus}. ${d.meta.tagline}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    alternateName: site.handle,
    jobTitle: d.meta.role,
    description,
    email: `mailto:${site.email}`,
    url: site.url,
    sameAs: [site.github, site.linkedin, site.x].filter(Boolean),
  };

  return (
    <html
      lang={d.meta.htmlLang}
      className={`${sans.variable} ${mono.variable} antialiased`}
      /*
       * The inline script below adds a class to <html> before React hydrates,
       * so server and client markup differ here by design. This suppresses the
       * warning for this element's own attributes only.
       */
      suppressHydrationWarning
    >
      <body className="crt min-h-svh">
        {/*
          Recovery for a stale cached document. Build chunks are content-hashed,
          so a browser holding older HTML asks for script URLs that no longer
          exist; they 404, nothing mounts, and the visitor gets a blank page —
          invisible to error boundaries, because it happens before React runs.
          One reload fixes it, and a sessionStorage guard makes a second
          impossible, so a genuinely broken deploy degrades to a flicker rather
          than a reload loop.

          `async` is what lets React hoist this into the document head instead
          of complaining that it cannot order a sync script; on an inline
          script the attribute has no effect on when it runs.
        */}
        <script
          async
          dangerouslySetInnerHTML={{
            __html: `
window.addEventListener('error', function (e) {
  var el = e.target;
  if (!el || el.tagName !== 'SCRIPT') return;
  if (!el.src || el.src.indexOf('/_next/static/') === -1) return;
  try {
    if (sessionStorage.getItem('stale-bundle-reload')) return;
    sessionStorage.setItem('stale-bundle-reload', '1');
  } catch (err) {
    return;
  }
  location.reload();
}, true);
            `.trim(),
          }}
        />

        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
