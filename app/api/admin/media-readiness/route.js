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

function toStationKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function loadReadiness(supabase) {
  const [{ data: stations, error: stationError }, { data: templates, error: templateError }] = await Promise.all([
    supabase
      .from("media_stations")
      .select("id, station_key, name, description, sort_order, is_active, created_at, updated_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("checklist_templates")
      .select("id, name, station_id, description, is_active, created_at, updated_at")
      .order("created_at", { ascending: true }),
  ]);

  if (stationError) throw stationError;
  if (templateError) throw templateError;

  const templateIds = (templates || []).map((item) => item.id).filter(Boolean);
  let items = [];
  if (templateIds.length) {
    const { data, error } = await supabase
      .from("checklist_template_items")
      .select("id, template_id, label, sort_order, is_required, created_at")
      .in("template_id", templateIds)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    items = data || [];
  }

  return { stations: stations || [], templates: templates || [], items };
}

async function createStation(supabase, body) {
  const name = normalizeRequiredText(body.name);
  const stationKey = toStationKey(body.stationKey || name);
  if (!name || !stationKey) {
    return NextResponse.json({ error: "Station name is required." }, { status: 400 });
  }

  const sortOrder = Number.parseInt(String(body.sortOrder ?? 0), 10) || 0;
  const { data: station, error } = await supabase
    .from("media_stations")
    .insert({
      station_key: stationKey,
      name,
      description: normalizeOptionalText(body.description),
      sort_order: sortOrder,
      is_active: true,
    })
    .select("id, name")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message || "Unable to create station." }, { status: 500 });
  }

  const { error: templateError } = await supabase.from("checklist_templates").insert({
    name: `${station.name} - Pre-Service`,
    station_id: station.id,
    description: "Default readiness checklist. Edit items from Master Admin.",
    is_active: true,
  });

  if (templateError) {
    await supabase.from("media_stations").delete().eq("id", station.id);
    return NextResponse.json({ error: templateError.message || "Unable to create station checklist." }, { status: 500 });
  }

  return NextResponse.json({ success: true, stationId: station.id });
}

async function updateStation(supabase, body) {
  const stationId = normalizeId(body.stationId);
  if (!stationId) return NextResponse.json({ error: "Station is required." }, { status: 400 });

  const updates = { updated_at: new Date().toISOString() };
  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    const name = normalizeRequiredText(body.name);
    if (!name) return NextResponse.json({ error: "Station name cannot be empty." }, { status: 400 });
    updates.name = name;
  }
  if (Object.prototype.hasOwnProperty.call(body, "description")) updates.description = normalizeOptionalText(body.description);
  if (Object.prototype.hasOwnProperty.call(body, "sortOrder")) updates.sort_order = Number.parseInt(String(body.sortOrder ?? 0), 10) || 0;
  if (Object.prototype.hasOwnProperty.call(body, "isActive")) updates.is_active = Boolean(body.isActive);

  const { error } = await supabase.from("media_stations").update(updates).eq("id", stationId);
  if (error) return NextResponse.json({ error: error.message || "Unable to update station." }, { status: 500 });
  return NextResponse.json({ success: true });
}

async function addItem(supabase, body) {
  const templateId = normalizeId(body.templateId);
  const label = normalizeRequiredText(body.label);
  if (!templateId || !label) return NextResponse.json({ error: "Checklist and item label are required." }, { status: 400 });

  let sortOrder = Number.parseInt(String(body.sortOrder ?? ""), 10);
  if (!Number.isFinite(sortOrder)) {
    const { data: last } = await supabase
      .from("checklist_template_items")
      .select("sort_order")
      .eq("template_id", templateId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = Number(last?.sort_order || 0) + 10;
  }

  const { data, error } = await supabase
    .from("checklist_template_items")
    .insert({
      template_id: templateId,
      label,
      sort_order: sortOrder,
      is_required: body.isRequired !== false,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message || "Unable to add checklist item." }, { status: 500 });
  return NextResponse.json({ success: true, itemId: data.id });
}

async function updateItem(supabase, body) {
  const itemId = normalizeId(body.itemId);
  if (!itemId) return NextResponse.json({ error: "Checklist item is required." }, { status: 400 });

  const updates = {};
  if (Object.prototype.hasOwnProperty.call(body, "label")) {
    const label = normalizeRequiredText(body.label);
    if (!label) return NextResponse.json({ error: "Item label cannot be empty." }, { status: 400 });
    updates.label = label;
  }
  if (Object.prototype.hasOwnProperty.call(body, "sortOrder")) updates.sort_order = Number.parseInt(String(body.sortOrder ?? 0), 10) || 0;
  if (Object.prototype.hasOwnProperty.call(body, "isRequired")) updates.is_required = Boolean(body.isRequired);

  const { error } = await supabase.from("checklist_template_items").update(updates).eq("id", itemId);
  if (error) return NextResponse.json({ error: error.message || "Unable to update checklist item." }, { status: 500 });
  return NextResponse.json({ success: true });
}

async function removeItem(supabase, body) {
  const itemId = normalizeId(body.itemId);
  if (!itemId) return NextResponse.json({ error: "Checklist item is required." }, { status: 400 });
  const { error } = await supabase.from("checklist_template_items").delete().eq("id", itemId);
  if (error) return NextResponse.json({ error: error.message || "Unable to remove checklist item." }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(request) {
  const { error: sessionError } = requireAdminSession(request);
  if (sessionError) return sessionError;
  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) return supabaseError;

  try {
    return NextResponse.json(await loadReadiness(supabase));
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to load media readiness setup." }, { status: 500 });
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
    case "create_station": return createStation(supabase, body);
    case "update_station": return updateStation(supabase, body);
    case "add_item": return addItem(supabase, body);
    case "update_item": return updateItem(supabase, body);
    case "remove_item": return removeItem(supabase, body);
    default: return NextResponse.json({ error: "Unknown media-readiness action." }, { status: 400 });
  }
}
