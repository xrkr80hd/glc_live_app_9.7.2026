import { NextResponse } from "next/server";
import {
  parseBoolean,
  parseInteger,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

const SOCIAL_LINK_SELECT =
  "id, platform_key, label, url, sort_order, is_active, created_at, updated_at";

function normalizePlatformKey(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");

  return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(normalized) ? normalized : "";
}

function normalizeSocialUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

function mapDbError(error) {
  if (!error) {
    return null;
  }
  if (error.code === "23505") {
    return NextResponse.json({ error: "platform_key must be unique" }, { status: 409 });
  }
  return NextResponse.json({ error: error.message }, { status: 400 });
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
    .from("social_links")
    .select(SOCIAL_LINK_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ socialLinks: data || [] });
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

  const platformKey = normalizePlatformKey(payload?.platform_key);
  const label = String(payload?.label || "").trim();
  const url = normalizeSocialUrl(payload?.url);
  const sortOrder = parseInteger(payload?.sort_order, 0);
  const isActive = parseBoolean(payload?.is_active, true);

  if (!platformKey) {
    return NextResponse.json({ error: "platform_key is required and must be a valid key" }, { status: 400 });
  }
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }
  if (!url) {
    return NextResponse.json({ error: "url is required and must be a valid http or https URL" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("social_links")
    .insert({
      platform_key: platformKey,
      label,
      url,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .select(SOCIAL_LINK_SELECT)
    .single();

  if (insertError) {
    const mapped = mapDbError(insertError);
    if (mapped) {
      return mapped;
    }
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ socialLink: data }, { status: 201 });
}
