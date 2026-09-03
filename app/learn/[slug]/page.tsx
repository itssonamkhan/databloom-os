import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getPublishedArticleBySlug } from "@/lib/contentArticles";

type LearnArticlePageProps = {
  params: Promise<{ slug: string }>;
};

type MarkdownBlock =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "unordered-list"; items: string[] }
  | { kind: "ordered-list"; items: string[] }
  | { kind: "code"; text: string };

const INLINE_TOKEN_PATTERN =
  /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;

function safeInternalHref(value: string) {
  const href = value.trim();
  return /^\/(?!\/)[^\s"'<>]*$/.test(href) ? href : null;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_TOKEN_PATTERN)) {
    const token = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));

    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const href = safeInternalHref(linkMatch[2]);
      if (href) {
        nodes.push(
          <Link
            key={`link-${index}`}
            href={href}
            className="font-black text-[var(--databloom-text-accent)] underline-offset-4 hover:underline"
          >
            {renderInline(linkMatch[1])}
          </Link>,
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={`strong-${index}`}>{token.slice(2, -2)}</strong>,
      );
    } else if (token.startsWith("*")) {
      nodes.push(<em key={`em-${index}`}>{token.slice(1, -1)}</em>);
    } else {
      nodes.push(token);
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function isHeading(line: string) {
  return /^#{1,6}\s+/.test(line);
}

function isUnorderedItem(line: string) {
  return /^[-*]\s+/.test(line);
}

function isOrderedItem(line: string) {
  return /^\d+\.\s+/.test(line);
}

function parseMarkdown(content: string): MarkdownBlock[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ kind: "code", text: codeLines.join("\n") });
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        kind: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      index += 1;
      continue;
    }

    if (isUnorderedItem(line)) {
      const items: string[] = [];
      while (index < lines.length && isUnorderedItem(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "unordered-list", items });
      continue;
    }

    if (isOrderedItem(line)) {
      const items: string[] = [];
      while (index < lines.length && isOrderedItem(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "ordered-list", items });
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !isHeading(lines[index].trim()) &&
      !isUnorderedItem(lines[index].trim()) &&
      !isOrderedItem(lines[index].trim()) &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ kind: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function renderMarkdown(content: string, articleTitle: string) {
  const blocks = parseMarkdown(content);
  let skippedArticleTitle = false;

  return blocks.map((block, index) => {
    if (
      block.kind === "heading" &&
      block.level === 1 &&
      block.text === articleTitle &&
      !skippedArticleTitle
    ) {
      skippedArticleTitle = true;
      return null;
    }

    if (block.kind === "heading") {
      const className =
        "mt-8 text-2xl font-black tracking-tight first:mt-0 sm:text-3xl";
      if (block.level <= 2) {
        return (
          <h2 key={`heading-${index}`} className={className}>
            {renderInline(block.text)}
          </h2>
        );
      }
      return (
        <h3 key={`heading-${index}`} className={className}>
          {renderInline(block.text)}
        </h3>
      );
    }

    if (block.kind === "paragraph") {
      return (
        <p
          key={`paragraph-${index}`}
          className="text-base leading-8 text-[var(--databloom-text-secondary)] sm:text-lg"
        >
          {renderInline(block.text)}
        </p>
      );
    }

    if (block.kind === "unordered-list" || block.kind === "ordered-list") {
      const List = block.kind === "unordered-list" ? "ul" : "ol";
      return (
        <List
          key={`list-${index}`}
          className="space-y-3 pl-6 text-base leading-8 text-[var(--databloom-text-secondary)] sm:text-lg"
        >
          {block.items.map((item, itemIndex) => (
            <li key={`item-${index}-${itemIndex}`}>
              {renderInline(item)}
            </li>
          ))}
        </List>
      );
    }

    return (
      <pre
        key={`code-${index}`}
        className="overflow-x-auto rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4 text-sm leading-7 text-[var(--databloom-text-primary)]"
      >
        <code>{block.text}</code>
      </pre>
    );
  });
}

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

function extractInternalLinks(content: string) {
  return new Set(
    [...content.matchAll(/\]\((\/[^)\s]*)\)/g)]
      .map((match) => safeInternalHref(match[1]))
      .filter((href): href is string => href !== null),
  );
}

function internalLinkLabel(href: string) {
  if (href === "/") return "DataBloom OS";
  if (href === "/interview-hub") return "Interview Hub";

  const segment = href.split("/").filter(Boolean).at(-1) ?? href;
  return segment.replace(/-/g, " ");
}

export async function generateMetadata({
  params,
}: LearnArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return {
      title: "Learning resource not found",
      robots: { index: false, follow: false },
    };
  }

  const title = article.seo_title?.trim() || article.title;
  const description = article.meta_description?.trim() || article.excerpt;
  const canonical = `https://www.databloomos.com/learn/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      publishedTime: article.published_at ?? undefined,
    },
  };
}

export default async function LearnArticlePage({
  params,
}: LearnArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const contentLinks = extractInternalLinks(article.content);
  const relatedLinks = article.internal_links.filter(
    (href) => safeInternalHref(href) && !contentLinks.has(href),
  );

  return (
    <main
      data-databloom-page
      className="min-h-screen px-4 py-8 text-[var(--databloom-text-primary)] sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/learn"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 text-sm font-black text-[var(--databloom-text-accent)] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[var(--databloom-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
          >
            ← All learning resources
          </Link>
          <Link
            href="/"
            className="text-sm font-black text-[var(--databloom-text-accent)] underline-offset-4 hover:underline"
          >
            🌸 DataBloom OS
          </Link>
        </header>

        <article className="databloom-phase3-surface mt-8 rounded-[2rem] border border-[var(--databloom-border)] p-6 shadow-lg backdrop-blur-xl sm:p-10">
          <p className="text-sm font-bold text-[var(--databloom-text-secondary)]">
            Published {formatPublishedDate(article.published_at)}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            {article.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--databloom-text-secondary)] sm:text-xl">
            {article.excerpt}
          </p>

          <div className="mt-8 space-y-5 border-t border-[var(--databloom-border)] pt-8">
            {renderMarkdown(article.content, article.title)}
          </div>

          {relatedLinks.length > 0 ? (
            <aside className="mt-10 border-t border-[var(--databloom-border)] pt-6">
              <h2 className="text-xl font-black">Explore DataBloom</h2>
              <ul className="mt-3 flex flex-wrap gap-3">
                {relatedLinks.map((href) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="inline-flex min-h-10 items-center rounded-xl bg-[var(--databloom-action)] px-4 py-2 font-black text-[var(--databloom-text-on-accent)] transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--databloom-focus)]"
                    >
                      {internalLinkLabel(href)}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </article>

        <footer className="pb-4 pt-8 text-center text-sm text-[var(--databloom-text-secondary)]">
          <Link
            href="/learn"
            className="font-black text-[var(--databloom-text-accent)] underline-offset-4 hover:underline"
          >
            Browse all learning resources
          </Link>
        </footer>
      </div>
    </main>
  );
}
