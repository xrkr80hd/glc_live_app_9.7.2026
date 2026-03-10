import { NextResponse } from "next/server";
import {
  normalizeId,
  normalizeOptionalText,
  normalizeTimestamp,
  parseBoolean,
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
    .from("livestreams")
    .select("id, title, embed_url, fallback_video_url, watch_cta_label, is_active, starts_at, ends_at, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Livestream not found" }, { status: 404 });
  }

  return NextResponse.json({ livestream: data });
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

  if (payload?.embed_url !== undefined) {
    const embedUrl = String(payload.embed_url || "").trim();
    if (!embedUrl) {
      return NextResponse.json({ error: "embed_url cannot be empty" }, { status: 400 });
    }
    update.embed_url = embedUrl;
  }

  if (payload?.fallback_video_url !== undefined) {
    update.fallback_video_url = normalizeOptionalText(payload.fallback_video_url);
  }

  if (payload?.watch_cta_label !== undefined) {
    const watchLabel = String(payload.watch_cta_label || "").trim();
    if (!watchLabel) {
      return NextResponse.json({ error: "watch_cta_label cannot be empty" }, { status: 400 });
    }
    update.watch_cta_label = watchLabel;
  }

  if (payload?.is_active !== undefined) {
    update.is_active = parseBoolean(payload.is_active, true);
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

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("livestreams")
    .update(update)
    .eq("id", id)
    .select("id, title, embed_url, fallback_video_url, watch_cta_label, is_active, starts_at, ends_at, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Livestream not found" }, { status: 404 });
  }

  return NextResponse.json({ livestream: data });
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

  const { error } = await supabase.from("livestreams").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

