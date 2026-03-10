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
  const status = String(searchParams.get("status") || "").trim();

  let query = supabase
    .from("prayer_requests")
    .select("id, name, email, phone, request_text, is_private, status, submitted_at")
    .order("submitted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ prayerRequests: data || [] });
}

