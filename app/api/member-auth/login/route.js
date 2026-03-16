import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/admin-api";
import { ensureMemberProfileForAuthUser, isMemberAuthConfigured } from "@/lib/member-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export async function POST(request) {
  if (!isMemberAuthConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: "Member sign-in is not configured yet.",
      },
      { status: 500 },
    );
  }

  const { data, error } = await readJsonBody(request);
  if (error) {
    return error;
  }

  const email = normalizeEmail(data?.email);
  const password = String(data?.password || "");

  if (!email || !password) {
    return NextResponse.json(
      {
        success: false,
        message: "Email and password are required.",
      },
      { status: 400 },
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

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData?.user) {
    const normalizedMessage = String(signInError?.message || "").toLowerCase();
    const message = normalizedMessage.includes("email not confirmed")
      ? "Please verify your email first, then sign in."
      : "That email and password do not match our records.";

    return NextResponse.json({ success: false, message }, { status: 401 });
  }

  const member = await ensureMemberProfileForAuthUser({
    user: signInData.user,
    updateLastLoginAt: true,
  });

  if (!member) {
    return NextResponse.json(
      {
        success: false,
        message: "Your account was verified, but we could not open your member profile yet.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    member: {
      id: member.id,
      username: member.username,
      fullName: member.full_name || "",
      email: member.email || signInData.user.email || "",
    },
  });
}
