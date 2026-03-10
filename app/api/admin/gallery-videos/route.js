import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeOptionalText,
  parseBoolean,
  parseInteger,
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
    .from("gallery_videos")
    .select("id, title, video_url, thumbnail_url, description, recorded_on, sort_order, is_published, created_at")
    .order("sort_order", { ascending: true })
    .order("recorded_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ galleryVideos: data || [] });
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
  const thumbnailUrl = normalizeOptionalText(payload?.thumbnail_url);
  const description = normalizeOptionalText(payload?.description);
  const recordedOnRaw = payload?.recorded_on;
  const recordedOn =
    recordedOnRaw == null || String(recordedOnRaw).trim() === "" ? null : normalizeDate(recordedOnRaw);
  const sortOrder = parseInteger(payload?.sort_order, 0);
  const isPublished = parseBoolean(payload?.is_published, true);

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (!videoUrl) {
    return NextResponse.json({ error: "video_url is required" }, { status: 400 });
  }

  if (recordedOnRaw != null && String(recordedOnRaw).trim() !== "" && !recordedOn) {
    return NextResponse.json({ error: "recorded_on must be a valid date (YYYY-MM-DD)" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("gallery_videos")
    .insert({
      title,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      description,
      recorded_on: recordedOn,
      sort_order: sortOrder,
      is_published: isPublished,
    })
    .select("id, title, video_url, thumbnail_url, description, recorded_on, sort_order, is_published, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ galleryVideo: data }, { status: 201 });
}
