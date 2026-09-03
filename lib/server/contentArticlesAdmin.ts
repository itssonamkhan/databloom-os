import type { ArticleStatus } from "@/lib/contentArticles";

export const ARTICLE_FIELDS =
  "id,title,slug,excerpt,content,seo_title,meta_description,target_keyword,status,published_at,created_at,updated_at,author_id,published_by,internal_links";

export const MAX_ARTICLE_BODY_BYTES = 600 * 1024;

type EditableArticleFields = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seo_title: string | null;
  meta_description: string | null;
  target_keyword: string | null;
  internal_links: string[];
};

export type ArticlePatch = Partial<EditableArticleFields>;

export type ParsedArticlePayload =
  | { ok: true; fields: EditableArticleFields; status?: ArticleStatus }
  | { ok: true; fields: ArticlePatch; status?: ArticleStatus }
  | { ok: false; message: string };

export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; message: "Request payload is too large." | "Invalid request payload." };

const MAX_TITLE_LENGTH = 200;
const MAX_SLUG_LENGTH = 200;
const MAX_EXCERPT_LENGTH = 2_000;
const MAX_CONTENT_LENGTH = 500_000;
const MAX_SEO_TITLE_LENGTH = 200;
const MAX_META_DESCRIPTION_LENGTH = 320;
const MAX_TARGET_KEYWORD_LENGTH = 200;
const MAX_INTERNAL_LINKS = 50;
const MAX_INTERNAL_LINK_LENGTH = 2_048;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ARTICLE_STATUSES: ArticleStatus[] = [
  "draft",
  "published",
  "archived",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

type TextParseResult = { value: string } | { error: string };

function parseRequiredText(
  value: unknown,
  field: string,
  maxLength: number,
  allowEmpty = false,
) : TextParseResult {
  if (typeof value !== "string") return { error: `${field} is required.` };

  const normalized = value.trim();
  if (!allowEmpty && normalized.length === 0) {
    return { error: `${field} is required.` };
  }
  if (normalized.length > maxLength) {
    return { error: `${field} is too long.` };
  }

  return { value: normalized };
}

function parseOptionalText(
  value: unknown,
  field: string,
  maxLength: number,
): { value: string | null } | { error: string } {
  if (value === undefined || value === null) return { value: null };

  if (typeof value !== "string") {
    return { error: `${field} must be text.` };
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    return { error: `${field} is too long.` };
  }

  return { value: normalized || null };
}

function isSafeInternalPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_INTERNAL_LINK_LENGTH &&
    /^\/(?!\/)[^\s"'<>]*$/.test(value)
  );
}

function parseInternalLinks(value: unknown):
  | { value: string[] }
  | { error: string } {
  if (!Array.isArray(value)) {
    return { error: "internal_links must be an array." };
  }
  if (value.length > MAX_INTERNAL_LINKS || !value.every(isSafeInternalPath)) {
    return { error: "internal_links contains an unsafe path." };
  }

  return { value: (value as string[]).map((link) => link.trim()) };
}

function parseStatus(
  record: Record<string, unknown>,
): { value?: ArticleStatus; error?: string } {
  if (!hasOwn(record, "status")) return {};
  if (
    typeof record.status !== "string" ||
    !ARTICLE_STATUSES.includes(record.status as ArticleStatus)
  ) {
    return { error: "Invalid article status." };
  }
  return { value: record.status as ArticleStatus };
}

export async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  const contentLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_ARTICLE_BODY_BYTES
  ) {
    return { ok: false, message: "Request payload is too large." };
  }

  try {
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_ARTICLE_BODY_BYTES) {
      return { ok: false, message: "Request payload is too large." };
    }
    return {
      ok: true,
      value: JSON.parse(new TextDecoder().decode(body)),
    };
  } catch {
    return { ok: false, message: "Invalid request payload." };
  }
}

export function parseArticlePayload(
  payload: unknown,
  mode: "create",
):
  | { ok: true; fields: EditableArticleFields; status: "draft" }
  | { ok: false; message: string };
export function parseArticlePayload(
  payload: unknown,
  mode: "patch",
):
  | { ok: true; fields: ArticlePatch; status?: ArticleStatus }
  | { ok: false; message: string };
