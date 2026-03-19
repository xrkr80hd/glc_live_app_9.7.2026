import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/admin-api";
import { buildAuthUrl } from "@/lib/public-url";
import { requireMemberSession, verifyCurrentMemberPassword } from "@/lib/member-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function buildEmailChangeRedirectTo(request) {
  const redirectUrl = buildAuthUrl(request, "/auth/confirm");
  redirectUrl.searchParams.set("next", "/member-access?emailChanged=1");
  return redirectUrl.toString();
}

export async function POST(request) {
  const { member, user, error } = await requireMemberSession();
  if (error) {
    return error;
  }

  const { data, error: bodyError } = await readJsonBody(request);
  if (bodyError) {
    return bodyError;
  }

  const nextEmail = normalizeEmail(data?.nextEmail || data?.email);
  const currentPassword = String(data?.currentPassword || "");
  const currentEmail = normalizeEmail(member?.email || user?.email);

  if (!nextEmail || !currentPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "New email and current password are required.",
      },
      { status: 400 },
    );
  }

  if (!nextEmail.includes("@")) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter a valid email address.",
      },
      { status: 400 },
    );
  }

  if (nextEmail === currentEmail) {
    return NextResponse.json(
      {
        success: false,
        message: "Use a different email address than your current sign-in email.",
      },
      { status: 400 },
    );
  }

  const isCurrentPasswordValid = await verifyCurrentMemberPassword(currentEmail, currentPassword);
  if (!isCurrentPasswordValid) {
    return NextResponse.json(
      {
        success: false,
        message: "Your current password is not correct.",
      },
      { status: 401 },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      {
        success: false,
        message: "Supabase is not configured yet.",
      },
      { status: 503 },
    );
  }

  const { error: updateError } = await supabase.auth.updateUser(
    {
      email: nextEmail,
    },
    {
      emailRedirectTo: buildEmailChangeRedirectTo(request),
    },
  );

  if (updateError) {
    return NextResponse.json(
      {
        success: false,
        message: "We could not start your email change right now.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Check your inbox to confirm your new email.",
  });
}
