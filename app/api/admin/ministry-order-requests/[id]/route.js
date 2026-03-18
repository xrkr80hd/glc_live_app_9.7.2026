import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeId,
  normalizeOptionalText,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";
import {
  canReviewOrderRequests,
  canViewAllOrderRequests,
  canViewYouthAssistantOrderRequests,
  getMemberRoles,
  hasRole,
  normalizeRoleKeyForPolicy,
} from "@/lib/admin-role-access";

const ORDER_REQUEST_STATUSES = new Set([
  "new",
  "reviewing",
  "ordered",
  "fulfilled",
  "declined",
]);

const STATUS_ALIASES = {
  draft: "new",
  submitted: "new",
  under_review: "reviewing",
  approved: "ordered",
  denied: "declined",
  completed: "fulfilled",
};

function normalizeStatus(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  const mapped = STATUS_ALIASES[normalized] || normalized;
  return ORDER_REQUEST_STATUSES.has(mapped) ? mapped : "";
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
  const roles = session?.memberId ? await getMemberRoles(supabase, session.memberId) : [];
  const roleKeys = roles.map((role) => String(role.role_key || "").trim()).filter(Boolean);
  const roleIds = roles.map((role) => normalizeId(role.id)).filter(Boolean);
  const isSuperuser = Boolean(session?.isSuperuser);
  const bookkeeperCanViewAll =
    process.env.BOOKKEEPER_ORDER_VISIBILITY === "true" && hasRole(roleKeys, "bookkeeper");

  return {
    isSuperuser,
    roleKeys,
    roleIds,
    canReview: canReviewOrderRequests(roleKeys, isSuperuser),
    canViewAll: canViewAllOrderRequests(roleKeys, isSuperuser) || bookkeeperCanViewAll,
    canViewYouthAssistant: canViewYouthAssistantOrderRequests(roleKeys, isSuperuser),
  };
}

async function getRoleIdsByPolicyKeys(supabase, targetRoleKeys) {
  const normalizedTargets = new Set(
    (Array.isArray(targetRoleKeys) ? targetRoleKeys : [])
      .map((roleKey) => normalizeRoleKeyForPolicy(roleKey))
      .filter(Boolean),
  );

  if (!normalizedTargets.size) {
    return [];
  }

  const { data, error } = await supabase.from("team_roles").select("id, role_key");
  if (error || !Array.isArray(data)) {
    return [];
  }

  return data
    .filter((role) => normalizedTargets.has(normalizeRoleKeyForPolicy(role.role_key)))
    .map((role) => normalizeId(role.id))
    .filter(Boolean);
}

async function resolveVisibleRoleIds(supabase, context) {
  const visibleRoleIds = new Set(context.roleIds || []);

  if (context.canViewYouthAssistant) {
    const assistantRoleIds = await getRoleIdsByPolicyKeys(supabase, ["youth_minister_assistant"]);
    for (const roleId of assistantRoleIds) {
      visibleRoleIds.add(roleId);
    }
  }

  return Array.from(visibleRoleIds);
}

async function getIdFromContext(context) {
  const params = await Promise.resolve(context?.params);
  return normalizeId(params?.id);
}

