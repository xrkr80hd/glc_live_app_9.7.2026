import { NextResponse } from "next/server";
import {
  normalizeId,
  normalizeOptionalText,
  parseBoolean,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";
import { hashAdminPassword } from "@/lib/admin-auth";

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "")
    .slice(0, 80);
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return email || null;
}

function normalizeRoleIds(value) {
  const source = Array.isArray(value)
    ? value
    : String(value || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
  return Array.from(new Set(source.map((entry) => normalizeId(entry)).filter(Boolean)));
}

async function hydrateTeamMembers(supabase, members) {
  if (!Array.isArray(members) || !members.length) {
    return [];
  }

  const memberIds = members.map((member) => normalizeId(member.id)).filter(Boolean);
  const { data: assignments } = await supabase
    .from("team_member_roles")
    .select("member_id, role_id, is_role_admin")
    .in("member_id", memberIds);

  const roleIds = Array.from(
    new Set((assignments || []).map((item) => normalizeId(item.role_id)).filter(Boolean)),
  );

  let roleMap = new Map();
  if (roleIds.length) {
    const { data: roles } = await supabase
      .from("team_roles")
      .select("id, role_key, name")
      .in("id", roleIds);
    roleMap = new Map((roles || []).map((role) => [role.id, role]));
  }

  const assignmentsByMember = new Map();
  for (const assignment of assignments || []) {
    const existing = assignmentsByMember.get(assignment.member_id) || [];
    const role = roleMap.get(assignment.role_id) || null;
    if (role) {
      existing.push({
        id: role.id,
        role_key: role.role_key,
        name: role.name,
        is_role_admin: Boolean(assignment.is_role_admin),
      });
    }
    assignmentsByMember.set(assignment.member_id, existing);
  }

  return members.map((member) => {
    const roleAssignments = assignmentsByMember.get(member.id) || [];
    return {
      ...member,
      role_ids: roleAssignments.map((item) => item.id),
      roles: roleAssignments,
      role_labels: roleAssignments.map((item) => item.name),
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
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("team_members")
    .select("id, username, full_name, email, phone, is_superuser, is_active, notes, last_login_at, created_at")
    .order("is_superuser", { ascending: false })
    .order("username", { ascending: true })
    .range(offset, offset + limit - 1);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const hydrated = await hydrateTeamMembers(supabase, data || []);
  return NextResponse.json({ teamMembers: hydrated });
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

  const username = normalizeUsername(payload?.username);
  const fullName = normalizeOptionalText(payload?.full_name);
  const email = normalizeEmail(payload?.email);
  const phone = normalizeOptionalText(payload?.phone);
  const notes = normalizeOptionalText(payload?.notes);
  const isSuperuser = parseBoolean(payload?.is_superuser, false);
  const isActive = parseBoolean(payload?.is_active, true);
  const roleIds = normalizeRoleIds(payload?.role_ids);
  const passwordRaw = String(payload?.password || "");
  let passwordHash = null;

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }
  if (passwordRaw) {
    if (passwordRaw.length < 8) {
      return NextResponse.json({ error: "password must be at least 8 characters" }, { status: 400 });
    }
    passwordHash = hashAdminPassword(passwordRaw);
  }

  const { data, error: insertError } = await supabase
    .from("team_members")
    .insert({
      username,
      full_name: fullName,
      email,
      phone,
      notes,
      is_superuser: isSuperuser,
      is_active: isActive,
      password_hash: passwordHash,
    })
    .select("id, username, full_name, email, phone, is_superuser, is_active, notes, last_login_at, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  if (roleIds.length) {
    const { error: assignmentError } = await supabase.from("team_member_roles").insert(
      roleIds.map((roleId) => ({
        member_id: data.id,
        role_id: roleId,
        is_role_admin: false,
      })),
    );

    if (assignmentError) {
      return NextResponse.json({ error: assignmentError.message }, { status: 400 });
    }
  }

  const hydrated = await hydrateTeamMembers(supabase, [data]);
  return NextResponse.json({ teamMember: hydrated[0] || data }, { status: 201 });
}
