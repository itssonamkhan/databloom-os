import { NextResponse } from "next/server";

import type { ContentArticle } from "@/lib/contentArticles";
import {
  authorizeAdmin,
  createAdminSupabaseClient,
} from "@/lib/server/adminAuthorization";
import {
  ARTICLE_FIELDS,
  parseArticlePayload,
  readJsonBody,
  validatePublishableFields,
} from "@/lib/server/contentArticlesAdmin";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

type ArticleRouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: noStoreHeaders },
  );
}

function authorizationResponse(
  result: Extract<Awaited<ReturnType<typeof authorizeAdmin>>, { authorized: false }>,
) {
  return errorResponse(
    result.status === 401 ? "Authentication required." : "Forbidden.",
    result.status,
  );
}

function validArticleId(id: string) {
  return UUID_PATTERN.test(id);
}

function statusTransitionError(
  current: ContentArticle["status"],
  next: ContentArticle["status"],
  explicitlyRequested: boolean,
) {
  if (!explicitlyRequested || current === next) return null;
  if (next === "archived") return null;
  if (current === "draft" && next === "published") return null;
  if (current === "published" && next === "draft") return null;
  return "That article status transition is not allowed.";
}

export async function GET(
  _request: Request,
  context: ArticleRouteContext,
) {
  const authorization = await authorizeAdmin();
  if (!authorization.authorized) return authorizationResponse(authorization);

  const { id } = await context.params;
  if (!validArticleId(id)) return errorResponse("Invalid article ID.", 400);

  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return errorResponse("Content service unavailable.", 500);

    const { data, error } = await supabase
      .from("content_articles")
      .select(ARTICLE_FIELDS)
      .eq("id", id)
      .maybeSingle();

    if (error) return errorResponse("Content service unavailable.", 500);
    if (!data) return errorResponse("Article not found.", 404);

    return NextResponse.json(data, { headers: noStoreHeaders });
  } catch {
    return errorResponse("Content service unavailable.", 500);
  }
}

export async function PATCH(
  request: Request,
  context: ArticleRouteContext,
) {
  const authorization = await authorizeAdmin();
  if (!authorization.authorized) return authorizationResponse(authorization);

  const { id } = await context.params;
  if (!validArticleId(id)) return errorResponse("Invalid article ID.", 400);

  const body = await readJsonBody(request);
  if (!body.ok) return errorResponse(body.message, 400);

  const parsed = parseArticlePayload(body.value, "patch");
  if (!parsed.ok) return errorResponse(parsed.message, 400);

  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return errorResponse("Content service unavailable.", 500);

    const existingResult = await supabase
      .from("content_articles")
      .select(ARTICLE_FIELDS)
      .eq("id", id)
      .maybeSingle();

    if (existingResult.error) {
      return errorResponse("Content service unavailable.", 500);
    }
    if (!existingResult.data) return errorResponse("Article not found.", 404);

    const existing = existingResult.data as ContentArticle;
    const nextStatus = parsed.status ?? existing.status;
    const transitionError = statusTransitionError(
      existing.status,
      nextStatus,
      parsed.status !== undefined,
    );
    if (transitionError) return errorResponse(transitionError, 400);

    const mergedFields = {
      title: parsed.fields.title ?? existing.title,
      slug: parsed.fields.slug ?? existing.slug,
      excerpt: parsed.fields.excerpt ?? existing.excerpt,
      content: parsed.fields.content ?? existing.content,
      seo_title:
        "seo_title" in parsed.fields
          ? parsed.fields.seo_title ?? null
          : existing.seo_title,
      meta_description:
        "meta_description" in parsed.fields
          ? parsed.fields.meta_description ?? null
          : existing.meta_description,
    };

    const update: Record<string, unknown> = {
      ...parsed.fields,
      status: nextStatus,
    };

    if (nextStatus === "published") {
      const publishingError = validatePublishableFields(mergedFields);
      if (publishingError) return errorResponse(publishingError, 400);

      if (existing.status !== "published") {
        update.published_at = new Date().toISOString();
        update.published_by = authorization.userId;
      }
    } else if (
      nextStatus === "draft" &&
      existing.status === "published" &&
      parsed.status === "draft"
    ) {
      update.published_at = null;
      update.published_by = null;
    } else if (nextStatus === "archived") {
      update.published_at = null;
      update.published_by = null;
    }

    const { data, error } = await supabase
      .from("content_articles")
      .update(update)
      .eq("id", id)
      .select(ARTICLE_FIELDS)
      .single();

    if (error) {
      if (error.code === "23505") {
        return errorResponse("An article with that slug already exists.", 409);
      }
      if (error.code === "23514") {
        return errorResponse("Invalid article data.", 400);
      }
      return errorResponse("Content service unavailable.", 500);
    }

    return NextResponse.json(data, { headers: noStoreHeaders });
  } catch {
    return errorResponse("Content service unavailable.", 500);
  }
}

export async function DELETE(
  _request: Request,
  context: ArticleRouteContext,
) {
  const authorization = await authorizeAdmin();
  if (!authorization.authorized) return authorizationResponse(authorization);

  const { id } = await context.params;
  if (!validArticleId(id)) return errorResponse("Invalid article ID.", 400);

  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return errorResponse("Content service unavailable.", 500);

    const { data, error } = await supabase
      .from("content_articles")
      .update({
        status: "archived",
        published_at: null,
        published_by: null,
      })
      .eq("id", id)
      .select(ARTICLE_FIELDS)
      .maybeSingle();

    if (error) return errorResponse("Content service unavailable.", 500);
    if (!data) return errorResponse("Article not found.", 404);

    return NextResponse.json(data, { headers: noStoreHeaders });
  } catch {
    return errorResponse("Content service unavailable.", 500);
  }
}
