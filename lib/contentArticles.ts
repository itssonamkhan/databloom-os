// Server-only content data access layer. Do not import this module into a
// Client Component; it depends on the server Supabase client and request cookies.
import { createClient } from "@/lib/supabase/server";

export type ArticleStatus = "draft" | "published" | "archived";

export type ContentArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seo_title: string | null;
  meta_description: string | null;
  target_keyword: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
  published_by: string | null;
  internal_links: string[];
};

export type PublishedArticleSummary = Pick<
  ContentArticle,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "seo_title"
  | "meta_description"
  | "published_at"
  | "updated_at"
>;

const ARTICLE_FIELDS =
  "id,title,slug,excerpt,content,seo_title,meta_description,target_keyword,status,published_at,created_at,updated_at,author_id,published_by,internal_links";
const LISTING_FIELDS =
  "id,title,slug,excerpt,seo_title,meta_description,published_at,updated_at";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isArticleStatus(value: unknown): value is ArticleStatus {
  return value === "draft" || value === "published" || value === "archived";
}

function normalizeArticle(value: unknown): ContentArticle | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.excerpt !== "string" ||
    typeof value.content !== "string" ||
    !isNullableString(value.seo_title) ||
    !isNullableString(value.meta_description) ||
    !isNullableString(value.target_keyword) ||
    !isArticleStatus(value.status) ||
    value.status !== "published" ||
    !isNullableString(value.published_at) ||
    typeof value.created_at !== "string" ||
    typeof value.updated_at !== "string" ||
    !isNullableString(value.author_id) ||
    !isNullableString(value.published_by) ||
    !Array.isArray(value.internal_links) ||
    !value.internal_links.every((link) => typeof link === "string")
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    slug: value.slug,
    excerpt: value.excerpt,
    content: value.content,
    seo_title: value.seo_title,
    meta_description: value.meta_description,
    target_keyword: value.target_keyword,
    status: value.status,
    published_at: value.published_at,
    created_at: value.created_at,
    updated_at: value.updated_at,
    author_id: value.author_id,
    published_by: value.published_by,
    internal_links: value.internal_links,
  };
}

function normalizeListing(value: unknown): PublishedArticleSummary | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.slug !== "string" ||
    typeof value.excerpt !== "string" ||
    !isNullableString(value.seo_title) ||
    !isNullableString(value.meta_description) ||
    !isNullableString(value.published_at) ||
    typeof value.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    slug: value.slug,
    excerpt: value.excerpt,
    seo_title: value.seo_title,
    meta_description: value.meta_description,
    published_at: value.published_at,
    updated_at: value.updated_at,
  };
}

export async function getPublishedArticleBySlug(
  slug: string,
): Promise<ContentArticle | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_articles")
      .select(ARTICLE_FIELDS)
      .eq("slug", normalizedSlug)
      .eq("status", "published")
      .maybeSingle();

    if (error) return null;
    return normalizeArticle(data);
  } catch {
    return null;
  }
}

export async function getPublishedArticles(): Promise<
  PublishedArticleSummary[]
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_articles")
      .select(LISTING_FIELDS)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error || !Array.isArray(data)) return [];

    return data
      .map(normalizeListing)
      .filter((article): article is PublishedArticleSummary => article !== null);
  } catch {
    return [];
  }
}
