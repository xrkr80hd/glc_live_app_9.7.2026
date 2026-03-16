import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/admin-api";
import { isMemberAuthConfigured } from "@/lib/member-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function buildEmailRedirectTo(request) {
  const url = new URL(request.url);
  const confirmUrl = new URL("/auth/confirm", url.origin);
  confirmUrl.searchParams.set("next", "/member-access?verified=1");
  return confirmUrl.toString();
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

  const fullName = normalizeText(data?.fullName || data?.full_name);
  const email = normalizeEmail(data?.email);
  const phone = normalizeText(data?.phone);
  const password = String(data?.password || "");

  if (!fullName || !email || !password) {
    return NextResponse.json(
      {
        success: false,
        message: "Full name, email, and password are required.",
      },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      {
        success: false,
        message: "Use at least 8 characters for your password.",
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

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildEmailRedirectTo(request),
      data: {
        full_name: fullName,
        phone,
      },
    },
  });

  if (signUpData?.session) {
    await supabase.auth.signOut();
  }

  if (signUpError) {
    const message = signUpError.message?.toLowerCase().includes("already registered")
      ? "That email already has an account. Try signing in instead."
      : "We could not create your account right now. Please try again.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }

  if (signUpData?.user && Array.isArray(signUpData.user.identities) && !signUpData.user.identities.length) {
    return NextResponse.json(
      {
        success: false,
        message: "That email already has an account. Try signing in instead.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Check your email to verify your account.",
  });
}
