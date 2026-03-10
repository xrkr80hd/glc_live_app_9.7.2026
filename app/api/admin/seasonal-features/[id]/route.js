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

function normalizeMediaType(value) {
  const mediaType = String(value || "").trim().toLowerCase();
  if (mediaType === "video" || mediaType === "image") {
    return mediaType;
  }
  return "";
}

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
    .from("seasonal_features")
    .select(
      "id, title, body, scripture_reference, scripture_text, media_url, media_type, cta_label, cta_url, season_tag, starts_at, ends_at, sort_order, is_active, display_seconds, enable_audio, volume_percent, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Seasonal feature not found" }, { status: 404 });
  }

  return NextResponse.json({ seasonalFeature: data });
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
    update.title = String(payload.title || "").trim();
  }

  if (payload?.body !== undefined) {
    update.body = normalizeOptionalText(payload.body);
  }

  if (payload?.scripture_reference !== undefined) {
    update.scripture_reference = normalizeOptionalText(payload.scripture_reference);
  }

  if (payload?.scripture_text !== undefined) {
    update.scripture_text = normalizeOptionalText(payload.scripture_text);
  }

  if (payload?.media_url !== undefined) {
    update.media_url = normalizeOptionalText(payload.media_url);
  }

  if (payload?.media_type !== undefined) {
    const mediaTypeRaw = payload.media_type;
    if (mediaTypeRaw == null || String(mediaTypeRaw).trim() === "") {
      update.media_type = null;
    } else {
      const mediaType = normalizeMediaType(mediaTypeRaw);
      if (!mediaType) {
        return NextResponse.json({ error: "media_type must be 'video' or 'image'" }, { status: 400 });
      }
      update.media_type = mediaType;
    }
  }

  if (payload?.cta_label !== undefined) {
    update.cta_label = normalizeOptionalText(payload.cta_label);
  }

  if (payload?.cta_url !== undefined) {
    update.cta_url = normalizeOptionalText(payload.cta_url);
  }

  if (payload?.season_tag !== undefined) {
    update.season_tag = normalizeOptionalText(payload.season_tag);
  }

  if (payload?.starts_at !== undefined) {
    const startsRaw = payload.starts_at;
    if (startsRaw == null || String(startsRaw).trim() === "") {
      update.starts_at = null;
    } else {
      const startsAt = normalizeTimestamp(startsRaw);
      if (!startsAt) {
        return NextResponse.json({ error: "starts_at must be a valid date/time" }, { status: 400 });
      }
      update.starts_at = startsAt;
    }
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

  if (payload?.display_seconds !== undefined) {
    update.display_seconds = parseInteger(payload.display_seconds, 12, 5, 120);
  }

  if (payload?.enable_audio !== undefined) {
    update.enable_audio = parseBoolean(payload.enable_audio, false);
  }

  if (payload?.volume_percent !== undefined) {
    update.volume_percent = parseInteger(payload.volume_percent, 25, 0, 100);
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("seasonal_features")
    .update(update)
    .eq("id", id)
    .select(
      "id, title, body, scripture_reference, scripture_text, media_url, media_type, cta_label, cta_url, season_tag, starts_at, ends_at, sort_order, is_active, display_seconds, enable_audio, volume_percent, created_at",
    )
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Seasonal feature not found" }, { status: 404 });
  }

  return NextResponse.json({ seasonalFeature: data });
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

  const { error } = await supabase.from("seasonal_features").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
