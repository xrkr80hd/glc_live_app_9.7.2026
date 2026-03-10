import { NextResponse } from "next/server";
import {
  normalizeId,
  normalizeOptionalText,
  parseBoolean,
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
    .from("team_members")
    .select("id, username, full_name, email, phone, is_superuser, is_active, notes, last_login_at, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  return NextResponse.json({ teamMember: data });
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

  if (payload?.username !== undefined) {
    const username = normalizeUsername(payload.username);
    if (!username) {
      return NextResponse.json({ error: "username cannot be empty" }, { status: 400 });
    }
    update.username = username;
  }

  if (payload?.full_name !== undefined) {
    update.full_name = normalizeOptionalText(payload.full_name);
  }

  if (payload?.email !== undefined) {
    update.email = normalizeEmail(payload.email);
  }

  if (payload?.phone !== undefined) {
    update.phone = normalizeOptionalText(payload.phone);
  }

  if (payload?.notes !== undefined) {
    update.notes = normalizeOptionalText(payload.notes);
  }

  if (payload?.password !== undefined) {
    const passwordRaw = String(payload.password || "");
    if (!passwordRaw) {
      update.password_hash = null;
    } else {
      if (passwordRaw.length < 8) {
        return NextResponse.json({ error: "password must be at least 8 characters" }, { status: 400 });
      }
      update.password_hash = hashAdminPassword(passwordRaw);
    }
  }

  if (payload?.is_superuser !== undefined) {
    update.is_superuser = parseBoolean(payload.is_superuser, false);
  }

  if (payload?.is_active !== undefined) {
    update.is_active = parseBoolean(payload.is_active, true);
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error: updateError } = await supabase
    .from("team_members")
    .update(update)
    .eq("id", id)
    .select("id, username, full_name, email, phone, is_superuser, is_active, notes, last_login_at, created_at")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  return NextResponse.json({ teamMember: data });
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

  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
