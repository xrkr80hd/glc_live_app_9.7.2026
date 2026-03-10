import { NextResponse } from "next/server";
import {
  normalizeOptionalText,
  parseBoolean,
  parsePaging,
  readJsonBody,
  requireAdminSession,
  requireAdminSupabase,
} from "@/lib/admin-api";
import { hashAdminPassword } from "@/lib/admin-auth";

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "")
    .slice(0, 80);
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return email || null;
}

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
  const includeInactive = parseBoolean(searchParams.get("include_inactive"), true);
  const { limit, offset } = parsePaging(searchParams);

  let query = supabase
    .from("team_members")
    .select("id, username, full_name, email, phone, is_superuser, is_active, notes, last_login_at, created_at")
    .order("is_superuser", { ascending: false })
    .order("username", { ascending: true })
    .range(offset, offset + limit - 1);

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ teamMembers: data || [] });
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

  const username = normalizeUsername(payload?.username);
  const fullName = normalizeOptionalText(payload?.full_name);
  const email = normalizeEmail(payload?.email);
  const phone = normalizeOptionalText(payload?.phone);
  const notes = normalizeOptionalText(payload?.notes);
  const isSuperuser = parseBoolean(payload?.is_superuser, false);
  const isActive = parseBoolean(payload?.is_active, true);
  const passwordRaw = String(payload?.password || "");
  let passwordHash = null;

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }
  if (passwordRaw) {
    if (passwordRaw.length < 8) {
      return NextResponse.json({ error: "password must be at least 8 characters" }, { status: 400 });
    }
    passwordHash = hashAdminPassword(passwordRaw);
  }

  const { data, error: insertError } = await supabase
    .from("team_members")
    .insert({
      username,
      full_name: fullName,
      email,
      phone,
      notes,
      is_superuser: isSuperuser,
      is_active: isActive,
      password_hash: passwordHash,
    })
    .select("id, username, full_name, email, phone, is_superuser, is_active, notes, last_login_at, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ teamMember: data }, { status: 201 });
}
