import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const VISITOR_COOKIE_NAME = "databloom_visitor_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || key === "your_supabase_publishable_key_here") {
    console.error(
      "[DataBloom] Supabase middleware is disabled. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    );
    return null;
  }

  return { url, key };
}

function ensureVisitorCookie(request: NextRequest, response: NextResponse) {
  if (request.cookies.get(VISITOR_COOKIE_NAME)) return;

  response.cookies.set(VISITOR_COOKIE_NAME, crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE,
  });
}

export async function middleware(request: NextRequest) {
  const config = getSupabaseConfig();
  let supabaseResponse = NextResponse.next({ request });

  if (!config) {
    ensureVisitorCookie(request, supabaseResponse);
    return supabaseResponse;
  }

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );

        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        );
      },
    },
  });

  await supabase.auth.getUser();
  ensureVisitorCookie(request, supabaseResponse);

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|mp3|woff2?|ttf)$).*)",
  ],
};
