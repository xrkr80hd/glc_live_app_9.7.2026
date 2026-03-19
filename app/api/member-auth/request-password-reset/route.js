import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/admin-api";
import { buildAuthUrl } from "@/lib/public-url";
import { isMemberAuthConfigured } from "@/lib/member-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function buildRecoveryRedirectTo(request) {
  const redirectUrl = buildAuthUrl(request, "/auth/confirm");
  redirectUrl.searchParams.set("next", "/member-access/reset-password");
  return redirectUrl.toString();
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
  if (!email) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter your email address.",
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

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildRecoveryRedirectTo(request),
  });

  return NextResponse.json({
    success: true,
    message: "If that email exists in Liberty Church, a reset link has been sent.",
  });
}
