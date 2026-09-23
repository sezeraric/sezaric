import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import BackdropLayer from "@/components/BackdropLayer";
import SmoothScroll from "@/components/SmoothScroll";
import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/ui/Hero";
import { BulletTimeSection } from "@/components/ui/BulletTimeSection";
import { About } from "@/components/ui/About";
import { Skills } from "@/components/ui/Skills";
import { Experience } from "@/components/ui/Experience";
import { Work } from "@/components/ui/Work";
import { Projects } from "@/components/ui/Projects";
import { AI } from "@/components/ui/AI";
import { Contact, Footer } from "@/components/ui/Contact";
import { RabbitGuide } from "@/components/ui/RabbitGuide";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const d = getDictionary(l);

  return (
    <>
      <SmoothScroll />
      <BackdropLayer />

      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-mx focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-black"
      >
        {d.nav.skipToContent}
      </a>

      <ScrollProgress />
      <Nav d={d} locale={l} />
      <RabbitGuide label={d.hero.followRabbit} caught={d.rabbit.caught} cameo={d.rabbit.cameo} />

      <main>
        <Hero d={d} />
        <BulletTimeSection d={d} />
        {/*
          Everything below sits on a near-opaque layer: the rain drops to a low
          intensity here, but body copy should never depend on that to be
          readable.
        */}
        <div className="relative bg-ink/92">
          <About d={d} />
          <Skills d={d} />
          <Experience d={d} />
          <Work d={d} />
          <Projects d={d} />
          <AI d={d} />
          <Contact d={d} />
        </div>
      </main>

      <Footer d={d} />
    </>
  );
}
