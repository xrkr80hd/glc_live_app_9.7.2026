import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeId,
  normalizeOptionalText,
  parseBoolean,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";
import { canAccessBookkeeping, getMemberRoleKeys } from "@/lib/admin-role-access";

const BOOKKEEPING_ENTRY_TYPES = new Set([
  "offering",
  "tithe",
  "expense",
  "adjustment",
  "other",
]);

function normalizeEntryType(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return BOOKKEEPING_ENTRY_TYPES.has(normalized) ? normalized : "";
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

async function getRoleContext(supabase, session) {
  const roleKeys = session?.memberId
    ? await getMemberRoleKeys(supabase, session.memberId)
    : [];
  const isAuthorized = canAccessBookkeeping(roleKeys, Boolean(session?.isSuperuser));
  return {
    isAuthorized: Boolean(isAuthorized),
  };
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

  const roleContext = await getRoleContext(supabase, session);
  if (!roleContext.isAuthorized) {
    return NextResponse.json(
      { error: "Bookkeeping reports are restricted to Pastor and Bookkeeper." },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("bookkeeping_reports")
    .select(
      "id, report_date, entry_type, title, amount, notes, submitted_by_member_id, is_active, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Bookkeeping report not found" }, { status: 404 });
  }

  return NextResponse.json({ bookkeepingReport: data });
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

  const roleContext = await getRoleContext(supabase, session);
  if (!roleContext.isAuthorized) {
    return NextResponse.json(
      { error: "Bookkeeping reports are restricted to Pastor and Bookkeeper." },
      { status: 403 },
    );
  }

  const { data: payload, error } = await readJsonBody(request);
  if (error) {
    return error;
  }

  const update = { updated_at: new Date().toISOString() };

  if (payload?.report_date !== undefined) {
    const reportDate = normalizeDate(payload.report_date);
    if (!reportDate) {
      return NextResponse.json(
        { error: "report_date must be a valid date (YYYY-MM-DD)" },
        { status: 400 },
      );
    }
    update.report_date = reportDate;
  }

  if (payload?.entry_type !== undefined) {
    const entryType = normalizeEntryType(payload.entry_type);
    if (!entryType) {
      return NextResponse.json({ error: "entry_type is invalid" }, { status: 400 });
    }
    update.entry_type = entryType;
  }

  if (payload?.title !== undefined) {
    const title = String(payload.title || "").trim();
    if (!title) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    update.title = title;
  }

  if (payload?.amount !== undefined) {
    const amount = normalizeMoney(payload.amount);
    if (amount == null) {
      return NextResponse.json({ error: "amount must be numeric" }, { status: 400 });
    }
    update.amount = amount;
  }

  if (payload?.notes !== undefined) {
    update.notes = normalizeOptionalText(payload.notes);
  }

  if (payload?.is_active !== undefined) {
    update.is_active = parseBoolean(payload.is_active, true);
  }

  const { data, error: updateError } = await supabase
    .from("bookkeeping_reports")
    .update(update)
    .eq("id", id)
    .select(
      "id, report_date, entry_type, title, amount, notes, submitted_by_member_id, is_active, created_at, updated_at",
    )
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Bookkeeping report not found" }, { status: 404 });
  }

  return NextResponse.json({ bookkeepingReport: data });
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

  const roleContext = await getRoleContext(supabase, session);
  if (!roleContext.isAuthorized) {
    return NextResponse.json(
      { error: "Bookkeeping reports are restricted to Pastor and Bookkeeper." },
      { status: 403 },
    );
  }

  const { error } = await supabase
    .from("bookkeeping_reports")
    .delete()
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
