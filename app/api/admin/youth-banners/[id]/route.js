import { NextResponse } from "next/server";
import {
  normalizeId,
  normalizeOptionalText,
  normalizeTimestamp,
  parseBoolean,
  parseInteger,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

async function getIdFromContext(context) {
  const params = await Promise.resolve(context?.params);
  return normalizeId(params?.id);
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
    .from("youth_banners")
    .select("id, title, subtitle, image_url, cta_label, cta_url, starts_at, ends_at, sort_order, is_active, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Youth banner not found" }, { status: 404 });
  }

  return NextResponse.json({ youthBanner: data });
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

  if (payload?.title !== undefined) {
    const title = String(payload.title || "").trim();
    if (!title) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    update.title = title;
  }

  if (payload?.subtitle !== undefined) {
    update.subtitle = normalizeOptionalText(payload.subtitle);
  }

  if (payload?.image_url !== undefined) {
    update.image_url = normalizeOptionalText(payload.image_url);
  }

  if (payload?.cta_label !== undefined) {
    update.cta_label = normalizeOptionalText(payload.cta_label);
  }

  if (payload?.cta_url !== undefined) {
    update.cta_url = normalizeOptionalText(payload.cta_url);
  }

  if (payload?.starts_at !== undefined) {
    const startsAt = normalizeTimestamp(payload.starts_at);
    if (!startsAt) {
      return NextResponse.json({ error: "starts_at must be a valid date/time" }, { status: 400 });
    }
    update.starts_at = startsAt;
  }

  if (payload?.ends_at !== undefined) {
    const endsRaw = payload.ends_at;
    if (endsRaw == null || String(endsRaw).trim() === "") {
      update.ends_at = null;
    } else {
      const endsAt = normalizeTimestamp(endsRaw);
      if (!endsAt) {
        return NextResponse.json({ error: "ends_at must be a valid date/time" }, { status: 400 });
      }
      update.ends_at = endsAt;
    }
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
    .from("youth_banners")
    .update(update)
    .eq("id", id)
    .select("id, title, subtitle, image_url, cta_label, cta_url, starts_at, ends_at, sort_order, is_active, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Youth banner not found" }, { status: 404 });
  }

  return NextResponse.json({ youthBanner: data });
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

  const { error } = await supabase.from("youth_banners").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

