import { NextResponse } from "next/server";
import {
  normalizeOptionalText,
  normalizeTimestamp,
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
  const includeInactive = parseBoolean(searchParams.get("include_inactive"), true);
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("livestreams")
    .select("id, title, embed_url, fallback_video_url, watch_cta_label, is_active, starts_at, ends_at, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ livestreams: data || [] });
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
  const embedUrl = String(payload?.embed_url || "").trim();
  const fallbackVideoUrl = normalizeOptionalText(payload?.fallback_video_url);
  const watchCtaLabel = String(payload?.watch_cta_label || "").trim() || "Watch Live Now";
  const isActive = parseBoolean(payload?.is_active, true);
  const startsAtRaw = payload?.starts_at;
  const endsAtRaw = payload?.ends_at;
  const startsAt = startsAtRaw == null || String(startsAtRaw).trim() === "" ? null : normalizeTimestamp(startsAtRaw);
  const endsAt = endsAtRaw == null || String(endsAtRaw).trim() === "" ? null : normalizeTimestamp(endsAtRaw);

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!embedUrl) {
    return NextResponse.json({ error: "embed_url is required" }, { status: 400 });
  }
  if (startsAtRaw != null && String(startsAtRaw).trim() !== "" && !startsAt) {
    return NextResponse.json({ error: "starts_at must be a valid date/time" }, { status: 400 });
  }
  if (endsAtRaw != null && String(endsAtRaw).trim() !== "" && !endsAt) {
    return NextResponse.json({ error: "ends_at must be a valid date/time" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("livestreams")
    .insert({
      title,
      embed_url: embedUrl,
      fallback_video_url: fallbackVideoUrl,
      watch_cta_label: watchCtaLabel,
      is_active: isActive,
      starts_at: startsAt,
      ends_at: endsAt,
    })
    .select("id, title, embed_url, fallback_video_url, watch_cta_label, is_active, starts_at, ends_at, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ livestream: data }, { status: 201 });
}

