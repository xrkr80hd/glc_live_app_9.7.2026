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
    roleKeys,
  };
}

async function hydrateBookkeepingReports(supabase, rows) {
  if (!Array.isArray(rows) || !rows.length) {
    return [];
  }

  const memberIds = Array.from(
    new Set(rows.map((row) => String(row.submitted_by_member_id || "").trim()).filter(Boolean)),
  );

  let memberMap = new Map();
  if (memberIds.length) {
    const { data } = await supabase
      .from("team_members")
      .select("id, username, full_name")
      .in("id", memberIds);
    memberMap = new Map((data || []).map((member) => [member.id, member]));
  }

  return rows.map((row) => {
    const member = memberMap.get(row.submitted_by_member_id) || null;
    return {
      ...row,
      submitted_by_label:
        member?.full_name || member?.username || "Unknown Member",
    };
  });
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

  const roleContext = await getRoleContext(supabase, session);
  if (!roleContext.isAuthorized) {
    return NextResponse.json(
      { error: "Bookkeeping reports are restricted to Pastor and Bookkeeper." },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const includeInactive = parseBoolean(searchParams.get("include_inactive"), true);
  const entryTypeFilter = normalizeEntryType(searchParams.get("entry_type"));
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("bookkeeping_reports")
    .select(
      "id, report_date, entry_type, title, amount, notes, submitted_by_member_id, is_active, created_at, updated_at",
    )
    .order("report_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }
  if (entryTypeFilter) {
    query = query.eq("entry_type", entryTypeFilter);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const hydrated = await hydrateBookkeepingReports(supabase, data || []);
  return NextResponse.json({ bookkeepingReports: hydrated });
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

  const reportDateRaw = payload?.report_date;
  const reportDate =
    reportDateRaw == null || String(reportDateRaw).trim() === ""
      ? new Date().toISOString().slice(0, 10)
      : normalizeDate(reportDateRaw);
  const entryType = normalizeEntryType(payload?.entry_type) || "offering";
  const title = String(payload?.title || "").trim();
  const amount = normalizeMoney(payload?.amount);
  const notes = normalizeOptionalText(payload?.notes);
  const isActive = parseBoolean(payload?.is_active, true);

  if (!reportDate) {
    return NextResponse.json(
      { error: "report_date must be a valid date (YYYY-MM-DD)" },
      { status: 400 },
    );
  }
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (amount == null) {
    return NextResponse.json({ error: "amount is required and must be numeric" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("bookkeeping_reports")
    .insert({
      report_date: reportDate,
      entry_type: entryType,
      title,
      amount,
      notes,
      submitted_by_member_id: normalizeId(session.memberId) || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .select(
      "id, report_date, entry_type, title, amount, notes, submitted_by_member_id, is_active, created_at, updated_at",
    )
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const hydrated = await hydrateBookkeepingReports(supabase, data ? [data] : []);
  return NextResponse.json({ bookkeepingReport: hydrated[0] || null }, { status: 201 });
}
