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

function normalizeCategory(value) {
  const category = String(value || "").trim().toLowerCase();
  if (category === "main" || category === "youth") {
    return category;
  }
  return "";
}

function validateAnnouncementTiming({ startsAt, endsAt }) {
  if (!endsAt) {
    return "";
  }

  const endsMs = new Date(endsAt).getTime();
  const startsMs = new Date(startsAt).getTime();
  if (!Number.isFinite(endsMs)) {
    return "ends_at must be a valid date/time";
  }
  if (endsMs < Date.now()) {
    return "ends_at cannot be earlier than now";
  }
  if (Number.isFinite(startsMs) && endsMs < startsMs) {
    return "ends_at cannot be earlier than starts_at";
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
  const category = normalizeCategory(searchParams.get("category"));
  const includeUnpublished = parseBoolean(searchParams.get("include_unpublished"), true);
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("announcements")
    .select("id, category, title, body, image_url, image_alt, starts_at, ends_at, sort_order, is_published, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category", category);
  }
  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ announcements: data || [] });
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

  const category = normalizeCategory(payload?.category);
  const title = String(payload?.title || "").trim();
  const body = String(payload?.body || "").trim();
  const imageUrl = normalizeOptionalText(payload?.image_url);
  const imageAlt = normalizeOptionalText(payload?.image_alt);
  const startsAt = normalizeTimestamp(payload?.starts_at) || new Date().toISOString();
  const endsAtRaw = payload?.ends_at;
  const endsAt = endsAtRaw == null || String(endsAtRaw).trim() === "" ? null : normalizeTimestamp(endsAtRaw);
  const sortOrderRaw = payload?.sort_order;
  const hasExplicitSortOrder = sortOrderRaw != null && String(sortOrderRaw).trim() !== "";
  const hasExplicitPublished = Object.prototype.hasOwnProperty.call(payload || {}, "is_published");
  const isPublished = hasExplicitPublished ? parseBoolean(payload?.is_published, false) : true;

  if (!category) {
    return NextResponse.json({ error: "category must be 'main' or 'youth'" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!body) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }
  if (endsAtRaw != null && String(endsAtRaw).trim() !== "" && !endsAt) {
    return NextResponse.json({ error: "ends_at must be a valid date/time" }, { status: 400 });
  }

  const timingError = validateAnnouncementTiming({ startsAt, endsAt });
  if (timingError) {
    return NextResponse.json({ error: timingError }, { status: 400 });
  }

  let sortOrder = parseInteger(sortOrderRaw, 0);
  if (!hasExplicitSortOrder) {
    const { data: maxSortOrderRow, error: maxSortOrderError } = await supabase
      .from("announcements")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxSortOrderError) {
      return NextResponse.json({ error: maxSortOrderError.message }, { status: 400 });
    }

    const hasExistingSortOrder =
      maxSortOrderRow?.sort_order != null && String(maxSortOrderRow.sort_order).trim() !== "";
    const maxSortOrder = hasExistingSortOrder ? parseInteger(maxSortOrderRow.sort_order, 0) : 0;
    sortOrder = maxSortOrder + 10;
  }

  const { data, error: insertError } = await supabase
    .from("announcements")
    .insert({
      category,
      title,
      body,
      image_url: imageUrl,
      image_alt: imageAlt,
      starts_at: startsAt,
      ends_at: endsAt,
      sort_order: sortOrder,
      is_published: isPublished,
    })
    .select("id, category, title, body, image_url, image_alt, starts_at, ends_at, sort_order, is_published, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ announcement: data }, { status: 201 });
}
