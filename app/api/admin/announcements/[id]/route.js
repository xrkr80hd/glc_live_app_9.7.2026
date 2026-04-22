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

function normalizeCategory(value) {
  const category = String(value || "").trim().toLowerCase();
  if (category === "main" || category === "youth") {
    return category;
  }
  return "";
}

function validateAnnouncementTiming({ startsAt, endsAt }) {
  if (!endsAt) {
    return "";
  }

  const endsMs = new Date(endsAt).getTime();
  const startsMs = new Date(startsAt).getTime();
  if (!Number.isFinite(endsMs)) {
    return "ends_at must be a valid date/time";
  }
  if (endsMs < Date.now()) {
    return "ends_at cannot be earlier than now";
  }
  if (Number.isFinite(startsMs) && endsMs < startsMs) {
    return "ends_at cannot be earlier than starts_at";
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
    .from("announcements")
    .select("id, category, title, body, image_url, image_alt, starts_at, ends_at, sort_order, is_published, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  return NextResponse.json({ announcement: data });
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

  if (payload?.category !== undefined) {
    const category = normalizeCategory(payload.category);
    if (!category) {
      return NextResponse.json({ error: "category must be 'main' or 'youth'" }, { status: 400 });
    }
    update.category = category;
  }

  if (payload?.title !== undefined) {
    const title = String(payload.title || "").trim();
    if (!title) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    update.title = title;
  }

  if (payload?.body !== undefined) {
    const body = String(payload.body || "").trim();
    if (!body) {
      return NextResponse.json({ error: "body cannot be empty" }, { status: 400 });
    }
    update.body = body;
  }

  if (payload?.image_url !== undefined) {
    update.image_url = normalizeOptionalText(payload.image_url);
  }

  if (payload?.image_alt !== undefined) {
    update.image_alt = normalizeOptionalText(payload.image_alt);
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

  if (payload?.is_published !== undefined) {
    update.is_published = parseBoolean(payload.is_published, false);
  }

  if (update.starts_at !== undefined || Object.prototype.hasOwnProperty.call(update, "ends_at")) {
    const { data: existingAnnouncement, error: existingError } = await supabase
      .from("announcements")
      .select("id, starts_at, ends_at")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 400 });
    }
    if (!existingAnnouncement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    const nextStartsAt = update.starts_at !== undefined ? update.starts_at : existingAnnouncement.starts_at;
    const nextEndsAt = Object.prototype.hasOwnProperty.call(update, "ends_at")
      ? update.ends_at
      : existingAnnouncement.ends_at;
    const timingError = validateAnnouncementTiming({
      startsAt: nextStartsAt,
      endsAt: nextEndsAt,
    });
    if (timingError) {
      return NextResponse.json({ error: timingError }, { status: 400 });
    }
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("announcements")
    .update(update)
    .eq("id", id)
    .select("id, category, title, body, image_url, image_alt, starts_at, ends_at, sort_order, is_published, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  return NextResponse.json({ announcement: data });
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

  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