export function parseArticlePayload(
  payload: unknown,
  mode: "create" | "patch",
): ParsedArticlePayload {
  if (!isRecord(payload)) {
    return { ok: false, message: "Invalid request payload." };
  }

  const status = parseStatus(payload);
  if (status.error) return { ok: false, message: status.error };

  if (mode === "create") {
    const title = parseRequiredText(
      payload.title,
      "title",
      MAX_TITLE_LENGTH,
    );
    const slug = parseRequiredText(payload.slug, "slug", MAX_SLUG_LENGTH);
    const excerpt = parseRequiredText(
      payload.excerpt,
      "excerpt",
      MAX_EXCERPT_LENGTH,
    );
    const content = parseRequiredText(
      payload.content,
      "content",
      MAX_CONTENT_LENGTH,
    );
    if ("error" in title) return { ok: false, message: title.error };
    if ("error" in slug) return { ok: false, message: slug.error };
    if ("error" in excerpt) return { ok: false, message: excerpt.error };
    if ("error" in content) return { ok: false, message: content.error };

    if (!SLUG_PATTERN.test(slug.value)) {
      return { ok: false, message: "Invalid article slug." };
    }

    const seoTitle = parseOptionalText(
      payload.seo_title,
      "seo_title",
      MAX_SEO_TITLE_LENGTH,
    );
    const metaDescription = parseOptionalText(
      payload.meta_description,
      "meta_description",
      MAX_META_DESCRIPTION_LENGTH,
    );
    const targetKeyword = parseOptionalText(
      payload.target_keyword,
      "target_keyword",
      MAX_TARGET_KEYWORD_LENGTH,
    );
    if ("error" in seoTitle) {
      return { ok: false, message: seoTitle.error };
    }
    if ("error" in metaDescription) {
      return { ok: false, message: metaDescription.error };
    }
    if ("error" in targetKeyword) {
      return { ok: false, message: targetKeyword.error };
    }

    const internalLinks = hasOwn(payload, "internal_links")
      ? parseInternalLinks(payload.internal_links)
      : { value: [] as string[] };
    if ("error" in internalLinks) {
      return { ok: false, message: internalLinks.error };
    }

    if (status.value && status.value !== "draft") {
      return { ok: false, message: "New articles must start as drafts." };
    }

    return {
      ok: true,
      fields: {
        title: title.value,
        slug: slug.value,
        excerpt: excerpt.value,
        content: content.value,
        seo_title: seoTitle.value ?? null,
        meta_description: metaDescription.value ?? null,
        target_keyword: targetKeyword.value ?? null,
        internal_links: internalLinks.value,
      },
      status: "draft",
    };
  }

  const fields: ArticlePatch = {};
  const textFields = [
    ["title", MAX_TITLE_LENGTH],
    ["slug", MAX_SLUG_LENGTH],
    ["excerpt", MAX_EXCERPT_LENGTH],
    ["content", MAX_CONTENT_LENGTH],
  ] as const;

  for (const [field, maxLength] of textFields) {
    if (!hasOwn(payload, field)) continue;
    const parsed = parseRequiredText(payload[field], field, maxLength, field === "content");
    if ("error" in parsed) return { ok: false, message: parsed.error };
    if (field === "slug" && !SLUG_PATTERN.test(parsed.value)) {
      return { ok: false, message: "Invalid article slug." };
    }
    fields[field] = parsed.value;
  }

  const optionalFields = [
    ["seo_title", MAX_SEO_TITLE_LENGTH],
    ["meta_description", MAX_META_DESCRIPTION_LENGTH],
    ["target_keyword", MAX_TARGET_KEYWORD_LENGTH],
  ] as const;
  for (const [field, maxLength] of optionalFields) {
    if (!hasOwn(payload, field)) continue;
    const parsed = parseOptionalText(payload[field], field, maxLength);
    if ("error" in parsed) return { ok: false, message: parsed.error };
    fields[field] = parsed.value;
  }

  if (hasOwn(payload, "internal_links")) {
    const internalLinks = parseInternalLinks(payload.internal_links);
    if ("error" in internalLinks) {
      return { ok: false, message: internalLinks.error };
    }
    fields.internal_links = internalLinks.value;
  }

  if (Object.keys(fields).length === 0 && status.value === undefined) {
    return { ok: false, message: "No editable article fields were provided." };
  }

  return { ok: true, fields, status: status.value };
}

export function validatePublishableFields(
  fields: Pick<
    EditableArticleFields,
    "title" | "slug" | "excerpt" | "content" | "seo_title" | "meta_description"
  >,
) {
  if (
    !fields.title.trim() ||
    !fields.slug.trim() ||
    !fields.excerpt.trim() ||
    !fields.content.trim() ||
    !fields.seo_title?.trim() ||
    !fields.meta_description?.trim()
  ) {
    return "Published articles require title, slug, excerpt, content, seo_title, and meta_description.";
  }

  return SLUG_PATTERN.test(fields.slug)
    ? null
    : "Published articles require a valid article slug.";
}
