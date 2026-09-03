"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  Check,
  Eye,
  FileText,
  LoaderCircle,
  Plus,
  Save,
  Send,
  X,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import type { ContentArticle } from "@/lib/contentArticles";

type Filter = "all" | "draft" | "published" | "archived";
type ViewMode = "editor" | "preview";

type ArticleForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seo_title: string;
  meta_description: string;
  target_keyword: string;
  status: ContentArticle["status"];
  published_at: string | null;
  internal_links: string[];
};

type MarkdownBlock =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "code"; text: string };

const EMPTY_FORM: ArticleForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  seo_title: "",
  meta_description: "",
  target_keyword: "",
  status: "draft",
  published_at: null,
  internal_links: [],
};

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
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
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ kind: "code", text: code.join("\n") });
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    const unordered = /^[-*]\s+/.test(line);
    const ordered = /^\d+\.\s+/.test(line);
    if (unordered || ordered) {
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].trim();
        if (unordered && /^[-*]\s+/.test(item)) {
          items.push(item.replace(/^[-*]\s+/, ""));
        } else if (ordered && /^\d+\.\s+/.test(item)) {
          items.push(item.replace(/^\d+\.\s+/, ""));
        } else break;
        index += 1;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,6}\s+/.test(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
  }
  return blocks;
}

function renderInline(text: string) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    return <span key={index}>{token}</span>;
  });
}

function MarkdownPreview({ content }: { content: string }) {
  const blocks = parseMarkdown(content);
  if (blocks.length === 0) {
    return <p className="text-[var(--databloom-text-muted)]">Nothing to preview yet.</p>;
  }
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          const Heading = block.level <= 2 ? "h2" : "h3";
          return (
            <Heading key={index} className="text-2xl font-black tracking-tight">
              {renderInline(block.text)}
            </Heading>
          );
        }
        if (block.kind === "paragraph") {
          return (
            <p key={index} className="leading-8 text-[var(--databloom-text-secondary)]">
              {renderInline(block.text)}
            </p>
          );
        }
        if (block.kind === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={index} className="list-inside list-disc space-y-2 leading-7 text-[var(--databloom-text-secondary)]">
              {block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
            </List>
          );
        }
        return (
          <pre key={index} className="overflow-x-auto rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4 text-sm leading-7 text-[var(--databloom-text-primary)]">
            <code>{block.text}</code>
          </pre>
        );
      })}
    </div>
  );
}

function toForm(article: ContentArticle): ArticleForm {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    seo_title: article.seo_title ?? "",
    meta_description: article.meta_description ?? "",
    target_keyword: article.target_keyword ?? "",
    status: article.status,
    published_at: article.published_at,
    internal_links: article.internal_links,
  };
}

