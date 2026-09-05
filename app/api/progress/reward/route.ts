import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/server/adminAuthorization";
import { awardReward, MAX_REWARD_BODY_BYTES, parseRewardPayload } from "@/lib/server/progressRewards";

export const dynamic = "force-dynamic";
const noStoreHeaders = { "Cache-Control": "no-store, max-age=0" };

function response(message: string, status: 400 | 401 | 500) {
  return NextResponse.json({ error: message }, { status, headers: noStoreHeaders });
}

async function readBody(request: Request) {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_REWARD_BODY_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REWARD_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

export async function POST(request: Request) {
  let userId: string | null = null;
  try {
    const authClient = await createServerClient();
    const { data: { user }, error } = await authClient.auth.getUser();
    if (!error && user) userId = user.id;
  } catch {
    return response("Authentication required.", 401);
  }
  if (!userId) return response("Authentication required.", 401);

  let payload: unknown;
  try {
    const bytes = await readBody(request);
    if (!bytes) return response("Invalid reward payload.", 400);
    payload = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return response("Invalid reward payload.", 400);
  }
  const reward = parseRewardPayload(payload);
  if (!reward) return response("Invalid reward payload.", 400);

  const adminClient = createAdminSupabaseClient();
  if (!adminClient) return response("Reward service unavailable.", 500);
  try {
    const result = await awardReward(adminClient, userId, reward);
    return NextResponse.json(result, { headers: noStoreHeaders });
  } catch {
    return response("Reward service unavailable.", 500);
  }
}
