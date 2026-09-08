import { NextResponse } from "next/server";
import { requireAdminSession, requireAdminSupabase } from "@/lib/admin-api";

export async function GET(request) {
  const { error: authError } = requireAdminSession(request);
  if (authError) return authError;
  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;
  const { data, error } = await supabase
    .from("permissions")
    .select("id,permission_key,name,description,module_key")
    .order("module_key")
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ permissions: data || [] });
}
