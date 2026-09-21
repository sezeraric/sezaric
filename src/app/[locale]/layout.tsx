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
      <head>
        {/*
          Marks scripting AND IntersectionObserver as available, before first
          paint. The scroll-reveal styles hang off this class, so content can
          never be hidden by an animation that has no way to run.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if ('IntersectionObserver' in window) document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className="crt min-h-svh">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
