import { createBrowserClient } from "@supabase/ssr";

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

export function createClient() {
  const config = getSupabaseConfig();

  return createBrowserClient(
    config?.url ?? FALLBACK_SUPABASE_URL,
    config?.key ?? FALLBACK_SUPABASE_KEY,
  );
}
