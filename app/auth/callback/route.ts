import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const DEFAULT_REDIRECT = "/dashboard";

function getSafeRedirectPath(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("\u0000")
  ) {
    return DEFAULT_REDIRECT;
  }

  try {
    const candidate = new URL(value, "https://databloom.invalid");
    if (candidate.origin !== "https://databloom.invalid") {
      return DEFAULT_REDIRECT;
    }

    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return DEFAULT_REDIRECT;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth-failed", requestUrl));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth-failed", requestUrl));
  }

  return NextResponse.redirect(new URL(next, requestUrl));
}
