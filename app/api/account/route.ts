import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/server/adminAuthorization";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_DELETE_BODY_BYTES = 1024;
const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

function errorResponse(message: string, status: 400 | 401 | 403 | 415 | 500) {
  return NextResponse.json({ error: message }, { status, headers: noStoreHeaders });
}

function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    if (new URL(origin).origin !== new URL(request.url).origin) return false;
  } catch {
    return false;
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  return !fetchSite || fetchSite === "same-origin";
}

async function readBodyWithinLimit(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_DELETE_BODY_BYTES) {
    return null;
  }

  const reader = request.body?.getReader();
  if (!reader) return null;

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_DELETE_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function hasValidConfirmation(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Object.keys(record).length === 1 && record.confirmation === "DELETE";
}

export async function DELETE(request: Request) {
  let userId: string | null = null;
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (!error && user) userId = user.id;
  } catch {
    return errorResponse("Authentication required.", 401);
  }

  if (!userId) return errorResponse("Authentication required.", 401);
  if (!isSameOriginRequest(request)) return errorResponse("Invalid request.", 403);

  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return errorResponse("Invalid request.", 415);

  let payload: unknown;
  try {
    const bytes = await readBodyWithinLimit(request);
    if (!bytes) return errorResponse("Invalid request.", 400);
    payload = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return errorResponse("Invalid request.", 400);
  }

  if (!hasValidConfirmation(payload)) return errorResponse("Invalid request.", 400);

  const adminClient = createAdminSupabaseClient();
  if (!adminClient) return errorResponse("Account service unavailable.", 500);

  try {
    const { error } = await adminClient.auth.admin.deleteUser(userId, false);
    if (error) return errorResponse("Account service unavailable.", 500);
    return new NextResponse(null, { status: 204, headers: noStoreHeaders });
  } catch {
    return errorResponse("Account service unavailable.", 500);
  }
}
