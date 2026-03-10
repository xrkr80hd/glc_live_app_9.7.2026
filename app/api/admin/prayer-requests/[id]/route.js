import { NextResponse } from "next/server";
import {
  normalizeId,
  parseBoolean,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";

async function getIdFromContext(context) {
  const params = await Promise.resolve(context?.params);
  return normalizeId(params?.id);
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
    .from("prayer_requests")
    .select("id, name, email, phone, request_text, is_private, status, submitted_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Prayer request not found" }, { status: 404 });
  }

  return NextResponse.json({ prayerRequest: data });
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

  if (payload?.name !== undefined) {
    const name = String(payload.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    }
    update.name = name;
  }

  if (payload?.email !== undefined) {
    const email = String(payload.email || "").trim();
    if (!email) {
      return NextResponse.json({ error: "email cannot be empty" }, { status: 400 });
    }
    update.email = email;
  }

  if (payload?.phone !== undefined) {
    update.phone = String(payload.phone || "").trim() || null;
  }

  if (payload?.request_text !== undefined) {
    const requestText = String(payload.request_text || "").trim();
    if (!requestText) {
      return NextResponse.json({ error: "request_text cannot be empty" }, { status: 400 });
    }
    update.request_text = requestText;
  }

  if (payload?.is_private !== undefined) {
    update.is_private = parseBoolean(payload.is_private, false);
  }

  if (payload?.status !== undefined) {
    const status = String(payload.status || "").trim();
    if (!status) {
      return NextResponse.json({ error: "status cannot be empty" }, { status: 400 });
    }
    update.status = status;
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("prayer_requests")
    .update(update)
    .eq("id", id)
    .select("id, name, email, phone, request_text, is_private, status, submitted_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Prayer request not found" }, { status: 404 });
  }

  return NextResponse.json({ prayerRequest: data });
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

  const { error } = await supabase.from("prayer_requests").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

