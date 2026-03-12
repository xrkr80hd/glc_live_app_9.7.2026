import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeId,
  normalizeOptionalText,
  parseBoolean,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";
import { getMemberRoleKeys, hasAnyRole } from "@/lib/admin-role-access";

const ORDER_REQUEST_STATUSES = new Set([
  "new",
  "reviewing",
  "ordered",
  "fulfilled",
  "declined",
]);

function normalizeStatus(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return ORDER_REQUEST_STATUSES.has(normalized) ? normalized : "";
}

function normalizeMoney(value) {
  if (value == null || value === "") {
    return null;
  }
  const parsed = Number.parseFloat(String(value).replace(/[$,\s]/g, ""));
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.round(parsed * 100) / 100;
}

async function getSessionRoleContext(supabase, session) {
  const roleKeys = session?.memberId
    ? await getMemberRoleKeys(supabase, session.memberId)
    : [];
  return {
    isSuperuser: Boolean(session?.isSuperuser),
    roleKeys,
    isPastor: hasAnyRole(roleKeys, ["pastor"]),
  };
}

function canManageAllOrderRequests(context) {
  return context.isSuperuser || context.isPastor;
}

async function hydrateOrderRequests(supabase, rows) {
  if (!Array.isArray(rows) || !rows.length) {
    return [];
  }

  const roleIds = Array.from(
    new Set(rows.map((row) => normalizeId(row.role_id)).filter(Boolean)),
  );
  const memberIds = Array.from(
    new Set(rows.map((row) => normalizeId(row.requested_by_member_id)).filter(Boolean)),
  );

  let roleMap = new Map();
  let memberMap = new Map();

  if (roleIds.length) {
    const { data: roles } = await supabase
      .from("team_roles")
      .select("id, role_key, name")
      .in("id", roleIds);
    roleMap = new Map((roles || []).map((role) => [role.id, role]));
  }

  if (memberIds.length) {
    const { data: members } = await supabase
      .from("team_members")
      .select("id, username, full_name")
      .in("id", memberIds);
    memberMap = new Map((members || []).map((member) => [member.id, member]));
  }

  return rows.map((row) => {
    const role = roleMap.get(row.role_id) || null;
    const member = memberMap.get(row.requested_by_member_id) || null;
    return {
      ...row,
      role_label: role?.name || "Unknown Role",
      role_key: role?.role_key || "",
      requester_label:
        member?.full_name || member?.username || "Unknown Member",
    };
  });
}

async function memberHasRole(supabase, memberId, roleId) {
  const normalizedMemberId = normalizeId(memberId);
  const normalizedRoleId = normalizeId(roleId);
  if (!normalizedMemberId || !normalizedRoleId) {
    return false;
  }

  const { data, error } = await supabase
    .from("team_member_roles")
    .select("id")
    .eq("member_id", normalizedMemberId)
    .eq("role_id", normalizedRoleId)
    .maybeSingle();

  return Boolean(!error && data?.id);
}

export async function GET(request) {
  const { session, error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const context = await getSessionRoleContext(supabase, session);
  const { searchParams } = new URL(request.url);
  const roleIdFilter = normalizeId(searchParams.get("role_id"));
  const statusFilter = normalizeStatus(searchParams.get("status"));
  const includeClosed = parseBoolean(searchParams.get("include_closed"), true);
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("ministry_order_requests")
    .select(
      "id, role_id, requested_by_member_id, title, request_details, needed_by_date, estimated_cost, status, pastor_notes, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!canManageAllOrderRequests(context)) {
    if (!session.memberId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    query = query.eq("requested_by_member_id", session.memberId);
  }

  if (roleIdFilter) {
    query = query.eq("role_id", roleIdFilter);
  }

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  } else if (!includeClosed) {
    query = query.in("status", ["new", "reviewing", "ordered"]);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const hydrated = await hydrateOrderRequests(supabase, data || []);
  return NextResponse.json({ ministryOrderRequests: hydrated });
}

export async function POST(request) {
  const { session, error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  if (!session.memberId && !session.isSuperuser) {
    return NextResponse.json(
      { error: "A team-member login is required to submit order requests." },
      { status: 403 },
    );
  }

  const context = await getSessionRoleContext(supabase, session);
  const { data: payload, error } = await readJsonBody(request);
  if (error) {
    return error;
  }

  const roleId = normalizeId(payload?.role_id);
  const title = String(payload?.title || "").trim();
  const requestDetails = String(payload?.request_details || "").trim();
  const neededByRaw = payload?.needed_by_date;
  const neededByDate =
    neededByRaw == null || String(neededByRaw).trim() === ""
      ? null
      : normalizeDate(neededByRaw);
  const estimatedCost = normalizeMoney(payload?.estimated_cost);
  const status = normalizeStatus(payload?.status) || "new";
  const pastorNotes = normalizeOptionalText(payload?.pastor_notes);

  if (!roleId) {
    return NextResponse.json({ error: "role_id is required" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!requestDetails) {
    return NextResponse.json({ error: "request_details is required" }, { status: 400 });
  }
  if (neededByRaw != null && String(neededByRaw).trim() !== "" && !neededByDate) {
    return NextResponse.json(
      { error: "needed_by_date must be a valid date (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  if (!canManageAllOrderRequests(context) && session.memberId) {
    const ownsRole = await memberHasRole(supabase, session.memberId, roleId);
    if (!ownsRole) {
      return NextResponse.json(
        { error: "You can only submit requests for roles assigned to your account." },
        { status: 403 },
      );
    }
  }

  const { data, error: insertError } = await supabase
    .from("ministry_order_requests")
    .insert({
      role_id: roleId,
      requested_by_member_id: session.memberId || null,
      title,
      request_details: requestDetails,
      needed_by_date: neededByDate,
      estimated_cost: estimatedCost,
      status,
      pastor_notes: pastorNotes,
      updated_at: new Date().toISOString(),
    })
    .select(
      "id, role_id, requested_by_member_id, title, request_details, needed_by_date, estimated_cost, status, pastor_notes, created_at, updated_at",
    )
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const hydrated = await hydrateOrderRequests(supabase, data ? [data] : []);
  return NextResponse.json({ ministryOrderRequest: hydrated[0] || null }, { status: 201 });
}
