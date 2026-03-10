import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeId,
  normalizeOptionalText,
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
    .from("archived_sermons")
    .select("id, title, media_url, thumbnail_url, preached_on, speaker, description, sort_order, is_published, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Archived sermon not found" }, { status: 404 });
  }

  return NextResponse.json({ archivedSermon: data });
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

  if (payload?.media_url !== undefined) {
    const mediaUrl = String(payload.media_url || "").trim();
    if (!mediaUrl) {
      return NextResponse.json({ error: "media_url cannot be empty" }, { status: 400 });
    }
    update.media_url = mediaUrl;
  }

  if (payload?.thumbnail_url !== undefined) {
    update.thumbnail_url = normalizeOptionalText(payload.thumbnail_url);
  }

  if (payload?.preached_on !== undefined) {
    const preachedRaw = payload.preached_on;
    if (preachedRaw == null || String(preachedRaw).trim() === "") {
      update.preached_on = null;
    } else {
      const preachedOn = normalizeDate(preachedRaw);
      if (!preachedOn) {
        return NextResponse.json({ error: "preached_on must be a valid date (YYYY-MM-DD)" }, { status: 400 });
      }
      update.preached_on = preachedOn;
    }
  }

  if (payload?.speaker !== undefined) {
    update.speaker = normalizeOptionalText(payload.speaker);
  }

  if (payload?.description !== undefined) {
    update.description = normalizeOptionalText(payload.description);
  }

  if (payload?.sort_order !== undefined) {
    update.sort_order = parseInteger(payload.sort_order, 0);
  }

  if (payload?.is_published !== undefined) {
    update.is_published = parseBoolean(payload.is_published, true);
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("archived_sermons")
    .update(update)
    .eq("id", id)
    .select("id, title, media_url, thumbnail_url, preached_on, speaker, description, sort_order, is_published, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Archived sermon not found" }, { status: 404 });
  }

  return NextResponse.json({ archivedSermon: data });
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

  const { error } = await supabase.from("archived_sermons").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

