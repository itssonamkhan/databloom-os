import { NextResponse } from "next/server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/server/adminAuthorization";
import {
  MAX_PROGRESS_BODY_BYTES,
  getProgressState,
  mergeProgressState,
  parseProgressPayload,
  ProgressRevisionConflictError,
  type ProgressSyncState,
} from "@/lib/server/progressSync";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

function errorResponse(message: string, status: 400 | 401 | 405 | 409 | 500) {
  return NextResponse.json({ error: message }, { status, headers: noStoreHeaders });
}

function stateResponse(state: ProgressSyncState) {
  return NextResponse.json(
    {
      schemaVersion: state.schemaVersion,
      xp: state.xp,
      level: state.level,
      streak: state.streak,
      items: state.items,
      dailyStats: state.dailyStats,
      revision: state.revision,
      guestImportedAt: state.guestImportedAt,
    },
    { headers: noStoreHeaders },
  );
}

async function getAuthenticatedUserId() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return error || !user ? null : user.id;
  } catch {
    return null;
  }
}

function createDatabaseClient() {
  return createAdminSupabaseClient();
}

async function readBodyWithinLimit(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_PROGRESS_BODY_BYTES) {
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

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return errorResponse("Authentication required.", 401);

  try {
    const supabase = createDatabaseClient();
    if (!supabase) return errorResponse("Progress service unavailable.", 500);
    return stateResponse(await getProgressState(supabase, userId));
  } catch {
    return errorResponse("Progress service unavailable.", 500);
  }
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return errorResponse("Authentication required.", 401);

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_PROGRESS_BODY_BYTES) {
    return errorResponse("Request payload is too large.", 400);
  }

  let body: unknown;
  try {
    const bytes = await readBodyWithinLimit(request);
    if (!bytes) {
      return errorResponse("Request payload is too large.", 400);
    }
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return errorResponse("Invalid request payload.", 400);
  }

  const payload = parseProgressPayload(body);
  if (!payload) return errorResponse("Invalid progress payload.", 400);

  try {
    const supabase = createDatabaseClient();
    if (!supabase) return errorResponse("Progress service unavailable.", 500);
    return stateResponse(await mergeProgressState(supabase, userId, payload));
  } catch (error) {
    if (error instanceof ProgressRevisionConflictError) {
      return errorResponse("Progress changed elsewhere.", 409);
    }
    return errorResponse("Progress service unavailable.", 500);
  }
}
