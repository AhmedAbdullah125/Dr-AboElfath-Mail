import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Lazy browser client (singleton) ─────────────────────────────────────────
// IMPORTANT: createClient is only called inside functions, never at module level.
// This prevents Next.js from evaluating it during build when env vars don't exist.

let _browserClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_browserClient) {
    _browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _browserClient;
}

// ─── Server-side client (fresh per request, service role) ────────────────────
export function createServerClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
