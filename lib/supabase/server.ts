import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const FALLBACK_SUPABASE_URL = "https://placeholder.supabase.co";
const FALLBACK_SUPABASE_KEY = "placeholder-supabase-key";
const PLACEHOLDER_KEY = "your_supabase_publishable_key_here";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || key === PLACEHOLDER_KEY) {
    console.error(
      "[DataBloom] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    );
    return null;
  }

  return { url, key };
}

export async function createClient() {
  const cookieStore = await cookies();
  const config = getSupabaseConfig();

  return createServerClient(
    config?.url ?? FALLBACK_SUPABASE_URL,
    config?.key ?? FALLBACK_SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Cookie writes may be unavailable from a Server Component.
          }
        }
      },
    },
  );
}
