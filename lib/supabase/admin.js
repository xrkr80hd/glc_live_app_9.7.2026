import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerSecretKey() {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_PUBLIC_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    ""
  );
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseServerSecretKey = getSupabaseServerSecretKey();

  if (!supabaseUrl || !supabaseServerSecretKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServerSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
