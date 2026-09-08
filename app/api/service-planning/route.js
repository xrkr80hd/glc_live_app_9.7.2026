import { NextResponse } from "next/server";
import { readJsonBody, normalizeId, normalizeOptionalText, normalizeRequiredText } from "@/lib/admin-api";
import { getMemberRoleKeys, hasAnyRole } from "@/lib/admin-role-access";
import { requireMemberSession } from "@/lib/member-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VIEW_ROLES = ["worship_team", "worship_leader", "media_team", "foh_sound", "pastor", "superuser"];
const EDIT_PLAN_ROLES = ["worship_leader", "superuser"];
const CHECKLIST_ROLES = ["media_team", "superuser"];

async function getAccessContext() {
  const auth = await requireMemberSession();
  if (auth.error) {
    return { error: auth.error };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: "Service planning is not configured." }, { status: 500 }) };
  }

  const roleKeys = await getMemberRoleKeys(supabase, auth.member.id);
  const isSuperuser = Boolean(auth.member?.is_superuser || auth.session?.isSuperuser || roleKeys.includes("superuser"));
  const effectiveRoleKeys = isSuperuser ? Array.from(new Set([...roleKeys, "superuser"])) : roleKeys;

  if (!hasAnyRole(effectiveRoleKeys, VIEW_ROLES)) {
    return { error: NextResponse.json({ error: "You do not have access to service planning." }, { status: 403 }) };
  }

  return {
    supabase,
    member: auth.member,
    roleKeys: effectiveRoleKeys,
    canEditPlan: isSuperuser || hasAnyRole(effectiveRoleKeys, EDIT_PLAN_ROLES),
    canManageChecklist: isSuperuser || hasAnyRole(effectiveRoleKeys, CHECKLIST_ROLES),
    error: null,
  };
}

