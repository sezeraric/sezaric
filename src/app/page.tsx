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

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <BackdropLayer />

      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-mx focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-black"
      >
        Skip to content
      </a>

      <Nav />

      <main>
        <Hero />
        <BulletTimeSection />
        {/*
          Everything below sits on a near-opaque layer: the rain drops to a low
          intensity here, but body copy should never depend on that to be
          readable.
        */}
        <div className="relative bg-ink/92">
          <About />
          <Skills />
          <Experience />
          <Work />
          <Projects />
          <AI />
          <Contact />
        </div>
      </main>

      <Footer />
    </>
  );
}
