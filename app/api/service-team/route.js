import { NextResponse } from "next/server";
import { normalizeId, normalizeOptionalText, normalizeRequiredText, readJsonBody } from "@/lib/admin-api";
import { getMemberRoleKeys, hasAnyRole } from "@/lib/admin-role-access";
import { requireMemberSession } from "@/lib/member-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VIEW_ROLES = ["worship_team", "worship_leader", "media_team", "foh_sound", "pastor", "superuser"];

async function getContext() {
  const auth = await requireMemberSession();
  if (auth.error) return { error: auth.error };
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { error: NextResponse.json({ error: "Service staffing is not configured." }, { status: 500 }) };
  const roleKeys = await getMemberRoleKeys(supabase, auth.member.id);
  const isSuperuser = Boolean(auth.member?.is_superuser || auth.session?.isSuperuser || roleKeys.includes("superuser"));
  const effective = isSuperuser ? Array.from(new Set([...roleKeys, "superuser"])) : roleKeys;
  if (!hasAnyRole(effective, VIEW_ROLES)) {
    return { error: NextResponse.json({ error: "You do not have access to service staffing." }, { status: 403 }) };
  }
  return {
    supabase,
    member: auth.member,
    roleKeys: effective,
    canEditWorship: isSuperuser || effective.includes("worship_leader"),
    error: null,
  };
}

async function loadData(context, requestedServiceId = "") {
  let servicesQuery = context.supabase
    .from("services")
    .select("id, title, starts_at, status")
    .order("starts_at", { ascending: true })
    .limit(30);
  if (!context.canEditWorship) servicesQuery = servicesQuery.eq("status", "published");

  const [{ data: services }, { data: members }, { data: roles }, { data: instruments }] = await Promise.all([
    servicesQuery,
    context.supabase.from("team_members").select("id, full_name, username, is_active").eq("is_active", true).order("full_name", { ascending: true }),
    context.supabase.from("team_roles").select("role_key, name, is_active, sort_order").eq("is_active", true).order("sort_order", { ascending: true }),
    context.supabase.from("user_instruments").select("id, member_id, instrument_key, label, preferred_key, is_primary, is_active").eq("is_active", true).order("is_primary", { ascending: false }),
  ]);

  const serviceList = services || [];
  const serviceId = normalizeId(requestedServiceId) || serviceList[0]?.id || "";
  let assignments = [];
  if (serviceId) {
    const { data } = await context.supabase
      .from("service_team_assignments")
      .select("id, service_id, member_id, role_key, assignment_label, instrument_label, notes, created_at")
      .eq("service_id", serviceId)
      .order("role_key", { ascending: true })
      .order("created_at", { ascending: true });
    assignments = data || [];
  }

  return {
    services: serviceList,
    selectedServiceId: serviceId,
    members: members || [],
    roles: roles || [],
    instruments: instruments || [],
    assignments,
    access: { canEditWorship: context.canEditWorship },
  };
}

async function assignWorship(context, body) {
  if (!context.canEditWorship) return NextResponse.json({ error: "Worship Leader access is required." }, { status: 403 });
  const serviceId = normalizeId(body.serviceId);
  const memberId = normalizeId(body.memberId);
  const roleKey = String(body.roleKey || "worship_team").trim().toLowerCase();
  if (!serviceId || !memberId || !["worship_team", "worship_leader"].includes(roleKey)) {
    return NextResponse.json({ error: "A valid service, member and worship role are required." }, { status: 400 });
  }

  const instrumentLabel = normalizeOptionalText(body.instrumentLabel);
  let existingQuery = context.supabase
    .from("service_team_assignments")
    .select("id")
    .eq("service_id", serviceId)
    .eq("member_id", memberId)
    .eq("role_key", roleKey);
  existingQuery = instrumentLabel ? existingQuery.eq("instrument_label", instrumentLabel) : existingQuery.is("instrument_label", null);
  const { data: existing } = await existingQuery.limit(1).maybeSingle();

  const payload = {
    service_id: serviceId,
    member_id: memberId,
    role_key: roleKey,
    assignment_label: normalizeOptionalText(body.assignmentLabel),
    instrument_label: instrumentLabel,
    notes: normalizeOptionalText(body.notes),
  };

  if (existing?.id) {
    const { error } = await context.supabase.from("service_team_assignments").update(payload).eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, assignmentId: existing.id });
  }

  const { data, error } = await context.supabase.from("service_team_assignments").insert(payload).select("id").single();
  if (error) return NextResponse.json({ error: error.message || "Unable to assign worship team member." }, { status: 500 });
  return NextResponse.json({ success: true, assignmentId: data.id });
}

async function removeWorship(context, body) {
  if (!context.canEditWorship) return NextResponse.json({ error: "Worship Leader access is required." }, { status: 403 });
  const assignmentId = normalizeId(body.assignmentId);
  if (!assignmentId) return NextResponse.json({ error: "Assignment is required." }, { status: 400 });

  const { data: assignment } = await context.supabase
    .from("service_team_assignments")
    .select("id, role_key")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!assignment?.id || !["worship_team", "worship_leader"].includes(assignment.role_key)) {
    return NextResponse.json({ error: "Worship assignment not found." }, { status: 404 });
  }

  const { error } = await context.supabase.from("service_team_assignments").delete().eq("id", assignmentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(request) {
  const context = await getContext();
  if (context.error) return context.error;
  const url = new URL(request.url);
  try {
    return NextResponse.json(await loadData(context, url.searchParams.get("service_id") || ""));
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to load service staffing." }, { status: 500 });
  }
}

export async function POST(request) {
  const context = await getContext();
  if (context.error) return context.error;
  const { data: body, error } = await readJsonBody(request);
  if (error) return error;
  switch (String(body?.action || "").trim()) {
    case "assign_worship": return assignWorship(context, body);
    case "remove_worship": return removeWorship(context, body);
    default: return NextResponse.json({ error: "Unknown service-team action." }, { status: 400 });
  }
}
