import { NextResponse } from "next/server";
import {
  normalizeOptionalText,
  parseBoolean,
  parseInteger,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

function normalizeSectionKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeMediaType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "image" || normalized === "video" ? normalized : null;
}

const SELECT_FIELDS = "id, section_key, eyebrow, title, body, image_url, image_alt, media_url, media_type, cta_label, cta_url, sort_order, is_published, created_at, updated_at";

export async function GET(request) {
  const { error: authError } = requireAdminSession(request);
  if (authError) return authError;

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;

  const { searchParams } = new URL(request.url);
  const includeUnpublished = parseBoolean(searchParams.get("include_unpublished"), true);
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("site_content_blocks")
    .select(SELECT_FIELDS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (!includeUnpublished) query = query.eq("is_published", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ siteContentBlocks: data || [] });
}

export async function POST(request) {
  const { error: authError } = requireAdminSession(request);
  if (authError) return authError;

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;

  const { data: payload, error } = await readJsonBody(request);
  if (error) return error;

  const sectionKey = normalizeSectionKey(payload?.section_key);
  const title = String(payload?.title || "").trim();
  if (!sectionKey || !title) {
    return NextResponse.json({ error: "section_key and title are required" }, { status: 400 });
  }

  const insert = {
    section_key: sectionKey,
    eyebrow: normalizeOptionalText(payload?.eyebrow),
    title,
    body: normalizeOptionalText(payload?.body),
    image_url: normalizeOptionalText(payload?.image_url),
    image_alt: normalizeOptionalText(payload?.image_alt),
    media_url: normalizeOptionalText(payload?.media_url),
    media_type: normalizeMediaType(payload?.media_type),
    cta_label: normalizeOptionalText(payload?.cta_label),
    cta_url: normalizeOptionalText(payload?.cta_url),
    sort_order: parseInteger(payload?.sort_order, 0),
    is_published: parseBoolean(payload?.is_published, true),
    updated_at: new Date().toISOString(),
  };

  const { data, error: insertError } = await supabase
    .from("site_content_blocks")
    .insert(insert)
    .select(SELECT_FIELDS)
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
  return NextResponse.json({ siteContentBlock: data }, { status: 201 });
}
