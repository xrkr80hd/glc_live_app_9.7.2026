import {
  normalizeOptionalText,
  parseBoolean,
  parseInteger,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const { searchParams } = new URL(request.url);
  const includeUnpublished = parseBoolean(searchParams.get("include_unpublished"), true);
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("ministries")
    .select("id, title, body, image_url, image_alt, sort_order, is_published, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ministries: data || [] });
}

export async function POST(request) {
  const { error: authError } = requireAdminSession(request);
  if (authError) {
    return authError;
  }

  const { supabase, error: supabaseError } = requireAdminSupabase();
  if (supabaseError) {
    return supabaseError;
  }

  const { data: payload, error } = await readJsonBody(request);
  if (error) {
    return error;
  }

  const title = String(payload?.title || "").trim();
  const body = String(payload?.body || "").trim();
  const imageUrl = normalizeOptionalText(payload?.image_url);
  const imageAlt = normalizeOptionalText(payload?.image_alt);
  const sortOrder = parseInteger(payload?.sort_order, 0);
  const isPublished = parseBoolean(payload?.is_published, true);

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!body) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("ministries")
    .insert({
      title,
      body,
      image_url: imageUrl,
      image_alt: imageAlt,
      sort_order: sortOrder,
      is_published: isPublished,
    })
    .select("id, title, body, image_url, image_alt, sort_order, is_published, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ministry: data }, { status: 201 });
}

