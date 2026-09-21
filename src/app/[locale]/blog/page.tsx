import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary, formatCount } from "@/i18n";
import { sortedPosts } from "@/content/posts";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { LoopVideo } from "@/components/blog/LoopVideo";
import { Reveal } from "@/components/ui/Reveal";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return {
    title: d.blog.title,
    description: d.blog.lead,
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { tr: "/tr/blog", en: "/en/blog", "x-default": "/en/blog" },
    },
  };
}

export default async function BlogIndex({ params }: PageProps<"/[locale]/blog">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l = locale as Locale;
  const d = getDictionary(l);

  return (
    <>
      <BlogHeader d={d} locale={l} />

      <main className="pb-24 sm:pb-32">
        <section className="relative overflow-hidden border-b border-line">
          <LoopVideo
            src="/blog-loop.mp4"
            poster="/blog-loop-poster.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          {/* Keeps the headline readable over whatever frame is on screen. */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/55"
            aria-hidden="true"
          />
          <div className="shell relative flex min-h-[46svh] flex-col justify-end py-16 sm:min-h-[52svh] sm:py-24">
            <p className="eyebrow">{d.blog.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2rem,6.5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-text">
              {d.blog.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-text-dim sm:text-lg">
              {d.blog.lead}
            </p>
          </div>
        </section>

        <div className="shell pt-12 sm:pt-16">
          {sortedPosts.length === 0 ? (
            <p className="text-text-dim">{d.blog.empty}</p>
          ) : (
            <ul className="grid gap-px overflow-hidden rounded-sm border border-line bg-line">
              {sortedPosts.map((post, i) => {
                const body = post.body[l];
                return (
                  <Reveal key={post.slug} as="li" delay={i * 70}>
                    <Link
                      href={`/${l}/blog/${post.slug}`}
                      className="group block bg-ink p-6 transition-colors hover:bg-surface-2 sm:p-8"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
                        <span className="text-mx-dim">{body.kicker}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={post.date}>{post.date}</time>
                        <span aria-hidden="true">·</span>
                        <span>{formatCount(d.blog.readingTime, post.minutes[l])}</span>
                      </div>
                      <h2 className="mt-4 max-w-2xl text-[clamp(1.35rem,3.6vw,2rem)] font-semibold leading-tight tracking-[-0.015em] text-text transition-colors group-hover:text-mx-soft">
                        {body.title}
                      </h2>
                      <p className="mt-3 max-w-2xl leading-relaxed text-text-dim">{body.lead}</p>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
