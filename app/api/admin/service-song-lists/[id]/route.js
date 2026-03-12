import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeId,
  normalizeOptionalText,
  parseBoolean,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

function normalizeSongsJson(value) {
  if (Array.isArray(value)) {
    return value;
  }

  const raw = String(value ?? "").trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall through to newline parsing.
  }

  return raw
    .split(/\r?\n/g)
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .map((title, index) => ({
      order: index + 1,
      title,
    }));
}

function songsToText(songsJson) {
  if (!Array.isArray(songsJson) || !songsJson.length) {
    return "";
  }
  return songsJson
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }
      if (entry && typeof entry === "object") {
        const title = String(entry.title || "").trim();
        if (title) {
          return title;
        }
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

async function getIdFromContext(context) {
  const params = await Promise.resolve(context?.params);
  return normalizeId(params?.id);
}

async function hydrateSongLists(supabase, rows) {
  if (!Array.isArray(rows) || !rows.length) {
    return [];
  }

  const roleIds = Array.from(
    new Set(rows.map((row) => normalizeId(row.role_id)).filter(Boolean)),
  );
  let roleMap = new Map();

  if (roleIds.length) {
    const { data } = await supabase
      .from("team_roles")
      .select("id, name, role_key")
      .in("id", roleIds);
    if (Array.isArray(data)) {
      roleMap = new Map(data.map((item) => [item.id, item]));
    }
  }

  return rows.map((row) => {
    const role = roleMap.get(row.role_id) || null;
    const roleLabel = role
      ? `${String(role.name || "").trim()} (${String(role.role_key || "").trim()})`
      : "All Teams";
    const songsJson = Array.isArray(row.songs_json) ? row.songs_json : [];

    return {
      ...row,
      role_label: roleLabel,
      songs_count: songsJson.length,
      songs_text: songsToText(songsJson),
    };
  });
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
    .from("service_song_lists")
    .select("id, role_id, service_date, title, songs_json, notes, is_active, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Service song list not found" }, { status: 404 });
  }

  const hydrated = await hydrateSongLists(supabase, [data]);
  return NextResponse.json({ serviceSongList: hydrated[0] || null });
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

  if (payload?.role_id !== undefined) {
    update.role_id = normalizeId(payload.role_id);
  }

  if (payload?.service_date !== undefined) {
    const serviceDate = normalizeDate(payload.service_date);
    if (!serviceDate) {
      return NextResponse.json({ error: "service_date must be a valid date (YYYY-MM-DD)" }, { status: 400 });
    }
    update.service_date = serviceDate;
  }

  if (payload?.title !== undefined) {
    const title = String(payload.title || "").trim();
    if (!title) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    update.title = title;
  }

  if (payload?.songs_json !== undefined || payload?.songs_text !== undefined) {
    update.songs_json = normalizeSongsJson(payload.songs_json ?? payload.songs_text);
  }

  if (payload?.notes !== undefined) {
    update.notes = normalizeOptionalText(payload.notes);
  }

  if (payload?.is_active !== undefined) {
    update.is_active = parseBoolean(payload.is_active, true);
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("service_song_lists")
    .update(update)
    .eq("id", id)
    .select("id, role_id, service_date, title, songs_json, notes, is_active, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Service song list not found" }, { status: 404 });
  }

  const hydrated = await hydrateSongLists(supabase, [data]);
  return NextResponse.json({ serviceSongList: hydrated[0] || null });
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

  const { error } = await supabase
    .from("service_song_lists")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
