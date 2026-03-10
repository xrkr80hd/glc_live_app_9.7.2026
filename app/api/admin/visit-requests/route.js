import { NextResponse } from "next/server";
import { parsePaging, requireAdminSession, requireAdminSupabase } from "@/lib/admin-api";

export async function GET(request) {
  const { error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const { searchParams } = new URL(request.url);
  const { limit, offset } = parsePaging(searchParams);

  const { data, error } = await supabase
    .from("visit_requests")
    .select("id, name, email, phone, preferred_service, party_size, message, submitted_at")
    .order("submitted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ visitRequests: data || [] });
}

