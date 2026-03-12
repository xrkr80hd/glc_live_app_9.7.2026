import { NextResponse } from "next/server";
import {
  normalizeId,
  normalizeTimestamp,
  parseBoolean,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

function formatMemberLabel(member, fallbackId) {
  if (!member) {
    return `Member ${String(fallbackId || "").slice(0, 8)}`;
  }
  const fullName = String(member.full_name || "").trim();
  const username = String(member.username || "").trim();
  const email = String(member.email || "").trim();
  if (fullName && username) {
    return `${fullName} (${username})`;
  }
  return fullName || username || email || `Member ${String(fallbackId || "").slice(0, 8)}`;
}

function formatRoleLabel(role, fallbackId) {
  if (!role) {
    return `Role ${String(fallbackId || "").slice(0, 8)}`;
  }
  const name = String(role.name || "").trim();
  const roleKey = String(role.role_key || "").trim();
  if (name && roleKey) {
    return `${name} (${roleKey})`;
  }
  return name || roleKey || `Role ${String(fallbackId || "").slice(0, 8)}`;
}

async function hydrateRoleAssignments(supabase, rows) {
  if (!Array.isArray(rows) || !rows.length) {
    return [];
  }

  const memberIds = Array.from(
    new Set(rows.map((row) => normalizeId(row.member_id)).filter(Boolean)),
  );
  const roleIds = Array.from(
    new Set(rows.map((row) => normalizeId(row.role_id)).filter(Boolean)),
  );

  let memberMap = new Map();
  let roleMap = new Map();

  if (memberIds.length) {
    const { data } = await supabase
      .from("team_members")
      .select("id, username, full_name, email")
      .in("id", memberIds);
    if (Array.isArray(data)) {
      memberMap = new Map(data.map((item) => [item.id, item]));
    }
  }

  if (roleIds.length) {
    const { data } = await supabase
      .from("team_roles")
      .select("id, name, role_key")
      .in("id", roleIds);
    if (Array.isArray(data)) {
      roleMap = new Map(data.map((item) => [item.id, item]));
    }
  }

  return rows.map((row) => ({
    ...row,
    member_label: formatMemberLabel(memberMap.get(row.member_id), row.member_id),
    role_label: formatRoleLabel(roleMap.get(row.role_id), row.role_id),
  }));
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
    .from("team_member_roles")
    .select("id, member_id, role_id, is_role_admin, assigned_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Role assignment not found" }, { status: 404 });
  }

  const hydrated = await hydrateRoleAssignments(supabase, data ? [data] : []);
  return NextResponse.json({ teamMemberRole: hydrated[0] || null });
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

  if (payload?.member_id !== undefined) {
    const memberId = normalizeId(payload.member_id);
    if (!memberId) {
      return NextResponse.json({ error: "member_id cannot be empty" }, { status: 400 });
    }
    update.member_id = memberId;
  }

  if (payload?.role_id !== undefined) {
    const roleId = normalizeId(payload.role_id);
    if (!roleId) {
      return NextResponse.json({ error: "role_id cannot be empty" }, { status: 400 });
    }
    update.role_id = roleId;
  }

  if (payload?.is_role_admin !== undefined) {
    update.is_role_admin = parseBoolean(payload.is_role_admin, false);
  }

  if (payload?.assigned_at !== undefined) {
    const assignedAtRaw = payload.assigned_at;
    if (assignedAtRaw == null || String(assignedAtRaw).trim() === "") {
      update.assigned_at = new Date().toISOString();
    } else {
      const assignedAt = normalizeTimestamp(assignedAtRaw);
      if (!assignedAt) {
        return NextResponse.json({ error: "assigned_at must be a valid date/time" }, { status: 400 });
      }
      update.assigned_at = assignedAt;
    }
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("team_member_roles")
    .update(update)
    .eq("id", id)
    .select("id, member_id, role_id, is_role_admin, assigned_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Role assignment not found" }, { status: 404 });
  }

  const hydrated = await hydrateRoleAssignments(supabase, data ? [data] : []);
  return NextResponse.json({ teamMemberRole: hydrated[0] || null });
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

  const { error } = await supabase.from("team_member_roles").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
