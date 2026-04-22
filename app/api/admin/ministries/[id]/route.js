import {
  normalizeId,
  normalizeOptionalText,
  parseBoolean,
  parseInteger,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";
import { NextResponse } from "next/server";

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
    .from("ministries")
    .select("id, title, body, image_url, image_alt, sort_order, is_published, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Ministry not found" }, { status: 404 });
  }

  return NextResponse.json({ ministry: data });
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

  if (payload?.title !== undefined) {
    const title = String(payload.title || "").trim();
    if (!title) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    update.title = title;
  }

  if (payload?.body !== undefined) {
    const body = String(payload.body || "").trim();
    if (!body) {
      return NextResponse.json({ error: "body cannot be empty" }, { status: 400 });
    }
    update.body = body;
  }

  if (payload?.image_url !== undefined) {
    update.image_url = normalizeOptionalText(payload.image_url);
  }

  if (payload?.image_alt !== undefined) {
    update.image_alt = normalizeOptionalText(payload.image_alt);
  }

  if (payload?.sort_order !== undefined) {
    update.sort_order = parseInteger(payload.sort_order, 0);
  }

  if (payload?.is_published !== undefined) {
    update.is_published = parseBoolean(payload.is_published, true);
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("ministries")
    .update(update)
    .eq("id", id)
    .select("id, title, body, image_url, image_alt, sort_order, is_published, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Ministry not found" }, { status: 404 });
  }

  return NextResponse.json({ ministry: data });
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

  const { error } = await supabase.from("ministries").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