function statusLabel(status: ContentArticle["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClass(status: ContentArticle["status"]) {
  if (status === "published") {
    return "border-emerald-300/70 bg-emerald-100/70 text-emerald-800";
  }
  if (status === "archived") {
    return "border-slate-300/70 bg-slate-100/70 text-slate-700";
  }
  return "border-amber-300/70 bg-amber-100/70 text-amber-800";
}

export default function ContentManager() {
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [newLink, setNewLink] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [loading, setLoading] = useState(true);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/content/articles", { cache: "no-store" });
      const payload = (await response.json()) as ContentArticle[] | { error?: string };
      if (!response.ok || !Array.isArray(payload)) {
        setError("Articles could not be loaded. Please try again.");
        return;
      }
      setArticles(payload);
    } catch {
      setError("Articles could not be loaded. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadArticles();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadArticles]);

  const visibleArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((article) => {
      if (filter !== "all" && article.status !== filter) return false;
      if (!query) return true;
      return [article.title, article.slug, article.target_keyword ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [articles, filter, search]);

  async function selectArticle(article: ContentArticle) {
    setLoadingArticle(true);
    setFieldErrors({});
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/content/articles/${article.id}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as ContentArticle | { error?: string };
      if (!response.ok || !("id" in payload)) {
        setError("That article could not be loaded. Please try again.");
        return;
      }
      setSelectedId(payload.id);
      setForm(toForm(payload));
      setViewMode("editor");
    } catch {
      setError("That article could not be loaded. Please check your connection.");
    } finally {
      setLoadingArticle(false);
    }
  }

  function startNewArticle() {
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setViewMode("editor");
    setFieldErrors({});
    setError("");
    setNotice("");
  }

  function updateField<K extends keyof ArticleForm>(field: K, value: ArticleForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  function validatePublish() {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug.trim())) {
      nextErrors.slug = "Use lowercase words separated by hyphens.";
    }
    if (!form.content.trim()) nextErrors.content = "Content is required.";
    if (!form.seo_title.trim()) nextErrors.seo_title = "SEO title is required.";
    if (!form.meta_description.trim()) nextErrors.meta_description = "Meta description is required.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveArticle(nextStatus: ContentArticle["status"]) {
    setNotice("");
    setError("");
    if (nextStatus === "published" && !validatePublish()) return;
    if (
      nextStatus === "draft" &&
      selectedId &&
      form.status === "published" &&
      !window.confirm("Save this published article as a draft and unpublish it?")
    ) {
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        seo_title: form.seo_title || null,
        meta_description: form.meta_description || null,
        target_keyword: form.target_keyword || null,
        status: nextStatus,
        internal_links: form.internal_links,
      };
      const endpoint = selectedId
        ? `/api/content/articles/${selectedId}`
        : "/api/content/articles";
      const response = await fetch(endpoint, {
        method: selectedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as ContentArticle | { error?: string };
      if (!response.ok || !("id" in payload)) {
        setError("error" in payload && payload.error ? payload.error : "The article could not be saved.");
        return;
      }
      setSelectedId(payload.id);
      setForm(toForm(payload));
      setNotice(nextStatus === "published" ? "Article published successfully." : "Draft saved successfully.");
      await loadArticles();
    } catch {
      setError("The article could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(nextStatus: "draft" | "archived") {
    if (!selectedId) return;
    const prompt = nextStatus === "draft"
      ? "Unpublish this article and move it back to draft?"
      : "Archive this article? It will no longer be public.";
    if (!window.confirm(prompt)) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/content/articles/${selectedId}`, {
        method: nextStatus === "archived" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        ...(nextStatus === "draft" ? { body: JSON.stringify({ status: "draft" }) } : {}),
      });
      const payload = (await response.json()) as ContentArticle | { error?: string };
      if (!response.ok || !("id" in payload)) {
        setError("error" in payload && payload.error ? payload.error : "That status change could not be completed.");
        return;
      }
      setForm(toForm(payload));
      setNotice(nextStatus === "draft" ? "Article moved to draft." : "Article archived.");
      await loadArticles();
    } catch {
      setError("That status change could not be completed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function addLink() {
    const link = newLink.trim();
    if (!/^\/(?!\/)[^\s"'<>]*$/.test(link)) {
      setError("Internal links must be safe paths beginning with '/'.");
      return;
    }
    if (!form.internal_links.includes(link)) {
      updateField("internal_links", [...form.internal_links, link]);
    }
    setNewLink("");
    setError("");
  }

  function removeLink(link: string) {
    updateField("internal_links", form.internal_links.filter((value) => value !== link));
  }

  return (
    <AppLayout>
      <div className="min-w-0 space-y-6">
        <header className="databloom-phase3-gradient-surface overflow-hidden rounded-[2rem] border border-[var(--databloom-border)] p-6 shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--databloom-text-accent)]">Owner workspace</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Content Manager</h1>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--databloom-text-secondary)]">Create, optimize, publish, and manage your DataBloom OS learning resources.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/learn" className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 py-2 font-black text-[var(--databloom-text-accent)] shadow-sm transition hover:bg-[var(--databloom-accent-soft)]"><Eye size={17} aria-hidden="true" /> View Learn</Link>
              <button type="button" onClick={startNewArticle} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[var(--databloom-action)] px-4 py-2 font-black text-[var(--databloom-text-on-accent)] shadow-sm transition hover:bg-[var(--databloom-action-hover)] disabled:opacity-60" disabled={saving}><Plus size={17} aria-hidden="true" /> New Article</button>
            </div>
          </div>
        </header>

        {error ? <div className="flex items-start justify-between gap-3 rounded-2xl border border-rose-300/70 bg-rose-50/80 p-4 text-sm font-semibold text-rose-800" role="alert"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={17} /></button></div> : null}
        {notice ? <div className="flex items-center gap-2 rounded-2xl border border-emerald-300/70 bg-emerald-50/80 p-4 text-sm font-semibold text-emerald-800" role="status"><Check size={17} aria-hidden="true" /> {notice}</div> : null}

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.6fr)]">
          <section className="min-w-0 rounded-[2rem] border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-4 shadow-sm sm:p-5" aria-labelledby="articles-heading">
            <div className="flex items-center justify-between gap-3"><div><h2 id="articles-heading" className="text-2xl font-black">Articles</h2><p className="mt-1 text-sm text-[var(--databloom-text-secondary)]">{articles.length} total</p></div><button type="button" onClick={() => void loadArticles()} className="rounded-xl p-2 text-[var(--databloom-text-accent)] hover:bg-[var(--databloom-accent-soft)]" aria-label="Refresh articles" disabled={loading}><LoaderCircle size={18} className={loading ? "animate-spin" : ""} /></button></div>
            <label className="mt-4 block"><span className="sr-only">Search articles</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, slug, keyword" className="min-h-11 w-full rounded-xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] px-3 text-sm text-[var(--databloom-text-primary)] outline-none focus:ring-2 focus:ring-[var(--databloom-focus)]" /></label>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter articles">{filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${filter === item.value ? "border-[var(--databloom-action)] bg-[var(--databloom-action)] text-[var(--databloom-text-on-accent)]" : "border-[var(--databloom-border)] text-[var(--databloom-text-secondary)] hover:bg-[var(--databloom-accent-soft)]"}`}>{item.label}</button>)}</div>
            <div className="mt-4 space-y-3">{loading ? <p className="rounded-2xl bg-[var(--databloom-glass)] p-4 text-sm text-[var(--databloom-text-secondary)]">Loading articles…</p> : visibleArticles.length === 0 ? <p className="rounded-2xl bg-[var(--databloom-glass)] p-4 text-sm text-[var(--databloom-text-secondary)]">No articles match this view.</p> : visibleArticles.map((article) => <button key={article.id} type="button" onClick={() => void selectArticle(article)} disabled={loadingArticle} className={`block w-full min-w-0 rounded-2xl border p-4 text-left transition ${selectedId === article.id ? "border-[var(--databloom-action)] bg-[var(--databloom-accent-soft)]" : "border-[var(--databloom-border)] bg-[var(--databloom-glass)] hover:border-[var(--databloom-focus)]"}`}><div className="flex items-start gap-3"><FileText size={18} className="mt-0.5 shrink-0 text-[var(--databloom-text-accent)]" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block truncate font-black">{article.title || "Untitled article"}</span><span className="mt-1 block truncate text-xs text-[var(--databloom-text-muted)]">/{article.slug}</span><span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-black ${statusClass(article.status)}`}>{statusLabel(article.status)}</span><span className="mt-2 block text-xs text-[var(--databloom-text-muted)]">Updated {formatDate(article.updated_at)} · Published {formatDate(article.published_at)}</span><span className="mt-1 block truncate text-xs text-[var(--databloom-text-muted)]">Keyword: {article.target_keyword || "Not set"}</span></span><span className="shrink-0 text-xs font-black text-[var(--databloom-text-accent)]">Edit</span></div></button>)}</div>
          </section>

          <section className="min-w-0 rounded-[2rem] border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-4 shadow-sm sm:p-6" aria-labelledby="editor-heading">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--databloom-text-accent)]">{selectedId ? "Edit article" : "New draft"}</p><h2 id="editor-heading" className="mt-1 text-2xl font-black">{viewMode === "preview" ? "Preview" : "Article editor"}</h2></div><div className="flex rounded-xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-1"><button type="button" onClick={() => setViewMode("editor")} className={`rounded-lg px-3 py-2 text-sm font-black ${viewMode === "editor" ? "bg-[var(--databloom-action)] text-[var(--databloom-text-on-accent)]" : "text-[var(--databloom-text-secondary)]"}`}>Edit</button><button type="button" onClick={() => setViewMode("preview")} className={`rounded-lg px-3 py-2 text-sm font-black ${viewMode === "preview" ? "bg-[var(--databloom-action)] text-[var(--databloom-text-on-accent)]" : "text-[var(--databloom-text-secondary)]"}`}>Preview</button></div></div>

            {viewMode === "preview" ? <div className="mt-6"><div className="rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-5"><h3 className="text-3xl font-black tracking-tight">{form.title || "Untitled article"}</h3>{form.excerpt ? <p className="mt-3 text-lg leading-8 text-[var(--databloom-text-secondary)]">{form.excerpt}</p> : null}<div className="mt-6 border-t border-[var(--databloom-border)] pt-6"><MarkdownPreview content={form.content} /></div></div><p className="mt-3 text-sm text-[var(--databloom-text-muted)]">Preview is private and is not a public URL.</p></div> : <div className="mt-6 space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Title" value={form.title} error={fieldErrors.title} onChange={(value) => updateField("title", value)} className="sm:col-span-2" />
                <Field label="Slug" value={form.slug} error={fieldErrors.slug} onChange={(value) => updateField("slug", value)} hint="lowercase-words-with-hyphens" />
                <Field label="Target keyword" value={form.target_keyword} onChange={(value) => updateField("target_keyword", value)} />
                <Field label="Excerpt" value={form.excerpt} onChange={(value) => updateField("excerpt", value)} multiline className="sm:col-span-2" />
              </div>
              <div><label htmlFor="article-content" className="mb-2 block text-sm font-black">Content</label><textarea id="article-content" value={form.content} onChange={(event) => updateField("content", event.target.value)} rows={15} className="w-full rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] p-4 font-mono text-sm leading-7 text-[var(--databloom-text-primary)] outline-none placeholder:text-[var(--databloom-text-muted)] focus:ring-2 focus:ring-[var(--databloom-focus)]" placeholder="# Your guide\n\nUse Markdown headings, lists, bold text, links, and code blocks." />{fieldErrors.content ? <p className="mt-1 text-sm font-semibold text-rose-700">{fieldErrors.content}</p> : null}<p className="mt-2 text-xs text-[var(--databloom-text-muted)]">Use Markdown headings, lists, bold text, links, and code blocks.</p></div>
              <div className="grid gap-5 sm:grid-cols-2"><Field label="SEO title" value={form.seo_title} error={fieldErrors.seo_title} onChange={(value) => updateField("seo_title", value)} /><Field label="Meta description" value={form.meta_description} error={fieldErrors.meta_description} onChange={(value) => updateField("meta_description", value)} multiline /></div>
              <div><label htmlFor="article-status" className="mb-2 block text-sm font-black">Status</label><select id="article-status" value={form.status} onChange={(event) => updateField("status", event.target.value as ArticleForm["status"])} className="min-h-11 rounded-xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] px-3 text-[var(--databloom-text-primary)] outline-none focus:ring-2 focus:ring-[var(--databloom-focus)]"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select>{form.published_at ? <p className="mt-2 text-xs text-[var(--databloom-text-secondary)]">Published {formatDate(form.published_at)}</p> : <p className="mt-2 text-xs text-[var(--databloom-text-muted)]">Not currently published.</p>}<p className="mt-1 text-xs text-[var(--databloom-text-muted)]">Publishing still requires the server-side validation.</p></div>
              <div><label htmlFor="internal-link" className="mb-2 block text-sm font-black">Internal links</label><div className="flex flex-col gap-2 sm:flex-row"><input id="internal-link" value={newLink} onChange={(event) => setNewLink(event.target.value)} placeholder="/interview-hub" className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] px-3 text-sm text-[var(--databloom-text-primary)] outline-none focus:ring-2 focus:ring-[var(--databloom-focus)]" /><button type="button" onClick={addLink} className="min-h-11 rounded-xl border border-[var(--databloom-border)] px-4 font-black text-[var(--databloom-text-accent)] hover:bg-[var(--databloom-accent-soft)]">Add link</button></div><div className="mt-3 flex flex-wrap gap-2">{form.internal_links.map((link) => <span key={link} className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-3 py-1 text-sm"><span className="truncate">{link}</span><button type="button" onClick={() => removeLink(link)} aria-label={`Remove ${link}`}><X size={14} /></button></span>)}</div></div>
              <div className="flex flex-wrap items-center gap-3 border-t border-[var(--databloom-border)] pt-5"><button type="button" onClick={() => void saveArticle("draft")} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] px-4 font-black text-[var(--databloom-text-primary)] hover:bg-[var(--databloom-accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"><Save size={17} aria-hidden="true" /> {saving ? "Saving…" : "Save Draft"}</button><button type="button" onClick={() => void saveArticle("published")} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--databloom-action)] px-4 font-black text-[var(--databloom-text-on-accent)] hover:bg-[var(--databloom-action-hover)] disabled:cursor-not-allowed disabled:opacity-60"><Send size={17} aria-hidden="true" /> Publish</button>{selectedId && form.status === "published" ? <button type="button" onClick={() => void changeStatus("draft")} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--databloom-border)] px-4 font-black text-[var(--databloom-text-secondary)] hover:bg-[var(--databloom-accent-soft)] disabled:opacity-60"><ArrowLeft size={17} aria-hidden="true" /> Unpublish</button> : null}{selectedId && form.status !== "archived" ? <button type="button" onClick={() => void changeStatus("archived")} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-300/70 px-4 font-black text-rose-700 hover:bg-rose-50/70 disabled:opacity-60"><Archive size={17} aria-hidden="true" /> Archive</button> : null}</div>
            </div>}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function Field({ label, value, onChange, error, hint, multiline, className = "" }: { label: string; value: string; onChange: (value: string) => void; error?: string; hint?: string; multiline?: boolean; className?: string }) {
  return <div className={className}><label className="mb-2 block text-sm font-black">{label}</label>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="w-full rounded-xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] px-3 py-2.5 text-sm leading-6 text-[var(--databloom-text-primary)] outline-none placeholder:text-[var(--databloom-text-muted)] focus:ring-2 focus:ring-[var(--databloom-focus)]" /> : <input value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-[var(--databloom-border)] bg-[var(--databloom-input)] px-3 text-sm text-[var(--databloom-text-primary)] outline-none placeholder:text-[var(--databloom-text-muted)] focus:ring-2 focus:ring-[var(--databloom-focus)]" />}{hint ? <p className="mt-1 text-xs text-[var(--databloom-text-muted)]">{hint}</p> : null}{error ? <p className="mt-1 text-sm font-semibold text-rose-700">{error}</p> : null}</div>;
}
