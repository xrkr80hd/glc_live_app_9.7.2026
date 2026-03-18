import { NextResponse } from "next/server";
import {
  normalizeOptionalText,
  parseBoolean,
  parseInteger,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

const ROLE_CANONICAL_NAMES = {
  foh_sound: "FOH Sound",
  foh: "FOH Sound",
  foh_lead: "FOH Sound",
  music_minister: "Music Minister",
  worship_leader: "Worship Leader",
  worship_team: "Worship Team",
  pastor: "Pastor",
  media_team: "Media Team",
  media_lead: "Media Team",
  youth_minister: "Youth Minister",
  youth_minister_assistant: "Youth Minister Assistant",
  youth_assistant: "Youth Minister Assistant",
  kids_ministry: "Kids Ministry",
  kids_church: "Kids Church",
  childrens_church: "Children's Church",
  bookkeeper: "Bookkeeper",
  superuser: "Superuser",
  super_user: "Superuser",
};

const ROLE_KEY_ALIASES = {
  super_user: "superuser",
  music_minister: "worship_leader",
  worship_minister: "worship_leader",
  media: "media_team",
  media_lead: "media_team",
  foh: "foh_sound",
  foh_lead: "foh_sound",
  youth_assistant: "youth_minister_assistant",
  youth_ministry_assistant: "youth_minister_assistant",
  kids_ministry: "kids_church",
  kids_ministry_leader: "kids_church",
  childrens_church: "kids_church",
};

function normalizeRoleKey(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");

  return ROLE_KEY_ALIASES[normalized] || normalized;
}

function normalizeRoleName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
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
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("team_roles")
    .select("id, role_key, name, description, sort_order, is_system, is_active, created_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ teamRoles: data || [] });
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

  const roleKey = normalizeRoleKey(payload?.role_key || payload?.name);
  const name = normalizeRoleName(payload?.name);
  const description = normalizeOptionalText(payload?.description);
  const sortOrder = parseInteger(payload?.sort_order, 0);
  const isSystem = parseBoolean(payload?.is_system, false);
  const isActive = parseBoolean(payload?.is_active, true);

  if (!roleKey) {
    return NextResponse.json({ error: "role_key is required" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const canonicalName = ROLE_CANONICAL_NAMES[roleKey] || name;

  const { data, error: insertError } = await supabase
    .from("team_roles")
    .insert({
      role_key: roleKey,
      name: canonicalName,
      description,
      sort_order: sortOrder,
      is_system: isSystem,
      is_active: isActive,
    })
    .select("id, role_key, name, description, sort_order, is_system, is_active, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ teamRole: data }, { status: 201 });
}
