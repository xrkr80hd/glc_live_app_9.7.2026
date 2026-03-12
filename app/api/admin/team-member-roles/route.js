import { NextResponse } from "next/server";
import {
  normalizeId,
  normalizeTimestamp,
  parseBoolean,
  parsePaging,
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
  const memberId = normalizeId(searchParams.get("member_id"));
  const roleId = normalizeId(searchParams.get("role_id"));
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("team_member_roles")
    .select("id, member_id, role_id, is_role_admin, assigned_at")
    .order("assigned_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (memberId) {
    query = query.eq("member_id", memberId);
  }
  if (roleId) {
    query = query.eq("role_id", roleId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const hydrated = await hydrateRoleAssignments(supabase, data || []);
  return NextResponse.json({ teamMemberRoles: hydrated });
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

  const memberId = normalizeId(payload?.member_id);
  const roleId = normalizeId(payload?.role_id);
  const isRoleAdmin = parseBoolean(payload?.is_role_admin, false);
  const assignedAtRaw = payload?.assigned_at;
  const assignedAt =
    assignedAtRaw == null || String(assignedAtRaw).trim() === "" ? new Date().toISOString() : normalizeTimestamp(assignedAtRaw);

  if (!memberId) {
    return NextResponse.json({ error: "member_id is required" }, { status: 400 });
  }
  if (!roleId) {
    return NextResponse.json({ error: "role_id is required" }, { status: 400 });
  }
  if (!assignedAt) {
    return NextResponse.json({ error: "assigned_at must be a valid date/time" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("team_member_roles")
    .insert({
      member_id: memberId,
      role_id: roleId,
      is_role_admin: isRoleAdmin,
      assigned_at: assignedAt,
    })
    .select("id, member_id, role_id, is_role_admin, assigned_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const hydrated = await hydrateRoleAssignments(supabase, data ? [data] : []);
  return NextResponse.json({ teamMemberRole: hydrated[0] || null }, { status: 201 });
}
