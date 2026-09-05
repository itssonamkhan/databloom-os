import type { ReactNode } from "react";
import Link from "next/link";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/contact", label: "Contact" },
];

export function LegalPageLayout({
  eyebrow,
  title,
  description,
  children,
}: LegalPageLayoutProps) {
  return (
    <main
      data-databloom-page
      className="min-h-screen px-4 py-8 text-[var(--databloom-text-primary)] sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 text-sm font-black text-[var(--databloom-text-accent)] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
          >
            🌸 DataBloom OS
          </Link>
          <nav
            aria-label="Legal navigation"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold"
          >
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--databloom-text-accent)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <article className="databloom-phase3-surface mt-8 rounded-[2rem] border border-[var(--databloom-border)] p-6 shadow-lg backdrop-blur-xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--databloom-text-accent)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--databloom-text-secondary)]">
            {description}
          </p>

          <div className="mt-8 space-y-8 leading-7 text-[var(--databloom-text-secondary)]">
            {children}
          </div>
        </article>

        <footer className="flex flex-wrap items-center justify-between gap-4 pb-4 pt-8 text-sm text-[var(--databloom-text-secondary)]">
          <Link
            href="/"
            className="font-black text-[var(--databloom-text-accent)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
          >
            Return to DataBloom OS
          </Link>
          <span>Effective 5 September 2026</span>
        </footer>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
      <h2
        id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
        className="text-2xl font-black tracking-tight text-[var(--databloom-text-primary)]"
      >
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
