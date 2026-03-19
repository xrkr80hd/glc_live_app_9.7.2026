import { NextResponse } from "next/server";
import {
  normalizeId,
  parseBoolean,
  parseInteger,
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

async function getIdFromContext(context) {
  const params = await Promise.resolve(context?.params);
  return normalizeId(params?.id);
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

export async function GET(request, context) {
  const { error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const id = await getIdFromContext(context);
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const { data, error } = await supabase
    .from("social_links")
    .select(SOCIAL_LINK_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Social link not found" }, { status: 404 });
  }

  return NextResponse.json({ socialLink: data });
}

export async function PATCH(request, context) {
  const { error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const id = await getIdFromContext(context);
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const { data: payload, error } = await readJsonBody(request);
  if (error) {
    return error;
  }

  const update = {};

  if (payload?.platform_key !== undefined) {
    const platformKey = normalizePlatformKey(payload.platform_key);
    if (!platformKey) {
      return NextResponse.json({ error: "platform_key must be a valid key" }, { status: 400 });
    }
    update.platform_key = platformKey;
  }

  if (payload?.label !== undefined) {
    const label = String(payload.label || "").trim();
    if (!label) {
      return NextResponse.json({ error: "label cannot be empty" }, { status: 400 });
    }
    update.label = label;
  }

  if (payload?.url !== undefined) {
    const url = normalizeSocialUrl(payload.url);
    if (!url) {
      return NextResponse.json({ error: "url must be a valid http or https URL" }, { status: 400 });
    }
    update.url = url;
  }

  if (payload?.sort_order !== undefined) {
    update.sort_order = parseInteger(payload.sort_order, 0);
  }

  if (payload?.is_active !== undefined) {
    update.is_active = parseBoolean(payload.is_active, true);
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("social_links")
    .update(update)
    .eq("id", id)
    .select(SOCIAL_LINK_SELECT)
    .maybeSingle();

  if (updateError) {
    const mapped = mapDbError(updateError);
    if (mapped) {
      return mapped;
    }
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Social link not found" }, { status: 404 });
  }

  return NextResponse.json({ socialLink: data });
}

export async function DELETE(request, context) {
  const { error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const id = await getIdFromContext(context);
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
