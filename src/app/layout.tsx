import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { profile } from "@/lib/content";
import "./globals.css";

const sans = Geist({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-mono-face", subsets: ["latin"], display: "swap" });

const description = `${profile.role} focused on ${profile.focus}. ${profile.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://sezaric.com"),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s — ${profile.name}`,
  },
  description,
  keywords: [
    "Sezer Ariç",
    "software engineer",
    "React Native",
    "mobile developer",
    "AI engineer",
    "TypeScript",
  ],
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  openGraph: {
    type: "website",
    title: `${profile.name} — ${profile.role}`,
    description,
    siteName: profile.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050807",
  colorScheme: "dark",
};

/** Structured data, so search engines get the person rather than guessing. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: profile.handle,
  jobTitle: profile.role,
  description,
  email: `mailto:${profile.email}`,
  url: "https://sezaric.com",
  sameAs: [profile.github, profile.linkedin, profile.x].filter(Boolean),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} antialiased`}
      /*
       * The inline script below adds a class to <html> before React hydrates,
       * so the server and client markup differ here by design. This is the
       * documented escape hatch for exactly that, and it only suppresses the
       * warning for this element's own attributes.
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
