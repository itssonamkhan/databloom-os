// Server-only authorization helpers. Never import this module into a Client Component.
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import { createClient as createServerClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AdminAuthorizationResult =
  | { authorized: true; userId: string }
  | { authorized: false; status: 401 | 403 };

function getConfiguredAdminIds(): Set<string> | null {
  const configuredIds = process.env.ANALYTICS_ADMIN_USER_IDS;
  if (!configuredIds || configuredIds.trim().length === 0) return null;

  const values = configuredIds.split(",").map((value) => value.trim());
  if (
    values.length === 0 ||
    values.some((value) => !value || !UUID_PATTERN.test(value))
  ) {
    return null;
  }

  return new Set(values);
}

export async function authorizeAdmin(): Promise<AdminAuthorizationResult> {
  let userId: string | null = null;

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return { authorized: false, status: 401 };
    userId = user.id;
  } catch {
    return { authorized: false, status: 401 };
  }

  const adminIds = getConfiguredAdminIds();
  if (!adminIds || !userId || !adminIds.has(userId)) {
    return { authorized: false, status: 403 };
  }

  return { authorized: true, userId };
}

export function createAdminSupabaseClient(): SupabaseClient | null {
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
