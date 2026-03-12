import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeId,
  normalizeOptionalText,
  parseBoolean,
  parseInteger,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

async function hydrateAlbumPhotos(supabase, rows) {
  if (!Array.isArray(rows) || !rows.length) {
    return [];
  }

  const albumIds = Array.from(
    new Set(rows.map((row) => normalizeId(row.album_id)).filter(Boolean)),
  );

  let albumMap = new Map();
  if (albumIds.length) {
    const { data } = await supabase
      .from("photo_albums")
      .select("id, title")
      .in("id", albumIds);
    if (Array.isArray(data)) {
      albumMap = new Map(data.map((item) => [item.id, item]));
    }
  }

  return rows.map((row) => ({
    ...row,
    album_title: albumMap.get(row.album_id)?.title || "Unknown album",
  }));
}

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
  const albumIdFilter = normalizeId(searchParams.get("album_id"));
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("album_photos")
    .select("id, album_id, photo_url, caption, taken_on, sort_order, is_published, created_at")
    .order("sort_order", { ascending: true })
    .order("taken_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  if (albumIdFilter) {
    query = query.eq("album_id", albumIdFilter);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const hydrated = await hydrateAlbumPhotos(supabase, data || []);
  return NextResponse.json({ albumPhotos: hydrated });
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

  const albumId = normalizeId(payload?.album_id);
  const photoUrl = String(payload?.photo_url || "").trim();
  const caption = normalizeOptionalText(payload?.caption);
  const takenOnRaw = payload?.taken_on;
  const takenOn = takenOnRaw == null || String(takenOnRaw).trim() === "" ? null : normalizeDate(takenOnRaw);
  const sortOrder = parseInteger(payload?.sort_order, 0);
  const isPublished = parseBoolean(payload?.is_published, true);

  if (!albumId) {
    return NextResponse.json({ error: "album_id is required" }, { status: 400 });
  }

  if (!photoUrl) {
    return NextResponse.json({ error: "photo_url is required" }, { status: 400 });
  }

  if (takenOnRaw != null && String(takenOnRaw).trim() !== "" && !takenOn) {
    return NextResponse.json({ error: "taken_on must be a valid date (YYYY-MM-DD)" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("album_photos")
    .insert({
      album_id: albumId,
      photo_url: photoUrl,
      caption,
      taken_on: takenOn,
      sort_order: sortOrder,
      is_published: isPublished,
    })
    .select("id, album_id, photo_url, caption, taken_on, sort_order, is_published, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const hydrated = await hydrateAlbumPhotos(supabase, data ? [data] : []);
  return NextResponse.json({ albumPhoto: hydrated[0] || null }, { status: 201 });
}
