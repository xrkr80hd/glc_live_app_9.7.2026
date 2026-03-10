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

  return NextResponse.json({ teamMemberRoles: data || [] });
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

  return NextResponse.json({ teamMemberRole: data }, { status: 201 });
}
