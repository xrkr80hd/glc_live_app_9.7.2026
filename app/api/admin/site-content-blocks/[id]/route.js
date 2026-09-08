import { NextResponse } from "next/server";
import {
  normalizeOptionalText,
  parseBoolean,
  parseInteger,
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

async function updateContentBlock(request, { params }) {
  const { error: authError } = requireAdminSession(request);
  if (authError) return authError;

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;

  const { id } = await params;
  const { data: payload, error } = await readJsonBody(request);
  if (error) return error;

  const updates = { updated_at: new Date().toISOString() };
  if (payload?.section_key !== undefined) updates.section_key = normalizeSectionKey(payload.section_key);
  if (payload?.eyebrow !== undefined) updates.eyebrow = normalizeOptionalText(payload.eyebrow);
  if (payload?.title !== undefined) updates.title = String(payload.title || "").trim();
  if (payload?.body !== undefined) updates.body = normalizeOptionalText(payload.body);
  if (payload?.image_url !== undefined) updates.image_url = normalizeOptionalText(payload.image_url);
  if (payload?.image_alt !== undefined) updates.image_alt = normalizeOptionalText(payload.image_alt);
  if (payload?.media_url !== undefined) updates.media_url = normalizeOptionalText(payload.media_url);
  if (payload?.media_type !== undefined) updates.media_type = normalizeMediaType(payload.media_type);
  if (payload?.cta_label !== undefined) updates.cta_label = normalizeOptionalText(payload.cta_label);
  if (payload?.cta_url !== undefined) updates.cta_url = normalizeOptionalText(payload.cta_url);
  if (payload?.sort_order !== undefined) updates.sort_order = parseInteger(payload.sort_order, 0);
  if (payload?.is_published !== undefined) updates.is_published = parseBoolean(payload.is_published, true);

  if (updates.section_key === "" || updates.title === "") {
    return NextResponse.json({ error: "section_key and title cannot be empty" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("site_content_blocks")
    .update(updates)
    .eq("id", id)
    .select(SELECT_FIELDS)
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
  return NextResponse.json({ siteContentBlock: data });
}

export const PATCH = updateContentBlock;
export const PUT = updateContentBlock;

export async function DELETE(request, { params }) {
  const { error: authError } = requireAdminSession(request);
  if (authError) return authError;

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;

  const { id } = await params;
  const { error } = await supabase.from("site_content_blocks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
