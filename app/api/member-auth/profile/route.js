import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/admin-api";
import { ensureMemberProfileForAuthUser, requireMemberSession } from "@/lib/member-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeText(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

export async function GET() {
  const { member, user, error } = await requireMemberSession();
  if (error) {
    return error;
  }

  return NextResponse.json({
    success: true,
    member: {
      id: member.id,
      username: member.username || "",
      fullName: member.full_name || user.user_metadata?.full_name || "",
      email: member.email || user.email || "",
      phone: member.phone || "",
      createdAt: member.created_at || null,
      lastLoginAt: member.last_login_at || null,
    },
  });
}

export async function PATCH(request) {
  const { user, error } = await requireMemberSession();
  if (error) {
    return error;
  }

  const { data, error: bodyError } = await readJsonBody(request);
  if (bodyError) {
    return bodyError;
  }

  const fullName = normalizeText(data?.fullName || data?.full_name);
  const phone = normalizeText(data?.phone);

  if (!fullName) {
    return NextResponse.json(
      { success: false, message: "Full name is required." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, message: "Supabase is not configured yet." },
      { status: 503 },
    );
  }

  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: {
      ...(user.user_metadata || {}),
      full_name: fullName,
      phone,
    },
  });

  if (authUpdateError) {
    return NextResponse.json(
      { success: false, message: "We could not save your profile right now." },
      { status: 500 },
    );
  }

  const member = await ensureMemberProfileForAuthUser({
    user: {
      ...user,
      user_metadata: {
        ...(user.user_metadata || {}),
        full_name: fullName,
        phone,
      },
    },
    fullName,
    phone,
  });

  if (!member) {
    return NextResponse.json(
      { success: false, message: "We could not save your profile right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    member: {
      id: member.id,
      username: member.username || "",
      fullName: member.full_name || "",
      email: member.email || user.email || "",
      phone: member.phone || "",
    },
    message: "Your profile has been updated.",
  });
}
