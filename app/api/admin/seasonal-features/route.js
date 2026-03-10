import { NextResponse } from "next/server";
import {
  normalizeOptionalText,
  normalizeTimestamp,
  parseBoolean,
  parseInteger,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

function normalizeMediaType(value) {
  const mediaType = String(value || "").trim().toLowerCase();
  if (mediaType === "video" || mediaType === "image") {
    return mediaType;
  }
  return "";
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
  const includeInactive = parseBoolean(searchParams.get("include_inactive"), true);
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("seasonal_features")
    .select(
      "id, title, body, scripture_reference, scripture_text, media_url, media_type, cta_label, cta_url, season_tag, starts_at, ends_at, sort_order, is_active, display_seconds, enable_audio, volume_percent, created_at",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ seasonalFeatures: data || [] });
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
  const body = normalizeOptionalText(payload?.body);
  const scriptureReference = normalizeOptionalText(payload?.scripture_reference);
  const scriptureText = normalizeOptionalText(payload?.scripture_text);
  const mediaUrl = normalizeOptionalText(payload?.media_url);
  const mediaTypeRaw = payload?.media_type;
  const mediaType =
    mediaTypeRaw == null || String(mediaTypeRaw).trim() === "" ? null : normalizeMediaType(mediaTypeRaw);
  const ctaLabel = normalizeOptionalText(payload?.cta_label);
  const ctaUrl = normalizeOptionalText(payload?.cta_url);
  const seasonTag = normalizeOptionalText(payload?.season_tag);
  const startsAt = normalizeTimestamp(payload?.starts_at) || new Date().toISOString();
  const endsAtRaw = payload?.ends_at;
  const endsAt = endsAtRaw == null || String(endsAtRaw).trim() === "" ? null : normalizeTimestamp(endsAtRaw);
  const sortOrder = parseInteger(payload?.sort_order, 0);
  const isActive = parseBoolean(payload?.is_active, true);
  const displaySeconds = parseInteger(payload?.display_seconds, 12, 5, 120);
  const enableAudio = parseBoolean(payload?.enable_audio, false);
  const volumePercent = parseInteger(payload?.volume_percent, 25, 0, 100);

  if (mediaTypeRaw != null && String(mediaTypeRaw).trim() !== "" && !mediaType) {
    return NextResponse.json({ error: "media_type must be 'video' or 'image'" }, { status: 400 });
  }
  if (endsAtRaw != null && String(endsAtRaw).trim() !== "" && !endsAt) {
    return NextResponse.json({ error: "ends_at must be a valid date/time" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("seasonal_features")
    .insert({
      title,
      body,
      scripture_reference: scriptureReference,
      scripture_text: scriptureText,
      media_url: mediaUrl,
      media_type: mediaType,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      season_tag: seasonTag,
      starts_at: startsAt,
      ends_at: endsAt,
      sort_order: sortOrder,
      is_active: isActive,
      display_seconds: displaySeconds,
      enable_audio: enableAudio,
      volume_percent: volumePercent,
    })
    .select(
      "id, title, body, scripture_reference, scripture_text, media_url, media_type, cta_label, cta_url, season_tag, starts_at, ends_at, sort_order, is_active, display_seconds, enable_audio, volume_percent, created_at",
    )
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ seasonalFeature: data }, { status: 201 });
}
