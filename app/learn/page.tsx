import type { Metadata } from "next";
import Link from "next/link";

import { getPublishedArticles } from "@/lib/contentArticles";

export const metadata: Metadata = {
  title: "Data Analytics Learning Resources",
  description:
    "A growing collection of practical data analytics guides covering Excel, SQL, Power BI, statistics, interviews, and career preparation.",
  alternates: {
    canonical: "https://www.databloomos.com/learn",
  },
};

function formatPublishedDate(value: string | null) {
  if (!value) return "Published recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Published recently";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function LearnPage() {
  const articles = await getPublishedArticles();

  return (
    <main
      data-databloom-page
      className="min-h-screen px-4 py-8 text-[var(--databloom-text-primary)] sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 text-sm font-black text-[var(--databloom-text-accent)] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
          >
            🌸 DataBloom OS
          </Link>
          <span className="rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 text-sm font-bold text-[var(--databloom-text-secondary)] backdrop-blur-xl">
            Practical data guides
          </span>
        </header>

        <section className="databloom-phase3-gradient-surface mt-8 rounded-[2rem] border border-[var(--databloom-border)] p-6 shadow-lg backdrop-blur-xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--databloom-text-accent)]">
            Learn with purpose
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Data Analytics Learning Resources
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--databloom-text-secondary)] sm:text-xl">
            Explore practical guides that help you build data skills, prepare for
            interviews, and explain your work with confidence.
          </p>
        </section>

        <section className="mt-8" aria-labelledby="learn-guides-heading">
          <div className="mb-5 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--databloom-text-accent)]">
              Resources
            </p>
            <h2
              id="learn-guides-heading"
              className="mt-2 text-3xl font-black tracking-tight sm:text-4xl"
            >
              Guides for your next step
            </h2>
          </div>

          {articles.length === 0 ? (
            <div className="databloom-phase3-surface rounded-[2rem] border border-[var(--databloom-border)] p-8 text-center shadow-sm backdrop-blur-xl sm:p-10">
              <p className="text-3xl" aria-hidden="true">
                🌱
              </p>
              <h3 className="mt-3 text-2xl font-black">
                New guides are on the way
              </h3>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-[var(--databloom-text-secondary)]">
                Check back soon for practical learning resources from DataBloom OS.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="databloom-phase3-surface flex min-w-0 flex-col rounded-[2rem] border border-[var(--databloom-border)] p-6 shadow-sm backdrop-blur-xl"
                >
                  <p className="text-sm font-bold text-[var(--databloom-text-secondary)]">
                    Published {formatPublishedDate(article.published_at)}
                  </p>
                  <h3 className="mt-3 text-2xl font-black leading-tight">
                    {article.title}
                  </h3>
                  <p className="mt-3 flex-1 leading-7 text-[var(--databloom-text-secondary)]">
                    {article.excerpt}
                  </p>
                  <Link
                    href={`/learn/${article.slug}`}
                    className="mt-6 inline-flex min-h-11 w-fit items-center justify-center rounded-2xl bg-[var(--databloom-action)] px-4 py-2 font-black text-[var(--databloom-text-on-accent)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--databloom-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--databloom-focus)]"
                  >
                    Read guide →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="pb-4 pt-8 text-center text-sm text-[var(--databloom-text-secondary)]">
          <Link
            href="/"
            className="font-black text-[var(--databloom-text-accent)] underline-offset-4 hover:underline"
          >
            Return to DataBloom OS
          </Link>
        </footer>
      </div>
    </main>
  );
}
