import { NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function parseBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }
  return fallback;
}

export function parseInteger(value, fallback = 0, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), max);
}

export function normalizeId(value) {
  return String(value || "").trim();
}

export function normalizeOptionalText(value) {
  const normalized = String(value || "").trim();
  return normalized ? normalized : null;
}

export function normalizeRequiredText(value) {
  return String(value || "").trim();
}

export function normalizeDate(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }
  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return raw;
}

export function normalizeTimestamp(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

export async function readJsonBody(request) {
  try {
    return {
      data: await request.json(),
      error: null,
    };
  } catch {
    return {
      data: null,
      error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }
}

export function requireAdminSession(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, error: null };
}

export function requireAdminSupabase() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      supabase: null,
      error: NextResponse.json(
        {
          error: "Supabase admin client is not configured",
        },
        { status: 500 },
      ),
    };
  }

  return { supabase, error: null };
}

export function parsePaging(searchParams) {
  const limit = parseInteger(searchParams.get("limit"), 100, 1, 500);
  const offset = parseInteger(searchParams.get("offset"), 0, 0, Number.POSITIVE_INFINITY);
  return { limit, offset };
}

