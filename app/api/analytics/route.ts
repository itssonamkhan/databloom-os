import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createClient as createServerClient } from "@/lib/supabase/server";

const VISITOR_COOKIE_NAME = "databloom_visitor_id";
const MAX_REQUEST_BYTES = 20 * 1024;
const MAX_PROPERTIES_BYTES = 16 * 1024;
const ALLOWED_EVENTS = new Set([
  "page_view",
  "session_start",
  "feature_opened",
]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SENSITIVE_KEY_PATTERN =
  /(?:password|passwd|token|secret|credential|authorization|cookie|email|ip|user[-_ ]?agent|user[-_ ]?id|visitor[-_ ]?id)/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){2,7}$/i;

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: noStoreHeaders },
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function containsSensitiveMetadata(value: unknown): boolean {
  if (typeof value === "string") {
    return (
      EMAIL_PATTERN.test(value) ||
      IPV4_PATTERN.test(value) ||
      IPV6_PATTERN.test(value)
    );
  }

  if (Array.isArray(value)) {
    return value.some(containsSensitiveMetadata);
  }

  if (!isPlainObject(value)) return false;

  return Object.entries(value).some(
    ([key, entry]) =>
      SENSITIVE_KEY_PATTERN.test(key) || containsSensitiveMetadata(entry),
  );
}

function validVisitorId(value: string | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function createInsertClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) return null;

  return createSupabaseClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function POST(request: Request) {
  const visitorId = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${VISITOR_COOKIE_NAME}=`))
    ?.slice(VISITOR_COOKIE_NAME.length + 1);

  if (!validVisitorId(visitorId)) {
    return errorResponse("Invalid visitor identifier.", 400);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return errorResponse("Request payload is too large.", 400);
  }

  let payload: unknown;
  try {
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_REQUEST_BYTES) {
      return errorResponse("Request payload is too large.", 400);
    }

    payload = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return errorResponse("Invalid request payload.", 400);
  }

  if (!isPlainObject(payload)) {
    return errorResponse("Invalid request payload.", 400);
  }

  const eventName =
    typeof payload.event_name === "string" ? payload.event_name.trim() : "";
  if (eventName.length === 0 || eventName.length > 120) {
    return errorResponse("Invalid event name.", 400);
  }
  if (!ALLOWED_EVENTS.has(eventName)) {
    return errorResponse("Unsupported event name.", 400);
  }

  const rawPath = payload.path;
  if (rawPath !== null && typeof rawPath !== "string") {
    return errorResponse("Invalid path.", 400);
  }

  const path = rawPath === null ? null : rawPath.trim();
  if (
    path !== null &&
    (path.length > 2048 || path.includes("?") || path.includes("#"))
  ) {
    return errorResponse("Invalid path.", 400);
  }

  if (!isPlainObject(payload.properties)) {
    return errorResponse("Invalid properties.", 400);
  }

  let propertiesBytes: number;
  try {
    propertiesBytes = new TextEncoder().encode(
      JSON.stringify(payload.properties),
    ).byteLength;
  } catch {
    return errorResponse("Invalid properties.", 400);
  }

  if (
    propertiesBytes > MAX_PROPERTIES_BYTES ||
    containsSensitiveMetadata(payload.properties)
  ) {
    return errorResponse("Invalid properties.", 400);
  }

  try {
    const authClient = await createServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    const insertClient = createInsertClient();

    if (!insertClient) {
      return errorResponse("Analytics service unavailable.", 500);
    }

    const { error } = await insertClient.from("analytics_events").insert({
      visitor_id: visitorId,
      user_id: user?.id ?? null,
      event_name: eventName,
      path,
      properties: payload.properties,
    });

    if (error) return errorResponse("Analytics service unavailable.", 500);

    return new Response(null, { status: 204, headers: noStoreHeaders });
  } catch {
    return errorResponse("Analytics service unavailable.", 500);
  }
}
