import { NextResponse } from "next/server";
import {
  normalizeId,
  normalizeOptionalText,
  normalizeRequiredText,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

export const dynamic = "force-dynamic";

async function loadData(supabase, requestedServiceId = "") {
  const [{ data: services, error: servicesError }, { data: members }, { data: roles }, { data: instruments }] = await Promise.all([
    supabase.from("services").select("id, title, starts_at, status").order("starts_at", { ascending: true }).limit(30),
    supabase.from("team_members").select("id, full_name, username, email, is_active").eq("is_active", true).order("full_name", { ascending: true }),
    supabase.from("team_roles").select("id, role_key, name, is_active, sort_order").eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("user_instruments").select("id, member_id, instrument_key, label, preferred_key, is_primary, is_active").eq("is_active", true).order("is_primary", { ascending: false }),
  ]);

  if (servicesError) throw servicesError;
  const serviceList = services || [];
  const serviceId = normalizeId(requestedServiceId) || serviceList[0]?.id || "";
  let assignments = [];
  if (serviceId) {
    const { data, error } = await supabase
      .from("service_team_assignments")
      .select("id, service_id, member_id, role_key, assignment_label, instrument_label, notes, created_at")
      .eq("service_id", serviceId)
      .order("role_key", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    assignments = data || [];
  }

  return {
    services: serviceList,
    selectedServiceId: serviceId,
    members: members || [],
    roles: roles || [],
    instruments: instruments || [],
    assignments,
  };
}

async function assignMember(supabase, body) {
  const serviceId = normalizeId(body.serviceId);
  const memberId = normalizeId(body.memberId);
  const roleKey = normalizeRequiredText(body.roleKey)?.toLowerCase();
  if (!serviceId || !memberId || !roleKey) {
    return NextResponse.json({ error: "Service, member and role are required." }, { status: 400 });
  }

  const [{ data: service }, { data: member }, { data: role }] = await Promise.all([
    supabase.from("services").select("id").eq("id", serviceId).maybeSingle(),
    supabase.from("team_members").select("id").eq("id", memberId).eq("is_active", true).maybeSingle(),
    supabase.from("team_roles").select("role_key").eq("role_key", roleKey).eq("is_active", true).maybeSingle(),
  ]);
  if (!service?.id || !member?.id || !role?.role_key) {
    return NextResponse.json({ error: "Service, member or role could not be found." }, { status: 404 });
  }

  const instrumentLabel = normalizeOptionalText(body.instrumentLabel);
  let existingQuery = supabase
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
    const { error } = await supabase.from("service_team_assignments").update(payload).eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, assignmentId: existing.id });
  }

  const { data, error } = await supabase.from("service_team_assignments").insert(payload).select("id").single();
  if (error) return NextResponse.json({ error: error.message || "Unable to assign team member." }, { status: 500 });
  return NextResponse.json({ success: true, assignmentId: data.id });
}

async function removeAssignment(supabase, body) {
  const assignmentId = normalizeId(body.assignmentId);
  if (!assignmentId) return NextResponse.json({ error: "Assignment is required." }, { status: 400 });
  const { error } = await supabase.from("service_team_assignments").delete().eq("id", assignmentId);
  if (error) return NextResponse.json({ error: error.message || "Unable to remove assignment." }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(request) {
  const { error: sessionError } = requireAdminSession(request);
  if (sessionError) return sessionError;
  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;

  try {
    const url = new URL(request.url);
    return NextResponse.json(await loadData(supabase, url.searchParams.get("service_id") || ""));
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to load service team." }, { status: 500 });
  }
}

export async function POST(request) {
  const { error: sessionError } = requireAdminSession(request);
  if (sessionError) return sessionError;
  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;
  const { data: body, error: bodyError } = await readJsonBody(request);
  if (bodyError) return bodyError;

  switch (String(body?.action || "").trim()) {
    case "assign_member": return assignMember(supabase, body);
    case "remove_assignment": return removeAssignment(supabase, body);
    default: return NextResponse.json({ error: "Unknown service-team action." }, { status: 400 });
  }
}
