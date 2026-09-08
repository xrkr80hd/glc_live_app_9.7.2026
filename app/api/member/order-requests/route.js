import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const REVIEW_STATUSES = new Set(["new", "reviewing", "ordered", "fulfilled", "declined"]);

function bearerToken(request) {
  return String(request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
}

async function getViewer(request) {
  const token = bearerToken(request);
  if (!token) return null;
  const db = createSupabaseAdminClient();
  if (!db) return null;
  const { data: authData } = await db.auth.getUser(token);
  const user = authData?.user;
  if (!user?.id) return null;
  const { data: member } = await db
    .from("team_members")
    .select("id,full_name,username,is_superuser,is_active")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (!member?.id) return null;
  const { data: assignments } = await db
    .from("team_member_roles")
    .select("role_id,team_roles(id,role_key,name,description,is_active)")
    .eq("member_id", member.id);
  const roles = (assignments || []).map((row) => row.team_roles).filter((role) => role?.is_active !== false);
  const roleIds = roles.map((role) => role.id);
  let grants = [];
  if (roleIds.length) {
    const { data } = await db
      .from("role_permissions")
      .select("role_id,permissions(permission_key)")
      .in("role_id", roleIds);
    grants = data || [];
  }
  const permissionsByRole = new Map();
  const permissionKeys = new Set();
  for (const grant of grants) {
    const key = grant.permissions?.permission_key;
    if (!key) continue;
    permissionKeys.add(key);
    const set = permissionsByRole.get(grant.role_id) || new Set();
    set.add(key);
    permissionsByRole.set(grant.role_id, set);
  }
  return { db, member, roles, permissionsByRole, permissionKeys };
}

function hasPermission(viewer, key) {
  return viewer.member.is_superuser || viewer.permissionKeys.has(key);
}

function canSubmitForRole(viewer, roleId) {
  if (viewer.member.is_superuser) return true;
  return viewer.permissionsByRole.get(roleId)?.has("order_requests_submit") || false;
}

function canViewMinistryRole(viewer, roleId) {
  if (viewer.member.is_superuser) return true;
  return Boolean(viewer.permissionsByRole.get(roleId)?.has("order_requests_view_ministry"));
}

async function hydrate(db, rows) {
  const roleIds = [...new Set((rows || []).map((row) => row.role_id).filter(Boolean))];
  const memberIds = [...new Set((rows || []).map((row) => row.requested_by_member_id).filter(Boolean))];
  const [{ data: roles }, { data: members }] = await Promise.all([
    roleIds.length ? db.from("team_roles").select("id,role_key,name").in("id", roleIds) : Promise.resolve({ data: [] }),
    memberIds.length ? db.from("team_members").select("id,full_name,username").in("id", memberIds) : Promise.resolve({ data: [] }),
  ]);
  const roleMap = new Map((roles || []).map((role) => [role.id, role]));
  const memberMap = new Map((members || []).map((member) => [member.id, member]));
  return (rows || []).map((row) => ({
    ...row,
    role: roleMap.get(row.role_id) || null,
    requester: memberMap.get(row.requested_by_member_id) || null,
  }));
}

export async function GET(request) {
  const viewer = await getViewer(request);
  if (!viewer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  try {
    const canViewAll = hasPermission(viewer, "order_requests_full_visibility");
    const visibleRoleIds = viewer.roles
      .filter((role) => canViewMinistryRole(viewer, role.id) || canSubmitForRole(viewer, role.id))
      .map((role) => role.id);
    let query = viewer.db
      .from("ministry_order_requests")
      .select("id,role_id,requested_by_member_id,title,request_details,needed_by_date,estimated_cost,status,pastor_notes,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!viewer.member.is_superuser && !canViewAll) {
      if (visibleRoleIds.length) {
        query = query.or(`requested_by_member_id.eq.${viewer.member.id},role_id.in.(${visibleRoleIds.join(",")})`);
      } else {
        query = query.eq("requested_by_member_id", viewer.member.id);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    const hydrated = await hydrate(viewer.db, data || []);
    const submitRoles = viewer.roles.filter((role) => canSubmitForRole(viewer, role.id));
    return NextResponse.json({
      requests: hydrated,
      submitRoles,
      canReview: hasPermission(viewer, "order_requests_review"),
      canApprove: hasPermission(viewer, "order_requests_approve"),
      canViewBudget: hasPermission(viewer, "order_requests_budget_view"),
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Unable to load ministry requests." }, { status: 500 });
  }
}

export async function POST(request) {
  const viewer = await getViewer(request);
  if (!viewer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const roleId = String(body?.role_id || "").trim();
  const title = String(body?.title || "").trim();
  const details = String(body?.request_details || "").trim();
  const neededBy = String(body?.needed_by_date || "").trim() || null;
  const estimatedCostRaw = String(body?.estimated_cost ?? "").trim();
  const estimatedCost = estimatedCostRaw === "" ? null : Number.parseFloat(estimatedCostRaw.replace(/[$,]/g, ""));

  if (!roleId || !viewer.roles.some((role) => role.id === roleId)) {
    return NextResponse.json({ error: "Choose one of your ministries." }, { status: 400 });
  }
  if (!canSubmitForRole(viewer, roleId)) {
    return NextResponse.json({ error: "This ministry cannot submit requests." }, { status: 403 });
  }
  if (!title) return NextResponse.json({ error: "A request title is required." }, { status: 400 });
  if (!details) return NextResponse.json({ error: "Please describe what is needed." }, { status: 400 });
  if (estimatedCostRaw && !Number.isFinite(estimatedCost)) {
    return NextResponse.json({ error: "Estimated cost must be a number." }, { status: 400 });
  }

  const { data, error } = await viewer.db
    .from("ministry_order_requests")
    .insert({
      role_id: roleId,
      requested_by_member_id: viewer.member.id,
      title,
      request_details: details,
      needed_by_date: neededBy,
      estimated_cost: estimatedCost,
      status: "new",
      pastor_notes: null,
      updated_at: new Date().toISOString(),
    })
    .select("id,role_id,requested_by_member_id,title,request_details,needed_by_date,estimated_cost,status,pastor_notes,created_at,updated_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const hydrated = await hydrate(viewer.db, [data]);
  return NextResponse.json({ request: hydrated[0] }, { status: 201 });
}

export async function PATCH(request) {
  const viewer = await getViewer(request);
  if (!viewer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!hasPermission(viewer, "order_requests_review")) {
    return NextResponse.json({ error: "Your account cannot review ministry requests." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const requestId = String(body?.request_id || "").trim();
  const status = String(body?.status || "").trim().toLowerCase();
  const pastorNotes = String(body?.pastor_notes || "").trim() || null;
  if (!requestId) return NextResponse.json({ error: "Request is required." }, { status: 400 });
  if (!REVIEW_STATUSES.has(status)) return NextResponse.json({ error: "Choose a valid status." }, { status: 400 });
  if (["ordered", "fulfilled", "declined"].includes(status) && !hasPermission(viewer, "order_requests_approve")) {
    return NextResponse.json({ error: "Approval permission is required for that status." }, { status: 403 });
  }

  const { data, error } = await viewer.db
    .from("ministry_order_requests")
    .update({ status, pastor_notes: pastorNotes, updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .select("id,role_id,requested_by_member_id,title,request_details,needed_by_date,estimated_cost,status,pastor_notes,created_at,updated_at")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  const hydrated = await hydrate(viewer.db, [data]);
  return NextResponse.json({ request: hydrated[0] });
}
