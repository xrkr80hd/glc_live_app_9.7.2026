import { NextResponse } from "next/server";
import { normalizeId, readJsonBody, requireAdminSession, requireAdminSupabase } from "@/lib/admin-api";

async function getId(context) {
  const params = await Promise.resolve(context?.params);
  return normalizeId(params?.id);
}

function normalizeIds(value) {
  return Array.from(new Set((Array.isArray(value) ? value : []).map((entry) => normalizeId(entry)).filter(Boolean)));
}

export async function GET(request, context) {
  const { error: authError } = requireAdminSession(request);
  if (authError) return authError;
  const memberId = await getId(context);
  if (!memberId) return NextResponse.json({ error: "Member is required." }, { status: 400 });
  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;

  const { data, error } = await supabase
    .from("team_member_roles")
    .select("role_id,is_role_admin")
    .eq("member_id", memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({
    roleAdminIds: (data || []).filter((row) => row.is_role_admin).map((row) => row.role_id),
  });
}

export async function PATCH(request, context) {
  const { error: authError } = requireAdminSession(request);
  if (authError) return authError;
  const memberId = await getId(context);
  if (!memberId) return NextResponse.json({ error: "Member is required." }, { status: 400 });
  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;
  const { data: payload, error: bodyError } = await readJsonBody(request);
  if (bodyError) return bodyError;

  const requestedAdminIds = normalizeIds(payload?.role_admin_ids);
  const { data: assignments, error: assignmentError } = await supabase
    .from("team_member_roles")
    .select("role_id")
    .eq("member_id", memberId);
  if (assignmentError) return NextResponse.json({ error: assignmentError.message }, { status: 400 });

  const assignedIds = new Set((assignments || []).map((row) => row.role_id));
  const invalid = requestedAdminIds.filter((id) => !assignedIds.has(id));
  if (invalid.length) {
    return NextResponse.json({ error: "A person can only lead a ministry role already assigned to their account." }, { status: 400 });
  }

  const { error: clearError } = await supabase
    .from("team_member_roles")
    .update({ is_role_admin: false })
    .eq("member_id", memberId);
  if (clearError) return NextResponse.json({ error: clearError.message }, { status: 400 });

  if (requestedAdminIds.length) {
    const { error: setError } = await supabase
      .from("team_member_roles")
      .update({ is_role_admin: true })
      .eq("member_id", memberId)
      .in("role_id", requestedAdminIds);
    if (setError) return NextResponse.json({ error: setError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, roleAdminIds: requestedAdminIds });
}
