import { NextResponse } from "next/server";
import {
  normalizeId,
  normalizeTimestamp,
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

  return NextResponse.json({ teamMemberRole: data });
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

  return NextResponse.json({ teamMemberRole: data });
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
