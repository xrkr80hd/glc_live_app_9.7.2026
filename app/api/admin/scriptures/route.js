import { NextResponse } from "next/server";
import {
  normalizeDate,
  parseBoolean,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

function normalizeAudience(value) {
  const audience = String(value || "").trim().toLowerCase();
  if (audience === "main" || audience === "youth") {
    return audience;
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
  const audience = normalizeAudience(searchParams.get("audience"));
  const includeUnpublished = parseBoolean(searchParams.get("include_unpublished"), true);
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("scriptures")
    .select("id, audience, reference, verse_text, week_start, week_end, is_published, created_at")
    .order("week_start", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (audience) {
    query = query.eq("audience", audience);
  }
  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ scriptures: data || [] });
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

  const audience = normalizeAudience(payload?.audience);
  const reference = String(payload?.reference || "").trim();
  const verseText = String(payload?.verse_text || "").trim();
  const weekStart = normalizeDate(payload?.week_start);
  const weekEnd = normalizeDate(payload?.week_end);
  const isPublished = parseBoolean(payload?.is_published, true);

  if (!audience) {
    return NextResponse.json({ error: "audience must be 'main' or 'youth'" }, { status: 400 });
  }
  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }
  if (!verseText) {
    return NextResponse.json({ error: "verse_text is required" }, { status: 400 });
  }
  if (!weekStart || !weekEnd) {
    return NextResponse.json({ error: "week_start and week_end are required in YYYY-MM-DD format" }, { status: 400 });
  }
  if (weekEnd < weekStart) {
    return NextResponse.json({ error: "week_end must be on or after week_start" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("scriptures")
    .insert({
      audience,
      reference,
      verse_text: verseText,
      week_start: weekStart,
      week_end: weekEnd,
      is_published: isPublished,
    })
    .select("id, audience, reference, verse_text, week_start, week_end, is_published, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ scripture: data }, { status: 201 });
}

