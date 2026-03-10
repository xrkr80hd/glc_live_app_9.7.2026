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
    .from("album_photos")
    .select("id, album_id, photo_url, caption, taken_on, sort_order, is_published, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Album photo not found" }, { status: 404 });
  }

  return NextResponse.json({ albumPhoto: data });
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

  if (payload?.album_id !== undefined) {
    const albumId = normalizeId(payload.album_id);
    if (!albumId) {
      return NextResponse.json({ error: "album_id cannot be empty" }, { status: 400 });
    }
    update.album_id = albumId;
  }

  if (payload?.photo_url !== undefined) {
    const photoUrl = String(payload.photo_url || "").trim();
    if (!photoUrl) {
      return NextResponse.json({ error: "photo_url cannot be empty" }, { status: 400 });
    }
    update.photo_url = photoUrl;
  }

  if (payload?.caption !== undefined) {
    update.caption = normalizeOptionalText(payload.caption);
  }

  if (payload?.taken_on !== undefined) {
    const takenOnRaw = payload.taken_on;
    if (takenOnRaw == null || String(takenOnRaw).trim() === "") {
      update.taken_on = null;
    } else {
      const takenOn = normalizeDate(takenOnRaw);
      if (!takenOn) {
        return NextResponse.json({ error: "taken_on must be a valid date (YYYY-MM-DD)" }, { status: 400 });
      }
      update.taken_on = takenOn;
    }
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
    .from("album_photos")
    .update(update)
    .eq("id", id)
    .select("id, album_id, photo_url, caption, taken_on, sort_order, is_published, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Album photo not found" }, { status: 404 });
  }

  return NextResponse.json({ albumPhoto: data });
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

  const { error } = await supabase.from("album_photos").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
