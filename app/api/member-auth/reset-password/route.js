import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/admin-api";
import { validateMemberPassword } from "@/lib/security/password-policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const RECOVERY_COOKIE_KEY = "lc_member_recovery";

export async function POST(request) {
  const { data, error: bodyError } = await readJsonBody(request);
  if (bodyError) {
    return bodyError;
  }

  const nextPassword = String(data?.nextPassword || "");
  const confirmPassword = String(data?.confirmPassword || "");

  if (!nextPassword || !confirmPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "New password and confirmation are required.",
      },
      { status: 400 },
    );
  }

  if (nextPassword !== confirmPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "Your new password and confirmation do not match.",
      },
      { status: 400 },
    );
  }

  const hasRecoveryCookie = request.cookies.get(RECOVERY_COOKIE_KEY)?.value === "1";
  if (!hasRecoveryCookie) {
    return NextResponse.json(
      {
        success: false,
        message: "This reset link is no longer valid. Please request a new one.",
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        success: false,
        message: "This reset link is no longer valid. Please request a new one.",
      },
      { status: 401 },
    );
  }

  const passwordValidation = validateMemberPassword(nextPassword, {
    fullName: user.user_metadata?.full_name || user.user_metadata?.name || "",
    email: user.email || "",
  });

  if (!passwordValidation.valid) {
    return NextResponse.json(
      {
        success: false,
        message: passwordValidation.message,
      },
      { status: 400 },
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: nextPassword,
  });

  if (updateError) {
    return NextResponse.json(
      {
        success: false,
        message: "We could not set your new password right now.",
      },
      { status: 500 },
    );
  }

  await supabase.auth.signOut();

  const response = NextResponse.json({
    success: true,
    message: "Your password has been reset.",
    redirectTo: "/member-access?passwordReset=1",
  });
  response.cookies.set(RECOVERY_COOKIE_KEY, "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
