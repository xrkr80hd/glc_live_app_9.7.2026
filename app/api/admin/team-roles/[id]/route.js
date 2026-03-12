import { NextResponse } from "next/server";
import {
  normalizeId,
  normalizeOptionalText,
  parseBoolean,
  parseInteger,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

const ROLE_CANONICAL_NAMES = {
  foh_sound: "FOH Sound",
  worship_leader: "Worship Leader",
  worship_team: "Worship Team",
  pastor: "Pastor",
  media_team: "Media Team",
  youth_minister: "Youth Minister",
  youth_minister_assistant: "Youth Minister Assistant",
  kids_church: "Kids Church",
  childrens_church: "Children's Church",
  bookkeeper: "Bookkeeper",
  superuser: "Superuser",
};

function normalizeRoleKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeRoleName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
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
    .from("team_roles")
    .select("id, role_key, name, description, sort_order, is_system, is_active, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Team role not found" }, { status: 404 });
  }

  return NextResponse.json({ teamRole: data });
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

  if (payload?.role_key !== undefined) {
    const roleKey = normalizeRoleKey(payload.role_key);
    if (!roleKey) {
      return NextResponse.json({ error: "role_key cannot be empty" }, { status: 400 });
    }
    update.role_key = roleKey;
  }

  if (payload?.name !== undefined) {
    const name = normalizeRoleName(payload.name);
    if (!name) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }
    update.name = name;
  }

  if (payload?.description !== undefined) {
    update.description = normalizeOptionalText(payload.description);
  }

  if (payload?.sort_order !== undefined) {
    update.sort_order = parseInteger(payload.sort_order, 0);
  }

  if (payload?.is_system !== undefined) {
    update.is_system = parseBoolean(payload.is_system, false);
  }

  if (payload?.is_active !== undefined) {
    update.is_active = parseBoolean(payload.is_active, true);
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  if (payload?.name !== undefined || payload?.role_key !== undefined) {
    const { data: currentRole, error: currentRoleError } = await supabase
      .from("team_roles")
      .select("role_key")
      .eq("id", id)
      .maybeSingle();

    if (currentRoleError) {
      return NextResponse.json({ error: currentRoleError.message }, { status: 400 });
    }

    const effectiveRoleKey = normalizeRoleKey(update.role_key || currentRole?.role_key);
    const canonicalName = ROLE_CANONICAL_NAMES[effectiveRoleKey || ""];
    if (canonicalName) {
      update.name = canonicalName;
    }
  }

  const { data, error: updateError } = await supabase
    .from("team_roles")
    .update(update)
    .eq("id", id)
    .select("id, role_key, name, description, sort_order, is_system, is_active, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Team role not found" }, { status: 404 });
  }

  return NextResponse.json({ teamRole: data });
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

  const { error } = await supabase.from("team_roles").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
