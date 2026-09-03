import { NextResponse } from "next/server";

import {
  authorizeAdmin,
  createAdminSupabaseClient,
} from "@/lib/server/adminAuthorization";
import {
  ARTICLE_FIELDS,
  parseArticlePayload,
  readJsonBody,
} from "@/lib/server/contentArticlesAdmin";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
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

export async function GET() {
  const authorization = await authorizeAdmin();
  if (!authorization.authorized) return authorizationResponse(authorization);

  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return errorResponse("Content service unavailable.", 500);

    const { data, error } = await supabase
      .from("content_articles")
      .select(ARTICLE_FIELDS)
      .order("updated_at", { ascending: false });

    if (error) return errorResponse("Content service unavailable.", 500);

    return NextResponse.json(data ?? [], { headers: noStoreHeaders });
  } catch {
    return errorResponse("Content service unavailable.", 500);
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeAdmin();
  if (!authorization.authorized) return authorizationResponse(authorization);

  const body = await readJsonBody(request);
  if (!body.ok) return errorResponse(body.message, 400);

  const parsed = parseArticlePayload(body.value, "create");
  if (!parsed.ok) return errorResponse(parsed.message, 400);

  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) return errorResponse("Content service unavailable.", 500);

    const { data, error } = await supabase
      .from("content_articles")
      .insert({
        ...parsed.fields,
        status: "draft",
        author_id: authorization.userId,
      })
      .select(ARTICLE_FIELDS)
      .single();

    if (error) {
      if (error.code === "23505") {
        return errorResponse("An article with that slug already exists.", 409);
      }
      return errorResponse("Content service unavailable.", 500);
    }

    return NextResponse.json(data, { status: 201, headers: noStoreHeaders });
  } catch {
    return errorResponse("Content service unavailable.", 500);
  }
}
