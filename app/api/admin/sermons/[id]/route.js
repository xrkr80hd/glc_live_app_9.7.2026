import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeId,
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
    .from("sermons")
    .select("id, title, video_url, preached_on, is_published, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
  }

  return NextResponse.json({ sermon: data });
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

  if (payload?.video_url !== undefined) {
    const videoUrl = String(payload.video_url || "").trim();
    if (!videoUrl) {
      return NextResponse.json({ error: "video_url cannot be empty" }, { status: 400 });
    }
    update.video_url = videoUrl;
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

  if (payload?.is_published !== undefined) {
    update.is_published = parseBoolean(payload.is_published, true);
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("sermons")
    .update(update)
    .eq("id", id)
    .select("id, title, video_url, preached_on, is_published, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
  }

  return NextResponse.json({ sermon: data });
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

  const { error } = await supabase.from("sermons").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

