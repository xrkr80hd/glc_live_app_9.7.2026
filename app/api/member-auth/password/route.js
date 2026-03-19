import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/admin-api";
import { requireMemberSession, verifyCurrentMemberPassword } from "@/lib/member-auth";
import { validateMemberPassword } from "@/lib/security/password-policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request) {
  const { member, user, error } = await requireMemberSession();
  if (error) {
    return error;
  }

  const { data, error: bodyError } = await readJsonBody(request);
  if (bodyError) {
    return bodyError;
  }

  const currentPassword = String(data?.currentPassword || "");
  const nextPassword = String(data?.nextPassword || "");
  const confirmPassword = String(data?.confirmPassword || "");

  if (!currentPassword || !nextPassword || !confirmPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "Current password, new password, and confirmation are required.",
      },
      { status: 400 },
    );
  }

  if (nextPassword === currentPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "Choose a new password that is different from your current password.",
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

  const passwordValidation = validateMemberPassword(nextPassword, {
    fullName: member?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "",
    email: member?.email || user?.email || "",
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

  const isCurrentPasswordValid = await verifyCurrentMemberPassword(user.email, currentPassword);
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
      { success: false, message: "Supabase is not configured yet." },
      { status: 503 },
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: nextPassword,
  });

  if (updateError) {
    return NextResponse.json(
      { success: false, message: "We could not update your password right now." },
      { status: 500 },
    );
  }

  await supabase.auth.signOut();

  return NextResponse.json({
    success: true,
    message: "Your password has been updated. Sign in with your new password.",
    redirectTo: "/member-access?passwordReset=1",
  });
}
