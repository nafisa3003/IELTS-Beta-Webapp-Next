import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Bypasses RLS entirely. Never import this into a Client Component or
 * expose it via an API route response — it exists only so the scoring
 * Strategy can read answer_options.is_correct, which RLS correctly hides
 * from students. Requires SUPABASE_SERVICE_ROLE_KEY, set locally only
 * (see .env.local) — never commit it, never send it to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (server-only, never NEXT_PUBLIC_) before scoring can run."
    );
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
