import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary, formatCount } from "@/i18n";
import { getPost, sortedPosts } from "@/content/posts";
import { site } from "@/lib/site";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { Prose } from "@/components/blog/Prose";

export function generateStaticParams() {
  return locales.flatMap((locale) => sortedPosts.map((post) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = getPost(slug);
  if (!post) return {};
  const body = post.body[locale];

  return {
    title: body.title,
    description: body.lead,
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        tr: `/tr/blog/${slug}`,
        en: `/en/blog/${slug}`,
        "x-default": `/en/blog/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: body.title,
      description: body.lead,
      publishedTime: post.date,
      authors: [site.name],
      images: post.cover ? [post.cover.src] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const post = getPost(slug);
  if (!post) notFound();

  const l = locale as Locale;
  const d = getDictionary(l);
  const body = post.body[l];
  const other: Locale = l === "tr" ? "en" : "tr";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: body.title,
    description: body.lead,
    datePublished: post.date,
    inLanguage: d.meta.htmlLang,
    author: { "@type": "Person", name: site.name, url: site.url },
    image: post.cover ? `${site.url}${post.cover.src}` : undefined,
  };

  return (
    <>
      <BlogHeader d={d} locale={l} />

      <main className="pb-24 sm:pb-32">
        <article>
          <header className="shell pt-12 sm:pt-20">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
              <span className="text-mx-dim">{body.kicker}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.date}>{post.date}</time>
              <span aria-hidden="true">·</span>
              <span>{formatCount(d.blog.readingTime, post.minutes[l])}</span>
            </div>

            <h1 className="mt-5 max-w-3xl text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.02em] text-text">
              {body.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-dim">{body.lead}</p>

            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-text-faint">
              {d.blog.alsoIn}{" "}
              <Link
                href={`/${other}/blog/${post.slug}`}
                hrefLang={other}
                className="text-mx-dim underline-offset-4 transition-colors hover:text-mx hover:underline"
              >
                {other === "tr" ? "Türkçe" : "English"}
              </Link>
            </p>
          </header>

          {post.cover && (
            <div className="shell mt-10 sm:mt-14">
              <Image
                src={post.cover.src}
                alt={post.cover.alt[l]}
                width={1600}
                height={900}
                priority
                sizes="(max-width: 768px) 100vw, 78rem"
                className="w-full rounded-sm border border-line"
              />
            </div>
          )}

          {/* A measure of roughly 70 characters; longer lines lose the reader. */}
          <div className="shell mt-12 sm:mt-16">
            <div className="max-w-[46rem]">
              <Prose blocks={body.blocks} d={d} />
            </div>
          </div>
        </article>

        <div className="shell mt-16 border-t border-line pt-8">
          <Link
            href={`/${l}/blog`}
            className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-faint transition-colors hover:text-mx"
          >
            <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">←</span>
            {d.blog.backToList}
          </Link>
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
