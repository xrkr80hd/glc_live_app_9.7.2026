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
    .from("photo_albums")
    .select("id, title, album_date, description, cover_photo_url, sort_order, is_published, created_at")
    .order("sort_order", { ascending: true })
    .order("album_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ photoAlbums: data || [] });
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
  const albumDateRaw = payload?.album_date;
  const albumDate = albumDateRaw == null || String(albumDateRaw).trim() === "" ? null : normalizeDate(albumDateRaw);
  const description = normalizeOptionalText(payload?.description);
  const coverPhotoUrl = normalizeOptionalText(payload?.cover_photo_url);
  const sortOrder = parseInteger(payload?.sort_order, 0);
  const isPublished = parseBoolean(payload?.is_published, true);

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (albumDateRaw != null && String(albumDateRaw).trim() !== "" && !albumDate) {
    return NextResponse.json({ error: "album_date must be a valid date (YYYY-MM-DD)" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("photo_albums")
    .insert({
      title,
      album_date: albumDate,
      description,
      cover_photo_url: coverPhotoUrl,
      sort_order: sortOrder,
      is_published: isPublished,
    })
    .select("id, title, album_date, description, cover_photo_url, sort_order, is_published, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ photoAlbum: data }, { status: 201 });
}
