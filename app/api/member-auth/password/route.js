import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/admin-api";
import { requireMemberSession, verifyCurrentMemberPassword } from "@/lib/member-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request) {
  const { user, error } = await requireMemberSession();
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

  if (nextPassword.length < 8) {
    return NextResponse.json(
      {
        success: false,
        message: "Use at least 8 characters for your new password.",
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

  return NextResponse.json({
    success: true,
    message: "Your password has been updated.",
  });
}
