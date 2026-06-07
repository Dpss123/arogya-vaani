import { createClient } from "@supabase/supabase-js";

// Browser-only Supabase client (anon key) for email/password auth.
// Kept separate from lib/supabase.ts so the service-role admin client is
// never bundled into client components.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);
