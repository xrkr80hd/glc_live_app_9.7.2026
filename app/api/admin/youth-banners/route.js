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
    .from("youth_banners")
    .select("id, title, subtitle, image_url, cta_label, cta_url, starts_at, ends_at, sort_order, is_active, created_at")
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

  return NextResponse.json({ youthBanners: data || [] });
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
  const subtitle = normalizeOptionalText(payload?.subtitle);
  const imageUrl = normalizeOptionalText(payload?.image_url);
  const ctaLabel = normalizeOptionalText(payload?.cta_label);
  const ctaUrl = normalizeOptionalText(payload?.cta_url);
  const startsAt = normalizeTimestamp(payload?.starts_at) || new Date().toISOString();
  const endsAtRaw = payload?.ends_at;
  const endsAt = endsAtRaw == null || String(endsAtRaw).trim() === "" ? null : normalizeTimestamp(endsAtRaw);
  const sortOrder = parseInteger(payload?.sort_order, 0);
  const isActive = parseBoolean(payload?.is_active, true);

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (endsAtRaw != null && String(endsAtRaw).trim() !== "" && !endsAt) {
    return NextResponse.json({ error: "ends_at must be a valid date/time" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("youth_banners")
    .insert({
      title,
      subtitle,
      image_url: imageUrl,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      starts_at: startsAt,
      ends_at: endsAt,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .select("id, title, subtitle, image_url, cta_label, cta_url, starts_at, ends_at, sort_order, is_active, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ youthBanner: data }, { status: 201 });
}

