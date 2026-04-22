import {
  normalizeDate,
  normalizeId,
  parseBoolean,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";
import { NextResponse } from "next/server";

const SCRIPTURE_SELECT_FULL = "id, audience, title, reference, verse_text, devotional_text, week_start, week_end, is_published, created_at";
const SCRIPTURE_SELECT_LEGACY = "id, audience, reference, verse_text, week_start, week_end, is_published, created_at";

async function getIdFromContext(context) {
  const params = await Promise.resolve(context?.params);
  return normalizeId(params?.id);
}

function validateWeekRange(weekStart, weekEnd) {
  if (weekStart && weekEnd && weekEnd < weekStart) {
    return "week_end must be on or after week_start";
  }
  return "";
}

function isMissingScriptureColumnError(error) {
  const message = String(error?.message || "");
  return message.includes("column scriptures.title does not exist") || message.includes("column scriptures.devotional_text does not exist");
}

function normalizeLegacyScripture(record) {
  if (!record) {
    return record;
  }
  return {
    ...record,
    title: record.title ?? null,
    devotional_text: record.devotional_text ?? null,
  };
}

export async function GET(request, context) {
  const { error: authError } = requireAdminSession(request);
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

  const { data, error } = await supabase
    .from("scriptures")
    .select(SCRIPTURE_SELECT_FULL)
    .eq("id", id)
    .maybeSingle();

  if (!error) {
    if (!data) {
      return NextResponse.json({ error: "Scripture not found" }, { status: 404 });
    }

    return NextResponse.json({ scripture: data });
  }

  if (!isMissingScriptureColumnError(error)) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("scriptures")
    .select(SCRIPTURE_SELECT_LEGACY)
    .eq("id", id)
    .maybeSingle();

  if (legacyError) {
    return NextResponse.json({ error: legacyError.message }, { status: 400 });
  }
  if (!legacyData) {
    return NextResponse.json({ error: "Scripture not found" }, { status: 404 });
  }

  return NextResponse.json({ scripture: normalizeLegacyScripture(legacyData) });
}

export async function PATCH(request, context) {
  const { error: authError } = requireAdminSession(request);
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

  const { data: payload, error } = await readJsonBody(request);
  if (error) {
    return error;
  }

  const update = {};

  if (payload?.reference !== undefined) {
    const reference = String(payload.reference || "").trim();
    if (!reference) {
      return NextResponse.json({ error: "reference cannot be empty" }, { status: 400 });
    }
    update.reference = reference;
  }

  if (payload?.title !== undefined) {
    const title = String(payload.title || "").trim();
    update.title = title || null;
  }

  if (payload?.verse_text !== undefined) {
    const verseText = String(payload.verse_text || "").trim();
    if (!verseText) {
      return NextResponse.json({ error: "verse_text cannot be empty" }, { status: 400 });
    }
    update.verse_text = verseText;
  }

  if (payload?.devotional_text !== undefined) {
    const devotionalText = String(payload.devotional_text || "").trim();
    update.devotional_text = devotionalText || null;
  }

  if (payload?.week_start !== undefined) {
    const weekStart = normalizeDate(payload.week_start);
    if (!weekStart) {
      return NextResponse.json({ error: "week_start must be a valid date" }, { status: 400 });
    }
    update.week_start = weekStart;
  }

  if (payload?.week_end !== undefined) {
    const weekEnd = normalizeDate(payload.week_end);
    if (!weekEnd) {
      return NextResponse.json({ error: "week_end must be a valid date" }, { status: 400 });
    }
    update.week_end = weekEnd;
  }

  if (payload?.is_published !== undefined) {
    update.is_published = parseBoolean(payload.is_published, true);
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  update.audience = "youth";

  const rangeError = validateWeekRange(update.week_start, update.week_end);
  if (rangeError) {
    return NextResponse.json({ error: rangeError }, { status: 400 });
  }

  if (!update.week_start || !update.week_end) {
    const { data: current, error: currentError } = await supabase
      .from("scriptures")
      .select("week_start, week_end")
      .eq("id", id)
      .maybeSingle();

    if (currentError) {
      return NextResponse.json({ error: currentError.message }, { status: 400 });
    }
    if (!current) {
      return NextResponse.json({ error: "Scripture not found" }, { status: 404 });
    }

    const effectiveStart = update.week_start || current.week_start;
    const effectiveEnd = update.week_end || current.week_end;
    const mergedRangeError = validateWeekRange(effectiveStart, effectiveEnd);
    if (mergedRangeError) {
      return NextResponse.json({ error: mergedRangeError }, { status: 400 });
    }
  }

  const { data, error: updateError } = await supabase
    .from("scriptures")
    .update(update)
    .eq("id", id)
    .select(SCRIPTURE_SELECT_FULL)
    .maybeSingle();

  if (!updateError) {
    if (!data) {
      return NextResponse.json({ error: "Scripture not found" }, { status: 404 });
    }

    return NextResponse.json({ scripture: data });
  }

  if (!isMissingScriptureColumnError(updateError)) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const { title: _ignoredTitle, devotional_text: _ignoredDevotionalText, ...legacyUpdate } = update;
  const { data: legacyData, error: legacyUpdateError } = await supabase
    .from("scriptures")
    .update(legacyUpdate)
    .eq("id", id)
    .select(SCRIPTURE_SELECT_LEGACY)
    .maybeSingle();

  if (legacyUpdateError) {
    return NextResponse.json({ error: legacyUpdateError.message }, { status: 400 });
  }
  if (!legacyData) {
    return NextResponse.json({ error: "Scripture not found" }, { status: 404 });
  }

  return NextResponse.json({ scripture: normalizeLegacyScripture(legacyData) });
}

export async function DELETE(request, context) {
  const { error: authError } = requireAdminSession(request);
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

  const { error } = await supabase.from("scriptures").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

