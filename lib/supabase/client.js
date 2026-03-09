"use client";

import { createClient } from "@supabase/supabase-js";

let client;

export function createSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
