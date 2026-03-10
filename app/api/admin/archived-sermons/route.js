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
    .from("archived_sermons")
    .select("id, title, media_url, thumbnail_url, preached_on, speaker, description, sort_order, is_published, created_at")
    .order("sort_order", { ascending: true })
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

  return NextResponse.json({ archivedSermons: data || [] });
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
  const mediaUrl = String(payload?.media_url || "").trim();
  const thumbnailUrl = normalizeOptionalText(payload?.thumbnail_url);
  const preachedOnRaw = payload?.preached_on;
  const preachedOn = preachedOnRaw == null || String(preachedOnRaw).trim() === "" ? null : normalizeDate(preachedOnRaw);
  const speaker = normalizeOptionalText(payload?.speaker);
  const description = normalizeOptionalText(payload?.description);
  const sortOrder = parseInteger(payload?.sort_order, 0);
  const isPublished = parseBoolean(payload?.is_published, true);

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!mediaUrl) {
    return NextResponse.json({ error: "media_url is required" }, { status: 400 });
  }
  if (preachedOnRaw != null && String(preachedOnRaw).trim() !== "" && !preachedOn) {
    return NextResponse.json({ error: "preached_on must be a valid date (YYYY-MM-DD)" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("archived_sermons")
    .insert({
      title,
      media_url: mediaUrl,
      thumbnail_url: thumbnailUrl,
      preached_on: preachedOn,
      speaker,
      description,
      sort_order: sortOrder,
      is_published: isPublished,
    })
    .select("id, title, media_url, thumbnail_url, preached_on, speaker, description, sort_order, is_published, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ archivedSermon: data }, { status: 201 });
}