export async function GET(request, context) {
  const { session, error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const id = await getIdFromContext(context);
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const roleContext = await getSessionRoleContext(supabase, session);
  const { data, error } = await supabase
    .from("ministry_order_requests")
    .select(
      "id, role_id, requested_by_member_id, title, request_details, needed_by_date, estimated_cost, status, pastor_notes, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Ministry order request not found" }, { status: 404 });
  }

  if (!roleContext.canViewAll) {
    const sessionMemberId = normalizeId(session.memberId);
    const isOwner = Boolean(
      sessionMemberId &&
        String(data.requested_by_member_id || "") === String(sessionMemberId),
    );

    if (!isOwner) {
      const visibleRoleIds = await resolveVisibleRoleIds(supabase, roleContext);
      if (!visibleRoleIds.includes(normalizeId(data.role_id))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  return NextResponse.json({ ministryOrderRequest: data });
}

export async function PATCH(request, context) {
  const { session, error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const id = await getIdFromContext(context);
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const roleContext = await getSessionRoleContext(supabase, session);
  const { data: existing, error: existingError } = await supabase
    .from("ministry_order_requests")
    .select(
      "id, role_id, requested_by_member_id, title, request_details, needed_by_date, estimated_cost, status, pastor_notes, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Ministry order request not found" }, { status: 404 });
  }

  const canManageAll = roleContext.canReview;
  const sessionMemberId = normalizeId(session.memberId);
  const isOwner = Boolean(
    sessionMemberId &&
      String(existing.requested_by_member_id || "") === String(sessionMemberId),
  );

  if (!canManageAll && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: payload, error } = await readJsonBody(request);
  if (error) {
    return error;
  }

  const update = { updated_at: new Date().toISOString() };

  if (payload?.title !== undefined) {
    const title = String(payload.title || "").trim();
    if (!title) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    update.title = title;
  }

  if (payload?.request_details !== undefined) {
    const details = String(payload.request_details || "").trim();
    if (!details) {
      return NextResponse.json(
        { error: "request_details cannot be empty" },
        { status: 400 },
      );
    }
    update.request_details = details;
  }

  if (payload?.needed_by_date !== undefined) {
    const neededByRaw = payload.needed_by_date;
    if (neededByRaw == null || String(neededByRaw).trim() === "") {
      update.needed_by_date = null;
    } else {
      const neededByDate = normalizeDate(neededByRaw);
      if (!neededByDate) {
        return NextResponse.json(
          { error: "needed_by_date must be a valid date (YYYY-MM-DD)" },
          { status: 400 },
        );
      }
      update.needed_by_date = neededByDate;
    }
  }

  if (payload?.estimated_cost !== undefined) {
    const estimated = normalizeMoney(payload.estimated_cost);
    if (payload.estimated_cost !== "" && payload.estimated_cost != null && estimated == null) {
      return NextResponse.json(
        { error: "estimated_cost must be a valid amount" },
        { status: 400 },
      );
    }
    update.estimated_cost = estimated;
  }

  if (payload?.status !== undefined) {
    if (!canManageAll) {
      return NextResponse.json(
        { error: "Only Pastor or Superuser can change request status." },
        { status: 403 },
      );
    }

    const status = normalizeStatus(payload.status);
    if (!status) {
      return NextResponse.json(
        { error: "status is invalid" },
        { status: 400 },
      );
    }
    update.status = status;
  }

  if (payload?.pastor_notes !== undefined) {
    if (!canManageAll) {
      return NextResponse.json(
        { error: "Only Pastor or Superuser can change pastor notes." },
        { status: 403 },
      );
    }
    update.pastor_notes = normalizeOptionalText(payload.pastor_notes);
  }

  const { data, error: updateError } = await supabase
    .from("ministry_order_requests")
    .update(update)
    .eq("id", id)
    .select(
      "id, role_id, requested_by_member_id, title, request_details, needed_by_date, estimated_cost, status, pastor_notes, created_at, updated_at",
    )
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ministryOrderRequest: data });
}

export async function DELETE(request, context) {
  const { session, error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const id = await getIdFromContext(context);
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const roleContext = await getSessionRoleContext(supabase, session);
  const { data: existing, error: existingError } = await supabase
    .from("ministry_order_requests")
    .select("id, requested_by_member_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Ministry order request not found" }, { status: 404 });
  }

  const canManageAll = roleContext.canReview;
  const sessionMemberId = normalizeId(session.memberId);
  const isOwner = Boolean(
    sessionMemberId &&
      String(existing.requested_by_member_id || "") === String(sessionMemberId),
  );

  if (!canManageAll && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("ministry_order_requests")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
