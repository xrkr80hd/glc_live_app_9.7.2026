import { NextResponse } from "next/server";
import {
  normalizeDate,
  normalizeId,
  parseBoolean,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

function normalizeAudience(value) {
  const audience = String(value || "").trim().toLowerCase();
  if (audience === "main" || audience === "youth") {
    return audience;
  }
  return "";
}

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
    .select("id, audience, reference, verse_text, week_start, week_end, is_published, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Scripture not found" }, { status: 404 });
  }

  return NextResponse.json({ scripture: data });
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

  if (payload?.audience !== undefined) {
    const audience = normalizeAudience(payload.audience);
    if (!audience) {
      return NextResponse.json({ error: "audience must be 'main' or 'youth'" }, { status: 400 });
    }
    update.audience = audience;
  }

  if (payload?.reference !== undefined) {
    const reference = String(payload.reference || "").trim();
    if (!reference) {
      return NextResponse.json({ error: "reference cannot be empty" }, { status: 400 });
    }
    update.reference = reference;
  }

  if (payload?.verse_text !== undefined) {
    const verseText = String(payload.verse_text || "").trim();
    if (!verseText) {
      return NextResponse.json({ error: "verse_text cannot be empty" }, { status: 400 });
    }
    update.verse_text = verseText;
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
    .select("id, audience, reference, verse_text, week_start, week_end, is_published, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Scripture not found" }, { status: 404 });
  }

  return NextResponse.json({ scripture: data });
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

