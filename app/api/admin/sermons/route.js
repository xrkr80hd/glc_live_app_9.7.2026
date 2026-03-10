import { NextResponse } from "next/server";
import {
  normalizeDate,
  parseBoolean,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

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
  const includeUnpublished = parseBoolean(searchParams.get("include_unpublished"), true);
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("sermons")
    .select("id, title, video_url, preached_on, is_published, created_at")
    .order("preached_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ sermons: data || [] });
}

export async function POST(request) {
  const { error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const { data: payload, error } = await readJsonBody(request);
  if (error) {
    return error;
  }

  const title = String(payload?.title || "").trim();
  const videoUrl = String(payload?.video_url || "").trim();
  const preachedOnRaw = payload?.preached_on;
  const preachedOn = preachedOnRaw == null || String(preachedOnRaw).trim() === "" ? null : normalizeDate(preachedOnRaw);
  const isPublished = parseBoolean(payload?.is_published, true);

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!videoUrl) {
    return NextResponse.json({ error: "video_url is required" }, { status: 400 });
  }
  if (preachedOnRaw != null && String(preachedOnRaw).trim() !== "" && !preachedOn) {
    return NextResponse.json({ error: "preached_on must be a valid date (YYYY-MM-DD)" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("sermons")
    .insert({
      title,
      video_url: videoUrl,
      preached_on: preachedOn,
      is_published: isPublished,
    })
    .select("id, title, video_url, preached_on, is_published, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ sermon: data }, { status: 201 });
}

