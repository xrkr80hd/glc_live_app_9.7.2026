import { NextResponse } from "next/server";
import {
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
    .select("id, category, title, body, starts_at, ends_at, sort_order, is_published, created_at")
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
  const startsAt = normalizeTimestamp(payload?.starts_at) || new Date().toISOString();
  const endsAtRaw = payload?.ends_at;
  const endsAt = endsAtRaw == null || String(endsAtRaw).trim() === "" ? null : normalizeTimestamp(endsAtRaw);
  const sortOrder = parseInteger(payload?.sort_order, 0);
  const isPublished = parseBoolean(payload?.is_published, false);

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

  const { data, error: insertError } = await supabase
    .from("announcements")
    .insert({
      category,
      title,
      body,
      starts_at: startsAt,
      ends_at: endsAt,
      sort_order: sortOrder,
      is_published: isPublished,
    })
    .select("id, category, title, body, starts_at, ends_at, sort_order, is_published, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ announcement: data }, { status: 201 });
}

