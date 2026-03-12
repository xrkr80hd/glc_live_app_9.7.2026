import { NextResponse } from "next/server";
import {
  normalizeId,
  normalizeOptionalText,
  parseBoolean,
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
    .from("team_members")
    .select("id, username, full_name, email, phone, is_superuser, is_active, notes, last_login_at, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  const hydrated = await hydrateTeamMembers(supabase, [data]);
  return NextResponse.json({ teamMember: hydrated[0] || data });
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
  const roleIdsProvided = payload?.role_ids !== undefined;
  const roleIds = roleIdsProvided ? normalizeRoleIds(payload?.role_ids) : [];

  if (payload?.username !== undefined) {
    const username = normalizeUsername(payload.username);
    if (!username) {
      return NextResponse.json({ error: "username cannot be empty" }, { status: 400 });
    }
    update.username = username;
  }

  if (payload?.full_name !== undefined) {
    update.full_name = normalizeOptionalText(payload.full_name);
  }

  if (payload?.email !== undefined) {
    update.email = normalizeEmail(payload.email);
  }

  if (payload?.phone !== undefined) {
    update.phone = normalizeOptionalText(payload.phone);
  }

  if (payload?.notes !== undefined) {
    update.notes = normalizeOptionalText(payload.notes);
  }

  if (payload?.password !== undefined) {
    const passwordRaw = String(payload.password || "");
    if (!passwordRaw) {
      update.password_hash = null;
    } else {
      if (passwordRaw.length < 8) {
        return NextResponse.json({ error: "password must be at least 8 characters" }, { status: 400 });
      }
      update.password_hash = hashAdminPassword(passwordRaw);
    }
  }

  if (payload?.is_superuser !== undefined) {
    update.is_superuser = parseBoolean(payload.is_superuser, false);
  }

  if (payload?.is_active !== undefined) {
    update.is_active = parseBoolean(payload.is_active, true);
  }

  if (!Object.keys(update).length && !roleIdsProvided) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  let data = null;
  if (Object.keys(update).length) {
    const updateResult = await supabase
      .from("team_members")
      .update(update)
      .eq("id", id)
      .select("id, username, full_name, email, phone, is_superuser, is_active, notes, last_login_at, created_at")
      .maybeSingle();

    if (updateResult.error) {
      return NextResponse.json({ error: updateResult.error.message }, { status: 400 });
    }
    if (!updateResult.data) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    data = updateResult.data;
  } else {
    const memberResult = await supabase
      .from("team_members")
      .select("id, username, full_name, email, phone, is_superuser, is_active, notes, last_login_at, created_at")
      .eq("id", id)
      .maybeSingle();
    if (memberResult.error) {
      return NextResponse.json({ error: memberResult.error.message }, { status: 400 });
    }
    if (!memberResult.data) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    data = memberResult.data;
  }

  if (roleIdsProvided) {
    const { error: deleteAssignmentsError } = await supabase
      .from("team_member_roles")
      .delete()
      .eq("member_id", id);
    if (deleteAssignmentsError) {
      return NextResponse.json({ error: deleteAssignmentsError.message }, { status: 400 });
    }

    if (roleIds.length) {
      const { error: insertAssignmentsError } = await supabase
        .from("team_member_roles")
        .insert(
          roleIds.map((roleId) => ({
            member_id: id,
            role_id: roleId,
            is_role_admin: false,
          })),
        );
      if (insertAssignmentsError) {
        return NextResponse.json({ error: insertAssignmentsError.message }, { status: 400 });
      }
    }
  }

  const hydrated = await hydrateTeamMembers(supabase, [data]);
  return NextResponse.json({ teamMember: hydrated[0] || data });
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

  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
