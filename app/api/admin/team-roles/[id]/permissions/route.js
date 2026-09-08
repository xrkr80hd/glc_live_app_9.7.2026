import { NextResponse } from "next/server";
import { normalizeId, readJsonBody, requireAdminSession, requireAdminSupabase } from "@/lib/admin-api";

async function getId(context) {
  const params = await Promise.resolve(context?.params);
  return normalizeId(params?.id);
}

export async function GET(request, context) {
  const { error: authError } = requireAdminSession(request);
  if (authError) return authError;
  const roleId = await getId(context);
  if (!roleId) return NextResponse.json({ error: "Role is required." }, { status: 400 });
  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ permissionIds: (data || []).map((row) => row.permission_id) });
}

export async function PATCH(request, context) {
  const { session, error: authError } = requireAdminSession(request);
  if (authError) return authError;
  const roleId = await getId(context);
  if (!roleId) return NextResponse.json({ error: "Role is required." }, { status: 400 });
  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;
  const { data: payload, error: bodyError } = await readJsonBody(request);
  if (bodyError) return bodyError;
  const permissionIds = Array.from(new Set((Array.isArray(payload?.permission_ids) ? payload.permission_ids : []).map(normalizeId).filter(Boolean)));

  const { data: role } = await supabase.from("team_roles").select("id,is_system").eq("id", roleId).maybeSingle();
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });

  const { error: deleteError } = await supabase.from("role_permissions").delete().eq("role_id", roleId);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

  if (permissionIds.length) {
    const rows = permissionIds.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
      granted_by_member_id: session?.memberId || null,
    }));
    const { error: insertError } = await supabase.from("role_permissions").insert(rows);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, permissionIds });
}
