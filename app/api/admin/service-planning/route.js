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

async function loadPlannerData(supabase, requestedServiceId = "") {
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, title, starts_at, status, service_notes, worship_notes, media_notes, foh_notes, published_at, created_at, updated_at")
    .order("starts_at", { ascending: false })
    .limit(30);

  if (servicesError) {
    throw servicesError;
  }

  const serviceList = Array.isArray(services) ? services : [];
  const selectedServiceId = normalizeId(requestedServiceId) || serviceList[0]?.id || "";

  const [{ data: members }, { data: stations }] = await Promise.all([
    supabase
      .from("team_members")
      .select("id, full_name, email, username, is_active")
      .eq("is_active", true)
      .order("full_name", { ascending: true }),
    supabase
      .from("media_stations")
      .select("id, station_key, name, description, sort_order, is_active")
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
    };
  }

  const selectedService = serviceList.find((item) => item.id === selectedServiceId) || null;
  const [{ data: serviceSongs }, { data: checklistRuns }] = await Promise.all([
    supabase
      .from("service_songs")
      .select("id, service_id, song_id, sort_order, title_snapshot, artist_snapshot, key_override, lead_member_id, arrangement_notes, created_at, updated_at")
      .eq("service_id", selectedServiceId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("service_checklist_runs")
      .select("id, service_id, station_id, template_id, assigned_member_id, status, started_at, completed_at, created_at, updated_at")
      .eq("service_id", selectedServiceId)
      .order("created_at", { ascending: true }),
  ]);

  const runIds = (checklistRuns || []).map((run) => run.id).filter(Boolean);
  let checklistItems = [];
  if (runIds.length) {
    const { data } = await supabase
      .from("service_checklist_run_items")
      .select("id, run_id, template_item_id, label_snapshot, sort_order, is_required, is_complete, completed_by_member_id, completed_at, created_at, updated_at")
      .in("run_id", runIds)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
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
  };
}

async function createService(supabase, session, body) {
  const title = normalizeRequiredText(body.title) || "Sunday Service";
  const rawStartsAt = String(body.startsAt || "").trim();
  const startsAtDate = rawStartsAt ? new Date(rawStartsAt) : null;
  if (!startsAtDate || Number.isNaN(startsAtDate.getTime())) {
    return NextResponse.json({ error: "A valid service date and time is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("services")
    .insert({
      title,
      starts_at: startsAtDate.toISOString(),
      service_notes: normalizeOptionalText(body.serviceNotes),
      created_by_member_id: normalizeId(session.memberId) || null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message || "Unable to create service." }, { status: 500 });
  }

  return NextResponse.json({ success: true, serviceId: data.id });
}

async function addSong(supabase, body) {
  const serviceId = normalizeId(body.serviceId);
  const title = normalizeRequiredText(body.title);
  if (!serviceId || !title) {
    return NextResponse.json({ error: "Service and song title are required." }, { status: 400 });
  }

  const artist = normalizeOptionalText(body.artist);
  let songId = null;

  let songQuery = supabase.from("songs").select("id").eq("title", title).limit(1);
  if (artist) {
    songQuery = songQuery.eq("artist", artist);
  } else {
    songQuery = songQuery.is("artist", null);
  }
  const { data: existingSong } = await songQuery.maybeSingle();

  if (existingSong?.id) {
    songId = existingSong.id;
  } else {
    const { data: createdSong, error: songError } = await supabase
      .from("songs")
      .insert({
        title,
        artist,
        default_key: normalizeOptionalText(body.keyOverride),
      })
      .select("id")
      .single();
    if (!songError && createdSong?.id) {
      songId = createdSong.id;
    }
  }

  const { data: lastSong } = await supabase
    .from("service_songs")
    .select("sort_order")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSortOrder = Number(lastSong?.sort_order || 0) + 10;
  const { data, error } = await supabase
    .from("service_songs")
    .insert({
      service_id: serviceId,
      song_id: songId,
      sort_order: nextSortOrder,
      title_snapshot: title,
      artist_snapshot: artist,
      key_override: normalizeOptionalText(body.keyOverride),
      lead_member_id: normalizeId(body.leadMemberId) || null,
      arrangement_notes: normalizeOptionalText(body.arrangementNotes),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message || "Unable to add song." }, { status: 500 });
  }

  return NextResponse.json({ success: true, serviceSongId: data.id });
}

async function updateSong(supabase, body) {
  const serviceSongId = normalizeId(body.serviceSongId);
  if (!serviceSongId) {
    return NextResponse.json({ error: "Song assignment is required." }, { status: 400 });
  }

  const updates = {};
  if (Object.prototype.hasOwnProperty.call(body, "leadMemberId")) {
    updates.lead_member_id = normalizeId(body.leadMemberId) || null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "keyOverride")) {
    updates.key_override = normalizeOptionalText(body.keyOverride);
  }
  if (Object.prototype.hasOwnProperty.call(body, "arrangementNotes")) {
    updates.arrangement_notes = normalizeOptionalText(body.arrangementNotes);
  }
  updates.updated_at = new Date().toISOString();

  const { error } = await supabase.from("service_songs").update(updates).eq("id", serviceSongId);
  if (error) {
    return NextResponse.json({ error: error.message || "Unable to update song." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

async function removeSong(supabase, body) {
  const serviceSongId = normalizeId(body.serviceSongId);
  if (!serviceSongId) {
    return NextResponse.json({ error: "Song assignment is required." }, { status: 400 });
  }
  const { error } = await supabase.from("service_songs").delete().eq("id", serviceSongId);
  if (error) {
    return NextResponse.json({ error: error.message || "Unable to remove song." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

async function setServiceStatus(supabase, body) {
  const serviceId = normalizeId(body.serviceId);
  const status = String(body.status || "").trim().toLowerCase();
  if (!serviceId || !["draft", "published", "completed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Valid service and status are required." }, { status: 400 });
  }

  const updates = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "published") {
    updates.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("services").update(updates).eq("id", serviceId);
  if (error) {
    return NextResponse.json({ error: error.message || "Unable to update service." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

async function initializeChecklists(supabase, body) {
  const serviceId = normalizeId(body.serviceId);
  if (!serviceId) {
    return NextResponse.json({ error: "Service is required." }, { status: 400 });
  }

  const { data: stations, error: stationError } = await supabase
    .from("media_stations")
    .select("id")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (stationError) {
    return NextResponse.json({ error: stationError.message }, { status: 500 });
  }

  for (const station of stations || []) {
    const { data: template } = await supabase
      .from("checklist_templates")
      .select("id")
      .eq("station_id", station.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!template?.id) {
      continue;
    }

    const { data: run, error: runError } = await supabase
      .from("service_checklist_runs")
      .upsert(
        {
          service_id: serviceId,
          station_id: station.id,
          template_id: template.id,
        },
        { onConflict: "service_id,station_id" },
      )
      .select("id")
      .single();

    if (runError || !run?.id) {
      continue;
    }

    const { count } = await supabase
      .from("service_checklist_run_items")
      .select("id", { count: "exact", head: true })
      .eq("run_id", run.id);

    if ((count || 0) > 0) {
      continue;
    }

    const { data: templateItems } = await supabase
      .from("checklist_template_items")
      .select("id, label, sort_order, is_required")
      .eq("template_id", template.id)
      .order("sort_order", { ascending: true });

    if (templateItems?.length) {
      await supabase.from("service_checklist_run_items").insert(
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

async function toggleChecklistItem(supabase, session, body) {
  const itemId = normalizeId(body.itemId);
  const isComplete = Boolean(body.isComplete);
  if (!itemId) {
    return NextResponse.json({ error: "Checklist item is required." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { data: item, error } = await supabase
    .from("service_checklist_run_items")
    .update({
      is_complete: isComplete,
      completed_at: isComplete ? now : null,
      completed_by_member_id: isComplete ? normalizeId(session.memberId) || null : null,
      updated_at: now,
    })
    .eq("id", itemId)
    .select("run_id")
    .single();

  if (error || !item?.run_id) {
    return NextResponse.json({ error: error?.message || "Unable to update checklist item." }, { status: 500 });
  }

  const { data: runItems } = await supabase
    .from("service_checklist_run_items")
    .select("is_required, is_complete")
    .eq("run_id", item.run_id);

  const items = runItems || [];
  const requiredItems = items.filter((entry) => entry.is_required);
  const isCompleteRun = requiredItems.length > 0 && requiredItems.every((entry) => entry.is_complete);
  const hasAnyComplete = items.some((entry) => entry.is_complete);
  const runStatus = isCompleteRun ? "complete" : hasAnyComplete ? "in_progress" : "not_started";

  const runUpdates = {
    status: runStatus,
    updated_at: now,
    completed_at: isCompleteRun ? now : null,
  };
  if (hasAnyComplete) {
    runUpdates.started_at = now;
  }

  await supabase.from("service_checklist_runs").update(runUpdates).eq("id", item.run_id);
  return NextResponse.json({ success: true, runStatus });
}

export async function GET(request) {
  const { error: sessionError } = requireAdminSession(request);
  if (sessionError) return sessionError;
  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;

  try {
    const url = new URL(request.url);
    const data = await loadPlannerData(supabase, url.searchParams.get("service_id") || "");
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to load service planning." }, { status: 500 });
  }
}

export async function POST(request) {
  const { session, error: sessionError } = requireAdminSession(request);
  if (sessionError) return sessionError;
  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;
  const { data: body, error: bodyError } = await readJsonBody(request);
  if (bodyError) return bodyError;

  switch (String(body?.action || "").trim()) {
    case "create_service":
      return createService(supabase, session, body);
    case "add_song":
      return addSong(supabase, body);
    case "update_song":
      return updateSong(supabase, body);
    case "remove_song":
      return removeSong(supabase, body);
    case "set_service_status":
      return setServiceStatus(supabase, body);
    case "initialize_checklists":
      return initializeChecklists(supabase, body);
    case "toggle_checklist_item":
      return toggleChecklistItem(supabase, session, body);
    default:
      return NextResponse.json({ error: "Unknown service-planning action." }, { status: 400 });
  }
}
