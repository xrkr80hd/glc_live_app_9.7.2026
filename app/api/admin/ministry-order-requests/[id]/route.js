import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeId,
  normalizeOptionalText,
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

  if (
    !canManageAllOrderRequests(roleContext) &&
    (!session.memberId || String(data.requested_by_member_id || "") !== String(session.memberId))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  const canManageAll = canManageAllOrderRequests(roleContext);
  const isOwner = Boolean(
    session.memberId &&
      String(existing.requested_by_member_id || "") === String(session.memberId),
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

  const canManageAll = canManageAllOrderRequests(roleContext);
  const isOwner = Boolean(
    session.memberId &&
      String(existing.requested_by_member_id || "") === String(session.memberId),
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
