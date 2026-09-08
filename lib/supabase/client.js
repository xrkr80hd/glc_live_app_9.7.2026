"use client";

import { createBrowserClient } from "@supabase/ssr";

let client;

export function createSupabaseBrowserClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  client = createBrowserClient(supabaseUrl, supabasePublishableKey);
  return client;
}
