import {
  normalizeDate,
  parseBoolean,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";
import { NextResponse } from "next/server";

const SCRIPTURE_SELECT_FULL = "id, audience, title, reference, verse_text, devotional_text, week_start, week_end, is_published, created_at";
const SCRIPTURE_SELECT_LEGACY = "id, audience, reference, verse_text, week_start, week_end, is_published, created_at";

function normalizeAudience(value) {
  const audience = String(value || "").trim().toLowerCase();
  if (audience === "main" || audience === "youth") {
    return audience;
  }
  return "";
}

function isMissingScriptureColumnError(error) {
  const message = String(error?.message || "");
  return message.includes("column scriptures.title does not exist") || message.includes("column scriptures.devotional_text does not exist");
}

function normalizeLegacyScripture(record) {
  if (!record) {
    return record;
  }
  return {
    ...record,
    title: record.title ?? null,
    devotional_text: record.devotional_text ?? null,
  };
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
    .select(SCRIPTURE_SELECT_FULL)
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
  if (!error) {
    return NextResponse.json({ scriptures: data || [] });
  }

  if (!isMissingScriptureColumnError(error)) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let legacyQuery = supabase
    .from("scriptures")
    .select(SCRIPTURE_SELECT_LEGACY)
    .order("week_start", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (audience) {
    legacyQuery = legacyQuery.eq("audience", audience);
  }
  if (!includeUnpublished) {
    legacyQuery = legacyQuery.eq("is_published", true);
  }

  const { data: legacyData, error: legacyError } = await legacyQuery;
  if (legacyError) {
    return NextResponse.json({ error: legacyError.message }, { status: 400 });
  }

  return NextResponse.json({ scriptures: (legacyData || []).map(normalizeLegacyScripture) });
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

  const audience = "youth";
  const title = String(payload?.title || "").trim();
  const reference = String(payload?.reference || "").trim();
  const verseText = String(payload?.verse_text || "").trim();
  const devotionalText = String(payload?.devotional_text || "").trim();
  const weekStart = normalizeDate(payload?.week_start);
  const weekEnd = normalizeDate(payload?.week_end);
  const isPublished = parseBoolean(payload?.is_published, true);

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

  const insertPayload = {
    audience,
    title: title || null,
    reference,
    verse_text: verseText,
    devotional_text: devotionalText || null,
    week_start: weekStart,
    week_end: weekEnd,
    is_published: isPublished,
  };

  const { data, error: insertError } = await supabase
    .from("scriptures")
    .insert(insertPayload)
    .select(SCRIPTURE_SELECT_FULL)
    .single();

  if (!insertError) {
    return NextResponse.json({ scripture: data }, { status: 201 });
  }

  if (!isMissingScriptureColumnError(insertError)) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const { title: _ignoredTitle, devotional_text: _ignoredDevotionalText, ...legacyInsertPayload } = insertPayload;
  const { data: legacyData, error: legacyInsertError } = await supabase
    .from("scriptures")
    .insert(legacyInsertPayload)
    .select(SCRIPTURE_SELECT_LEGACY)
    .single();

  if (legacyInsertError) {
    return NextResponse.json({ error: legacyInsertError.message }, { status: 400 });
  }

  return NextResponse.json({ scripture: normalizeLegacyScripture(legacyData) }, { status: 201 });
}