async function loadPlannerData(context, requestedServiceId = "") {
  const { supabase, canEditPlan, canManageChecklist } = context;
  let servicesQuery = supabase
    .from("services")
    .select("id, title, starts_at, status, service_notes, worship_notes, media_notes, foh_notes, published_at, created_at, updated_at")
    .order("starts_at", { ascending: true })
    .limit(30);

  if (!canEditPlan) {
    servicesQuery = servicesQuery.eq("status", "published");
  }

  const { data: services, error: servicesError } = await servicesQuery;
  if (servicesError) throw servicesError;

  const serviceList = Array.isArray(services) ? services : [];
  const selectedServiceId = normalizeId(requestedServiceId) || serviceList[0]?.id || "";

  const [{ data: members }, { data: stations }] = await Promise.all([
    supabase
      .from("team_members")
      .select("id, full_name, username")
      .eq("is_active", true)
      .order("full_name", { ascending: true }),
    supabase
      .from("media_stations")
      .select("id, station_key, name, description, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (!selectedServiceId) {
    return {
      services: serviceList,
      selectedService: null,
      serviceSongs: [],
      members: members || [],
      stations: stations || [],
      checklistRuns: [],
      checklistItems: [],
      access: { canEditPlan, canManageChecklist },
    };
  }

  let selectedService = serviceList.find((item) => item.id === selectedServiceId) || null;
  if (!selectedService) {
    let selectedQuery = supabase
      .from("services")
      .select("id, title, starts_at, status, service_notes, worship_notes, media_notes, foh_notes, published_at, created_at, updated_at")
      .eq("id", selectedServiceId);
    if (!canEditPlan) selectedQuery = selectedQuery.eq("status", "published");
    const { data } = await selectedQuery.maybeSingle();
    selectedService = data || null;
  }

  if (!selectedService) {
    return {
      services: serviceList,
      selectedService: null,
      serviceSongs: [],
      members: members || [],
      stations: stations || [],
      checklistRuns: [],
      checklistItems: [],
      access: { canEditPlan, canManageChecklist },
    };
  }

  const [{ data: serviceSongs }, { data: checklistRuns }] = await Promise.all([
    supabase
      .from("service_songs")
      .select("id, service_id, sort_order, title_snapshot, artist_snapshot, key_override, lead_member_id, arrangement_notes")
      .eq("service_id", selectedService.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("service_checklist_runs")
      .select("id, service_id, station_id, assigned_member_id, status, started_at, completed_at")
      .eq("service_id", selectedService.id)
      .order("created_at", { ascending: true }),
  ]);

  const runIds = (checklistRuns || []).map((run) => run.id).filter(Boolean);
  let checklistItems = [];
  if (runIds.length) {
    const { data } = await supabase
      .from("service_checklist_run_items")
      .select("id, run_id, label_snapshot, sort_order, is_required, is_complete, completed_by_member_id, completed_at")
      .in("run_id", runIds)
      .order("sort_order", { ascending: true });
    checklistItems = data || [];
  }

  return {
    services: serviceList,
    selectedService,
    serviceSongs: serviceSongs || [],
    members: members || [],
    stations: stations || [],
    checklistRuns: checklistRuns || [],
    checklistItems,
    access: { canEditPlan, canManageChecklist },
  };
}

async function createService(context, body) {
  if (!context.canEditPlan) return NextResponse.json({ error: "Worship Leader access is required." }, { status: 403 });
  const title = normalizeRequiredText(body.title) || "Sunday Service";
  const date = new Date(String(body.startsAt || ""));
  if (Number.isNaN(date.getTime())) return NextResponse.json({ error: "A valid service date and time is required." }, { status: 400 });

  const { data, error } = await context.supabase
    .from("services")
    .insert({
      title,
      starts_at: date.toISOString(),
      service_notes: normalizeOptionalText(body.serviceNotes),
      created_by_member_id: context.member.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, serviceId: data.id });
}

async function addSong(context, body) {
  if (!context.canEditPlan) return NextResponse.json({ error: "Worship Leader access is required." }, { status: 403 });
  const serviceId = normalizeId(body.serviceId);
  const title = normalizeRequiredText(body.title);
  if (!serviceId || !title) return NextResponse.json({ error: "Service and song title are required." }, { status: 400 });

  const { data: service } = await context.supabase.from("services").select("id").eq("id", serviceId).maybeSingle();
  if (!service?.id) return NextResponse.json({ error: "Service not found." }, { status: 404 });

  const artist = normalizeOptionalText(body.artist);
  const { data: last } = await context.supabase
    .from("service_songs")
    .select("sort_order")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await context.supabase
    .from("service_songs")
    .insert({
      service_id: serviceId,
      sort_order: Number(last?.sort_order || 0) + 10,
      title_snapshot: title,
      artist_snapshot: artist,
      key_override: normalizeOptionalText(body.keyOverride),
      lead_member_id: normalizeId(body.leadMemberId) || null,
      arrangement_notes: normalizeOptionalText(body.arrangementNotes),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, serviceSongId: data.id });
}

async function updateSong(context, body) {
  if (!context.canEditPlan) return NextResponse.json({ error: "Worship Leader access is required." }, { status: 403 });
  const serviceSongId = normalizeId(body.serviceSongId);
  if (!serviceSongId) return NextResponse.json({ error: "Song assignment is required." }, { status: 400 });

  const updates = { updated_at: new Date().toISOString() };
  if (Object.prototype.hasOwnProperty.call(body, "leadMemberId")) updates.lead_member_id = normalizeId(body.leadMemberId) || null;
  if (Object.prototype.hasOwnProperty.call(body, "keyOverride")) updates.key_override = normalizeOptionalText(body.keyOverride);
  if (Object.prototype.hasOwnProperty.call(body, "arrangementNotes")) updates.arrangement_notes = normalizeOptionalText(body.arrangementNotes);

  const { error } = await context.supabase.from("service_songs").update(updates).eq("id", serviceSongId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

async function removeSong(context, body) {
  if (!context.canEditPlan) return NextResponse.json({ error: "Worship Leader access is required." }, { status: 403 });
  const serviceSongId = normalizeId(body.serviceSongId);
  if (!serviceSongId) return NextResponse.json({ error: "Song assignment is required." }, { status: 400 });
  const { error } = await context.supabase.from("service_songs").delete().eq("id", serviceSongId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

async function setServiceStatus(context, body) {
  if (!context.canEditPlan) return NextResponse.json({ error: "Worship Leader access is required." }, { status: 403 });
  const serviceId = normalizeId(body.serviceId);
  const status = String(body.status || "").trim().toLowerCase();
  if (!serviceId || !["draft", "published", "completed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Valid service and status are required." }, { status: 400 });
  }
  const now = new Date().toISOString();
  const updates = { status, updated_at: now, published_at: status === "published" ? now : null };
  const { error } = await context.supabase.from("services").update(updates).eq("id", serviceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

async function initializeChecklists(context, body) {
  if (!context.canManageChecklist && !context.canEditPlan) {
    return NextResponse.json({ error: "Media Team or Worship Leader access is required." }, { status: 403 });
  }
  const serviceId = normalizeId(body.serviceId);
  if (!serviceId) return NextResponse.json({ error: "Service is required." }, { status: 400 });

  const { data: stations } = await context.supabase
    .from("media_stations")
    .select("id")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  for (const station of stations || []) {
    const { data: template } = await context.supabase
      .from("checklist_templates")
      .select("id")
      .eq("station_id", station.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!template?.id) continue;

    const { data: run } = await context.supabase
      .from("service_checklist_runs")
      .upsert({ service_id: serviceId, station_id: station.id, template_id: template.id }, { onConflict: "service_id,station_id" })
      .select("id")
      .single();
    if (!run?.id) continue;

    const { count } = await context.supabase.from("service_checklist_run_items").select("id", { count: "exact", head: true }).eq("run_id", run.id);
    if ((count || 0) > 0) continue;

    const { data: templateItems } = await context.supabase
      .from("checklist_template_items")
      .select("id, label, sort_order, is_required")
      .eq("template_id", template.id)
      .order("sort_order", { ascending: true });
    if (templateItems?.length) {
      await context.supabase.from("service_checklist_run_items").insert(
        templateItems.map((item) => ({
          run_id: run.id,
          template_item_id: item.id,
          label_snapshot: item.label,
          sort_order: item.sort_order,
          is_required: item.is_required,
        })),
      );
    }
  }
  return NextResponse.json({ success: true });
}

async function toggleChecklistItem(context, body) {
  if (!context.canManageChecklist) return NextResponse.json({ error: "Media Team access is required." }, { status: 403 });
  const itemId = normalizeId(body.itemId);
  if (!itemId) return NextResponse.json({ error: "Checklist item is required." }, { status: 400 });
  const isComplete = Boolean(body.isComplete);
  const now = new Date().toISOString();

  const { data: item, error } = await context.supabase
    .from("service_checklist_run_items")
    .update({
      is_complete: isComplete,
      completed_by_member_id: isComplete ? context.member.id : null,
      completed_at: isComplete ? now : null,
      updated_at: now,
    })
    .eq("id", itemId)
    .select("run_id")
    .single();
  if (error || !item?.run_id) return NextResponse.json({ error: error?.message || "Unable to update checklist." }, { status: 500 });

  const { data: items } = await context.supabase.from("service_checklist_run_items").select("is_required, is_complete").eq("run_id", item.run_id);
  const list = items || [];
  const required = list.filter((entry) => entry.is_required);
  const complete = required.length > 0 && required.every((entry) => entry.is_complete);
  const anyComplete = list.some((entry) => entry.is_complete);
  await context.supabase
    .from("service_checklist_runs")
    .update({
      status: complete ? "complete" : anyComplete ? "in_progress" : "not_started",
      started_at: anyComplete ? now : null,
      completed_at: complete ? now : null,
      updated_at: now,
    })
    .eq("id", item.run_id);

  return NextResponse.json({ success: true });
}

export async function GET(request) {
  const context = await getAccessContext();
  if (context.error) return context.error;
  try {
    const url = new URL(request.url);
    return NextResponse.json(await loadPlannerData(context, url.searchParams.get("service_id") || ""));
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to load service plan." }, { status: 500 });
  }
}

export async function POST(request) {
  const context = await getAccessContext();
  if (context.error) return context.error;
  const { data: body, error } = await readJsonBody(request);
  if (error) return error;

  switch (String(body?.action || "").trim()) {
    case "create_service": return createService(context, body);
    case "add_song": return addSong(context, body);
    case "update_song": return updateSong(context, body);
    case "remove_song": return removeSong(context, body);
    case "set_service_status": return setServiceStatus(context, body);
    case "initialize_checklists": return initializeChecklists(context, body);
    case "toggle_checklist_item": return toggleChecklistItem(context, body);
    default: return NextResponse.json({ error: "Unknown service-planning action." }, { status: 400 });
  }
}
