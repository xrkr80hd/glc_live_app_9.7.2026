import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeId,
  normalizeOptionalText,
  parseBoolean,
  parsePaging,
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
  const roleIdFilter = normalizeId(searchParams.get("role_id"));
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("service_song_lists")
    .select("id, role_id, service_date, title, songs_json, notes, is_active, created_at")
    .order("service_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }
  if (roleIdFilter) {
    query = query.eq("role_id", roleIdFilter);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const hydrated = await hydrateSongLists(supabase, data || []);
  return NextResponse.json({ serviceSongLists: hydrated });
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

  const roleId = normalizeId(payload?.role_id);
  const title = String(payload?.title || "").trim();
  const serviceDate = normalizeDate(payload?.service_date);
  const songsJson = normalizeSongsJson(payload?.songs_json ?? payload?.songs_text);
  const notes = normalizeOptionalText(payload?.notes);
  const isActive = parseBoolean(payload?.is_active, true);

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!serviceDate) {
    return NextResponse.json({ error: "service_date is required (YYYY-MM-DD)" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("service_song_lists")
    .insert({
      role_id: roleId,
      service_date: serviceDate,
      title,
      songs_json: songsJson,
      notes,
      is_active: isActive,
    })
    .select("id, role_id, service_date, title, songs_json, notes, is_active, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const hydrated = await hydrateSongLists(supabase, data ? [data] : []);
  return NextResponse.json({ serviceSongList: hydrated[0] || null }, { status: 201 });
}
