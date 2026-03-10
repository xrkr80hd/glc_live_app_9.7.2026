import { NextResponse } from "next/server";
import { hashAdminPassword, hashPasswordResetToken } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body?.token || "").trim();
  const password = String(body?.password || "");

  if (!token) {
    return NextResponse.json({ success: false, message: "Reset token is required." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, message: "Supabase admin client is not configured." }, { status: 500 });
  }

  const tokenHash = hashPasswordResetToken(token);

  const { data: resetRow, error: lookupError } = await supabase
    .from("team_member_password_resets")
    .select("id, member_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError || !resetRow) {
    return NextResponse.json({ success: false, message: "Invalid or expired reset token." }, { status: 400 });
  }

  const expiresAtMs = new Date(resetRow.expires_at).getTime();
  if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) {
    await supabase
      .from("team_member_password_resets")
      .update({ used_at: new Date().toISOString() })
      .eq("id", resetRow.id);

    return NextResponse.json({ success: false, message: "Invalid or expired reset token." }, { status: 400 });
  }

  const passwordHash = hashAdminPassword(password);

  const { error: updateMemberError } = await supabase
    .from("team_members")
    .update({ password_hash: passwordHash })
    .eq("id", resetRow.member_id);

  if (updateMemberError) {
    return NextResponse.json({ success: false, message: updateMemberError.message }, { status: 400 });
  }

  await supabase
    .from("team_member_password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("member_id", resetRow.member_id)
    .is("used_at", null);

  return NextResponse.json({
    success: true,
    message: "Password reset successful. You can now sign in.",
  });
}
